import * as ethers from 'ethers';
import { ABI, ABIDefinition, ABITypeDefinition, LinkReferences } from './parse';

const { utils: { FormatTypes, keccak256, toUtf8Bytes } } = ethers;

const IDENTITY = <T>(value: T) => value;
const FAIL = () => { throw new Error; };

export interface TypeData {
    api:       string,
    internal:  string,
    user:      string,
    api2int:   (value: string) => string,
    int2api:   (value: string) => string,
    usr2int:   (value: string) => string,
    int2topic: (value: string) => string,
}

export interface ArgData {
    name:          string,
    type:          TypeData,
    defaultValue?: string,
    indexed?:      boolean,
}

export interface LinkArgData {
    name:          string,
    type:          { user: string },
    defaultValue?: string,
    placeholder:   string,
}

export interface FunctionData {
    name:       string,
    read:       boolean,
    write:      boolean,
    args:       ArgData[],
    returnType: TypeData,
}

export interface ErrorData {
    name: string,
    sig: string,
    types: string[],
    args: ArgData[],
}

export interface StructsData {
    [structName: string]: ArgData[],
}

export interface ContractData {
    className:  string,
    abi:        ABI,
    bytecode:   string,
    deployArgs: (ArgData | LinkArgData)[],
    linkArgs:   LinkArgData[],
    ctorArgs:   ArgData[],
    errors:     ErrorData[],
    events:     EventData[],
    functions:  FunctionData[],
}

export function findStructs(abi: ABI, structs: StructsData): void {
    const searched = [ 'constructor', 'error', 'event', 'function' ];
    for (const { inputs = [], outputs = [] } of abi.filter(({ type }) => searched.includes(type))) {
        for (const type of [ ...inputs,  ...outputs]) {
            findStructsInTypes(type, structs);
        }
    }
}

function findStructsInTypes({ internalType = '', components = [] }: ABITypeDefinition, structs: StructsData): void {
    for (const component of components) {
        findStructsInTypes(component, structs);
    }
    if (internalType.startsWith('struct ')) {
        while (internalType.endsWith('[]')) {
            internalType = internalType.slice(0, -2);
        }
        const structName = internalType.substring(7).replace('.', '');
        if (!structs[structName]) {
            structs[structName] = components.map(transformInput);
        }
    }
}

export function transformFunction({ name = '', stateMutability, inputs = [], outputs = [] }: ABIDefinition): FunctionData {
    let read = false;
    let write = false;
    switch (stateMutability) {
        case 'pure':
        case 'view':
            read = true;
            break;
        case 'payable':
        case 'nonpayable':
            write = true;
            break;
    }
    const args = inputs.map(transformInput);
    const returnType = transformOutputs(outputs);
    return {
        name,
        read,
        write,
        args,
        returnType,
    };
}

export function transformError({ name = '', inputs = [] }: ABIDefinition): ErrorData {
    const types = inputs.map(({ type }) => type);
    const sig = `${name}(${ types.join(',') })`;
    const args = [ ...inputs.map(transformInput) ];
    return {
        name,
        sig,
        types,
        args
    };
}

export interface EventData {
    name: string,
    sig: string,
    topic: string,
    args: ArgData[],
}

export function transformEvent(event: ABIDefinition): EventData {
    const { name = '', inputs = [] } = event;
    const fragment = ethers.utils.Fragment.from(event) as ethers.utils.EventFragment;
    const sig = fragment.format(FormatTypes.minimal);
    const topic = new ethers.utils.Interface([ fragment ]).getEventTopic(fragment);
    const args = [ ...inputs.map(transformInput) ];
    return {
        name,
        sig,
        topic,
        args
    };
}

export interface ConstructorData {
    deployArgs: (ArgData | LinkArgData)[],
    ctorArgs: ArgData[],
    linkArgs: LinkArgData[],
}

export function transformConstructor({ inputs = [], linkReferences }: ABIDefinition & { linkReferences: LinkReferences }): ConstructorData {
    const ctorArgs = inputs.map(transformInput);
    const linkArgs: LinkArgData[] = [];
    for (const [ sourceFile, sourceFileLinkReferences ] of Object.entries(linkReferences)) {
        for (const libraryName of Object.keys(sourceFileLinkReferences)) {
            const name = libraryName.replace(/^./, char => char.toLowerCase());
            const placeholder = `__$${ keccak256(toUtf8Bytes(`${sourceFile}:${libraryName}`)).slice(2, 36) }$__`;
            linkArgs.push({
                name,
                type: { user: 'Address' },
                placeholder,
            });
        }
    }
    return {
        deployArgs: [ ...linkArgs, ...ctorArgs ],
        ctorArgs,
        linkArgs,
    };
}

function transformInput(input: ABITypeDefinition, n: number): ArgData {
    const name = (input.name || `arg${n}`).replace(/_$/, '');
    const type = transformType(input);
    const indexed = input.indexed;
    return {
        name,
        type,
        indexed,
    };
}

function transformOutputs(outputs: ABITypeDefinition[]): TypeData {
    if (outputs.length > 0) {
        const outputType = outputs.length > 1 ? { type: 'tuple', components: outputs } : outputs[0];
        return transformType(outputType);
    } else {
        return {
            api:       'void',
            internal:  'void',
            user:      'void',
            api2int:   IDENTITY,
            int2api:   IDENTITY,
            usr2int:   IDENTITY,
            int2topic: FAIL,
        }
    }
}

function transformType({ type, internalType = '', components = [] }: ABITypeDefinition): TypeData {
    if (type.endsWith('[]')) {
        const innerType = transformType({ type: type.slice(0, -2), components });
        return {
            api:       `${innerType.api}[]`,
            internal:  `${innerType.internal}[]`,
            user:      `${innerType.user}[]`,
            api2int:   innerType.api2int == IDENTITY ? IDENTITY : value => `(${value}).map((v:any)=>${ innerType.api2int('v') })`,
            int2api:   innerType.int2api == IDENTITY ? IDENTITY : value => `(${value}).map((v:any)=>${ innerType.int2api('v') })`,
            usr2int:   innerType.usr2int == IDENTITY ? IDENTITY : value => `(${value}).map((v:any)=>${ innerType.usr2int('v') })`,
            int2topic: FAIL,
        };
    }
    if (type.startsWith('uint')) {
        switch (type) {
            case 'uint8':
                return {
                    api:       'number',
                    internal:  'number',
                    user:      'number',
                    api2int:   IDENTITY,
                    int2api:   IDENTITY,
                    usr2int:   IDENTITY,
                    int2topic: value => `abi2tsLib.hexstringPad(abi2tsLib.hexstring(${value}), 64)`,
                };
            default:
                return {
                    api:       'abi2tsLib.BigNumberish',
                    internal:  'bigint',
                    user:      'bigint',
                    api2int:   value => `BigInt(String(${value}))`,
                    int2api:   IDENTITY,
                    usr2int:   IDENTITY,
                    int2topic: value => `abi2tsLib.hexstringPad(abi2tsLib.hexstring(${value}), 64)`,
                };
        }
    }
    switch (type) {
        case 'address':
            return {
                api:       'string',
                internal:  'abi2tsLib.Address',
                user:      'abi2tsLib.Address | abi2tsLib.HasAddress',
                api2int:   IDENTITY,
                int2api:   IDENTITY,
                usr2int:   value => `(typeof ${value} == 'object' ? ${value}.address : ${value})`,
                int2topic: value => `abi2tsLib.hexstringPad(${value}, 64)`,
            };
        case 'bool':
            return {
                api:       'boolean',
                internal:  'boolean',
                user:      'boolean',
                api2int:   IDENTITY,
                int2api:   IDENTITY,
                usr2int:   IDENTITY,
                int2topic: FAIL,
            };
        case 'tuple': {
            const innerTypes = components.map(transformType);
            if (internalType.startsWith('struct ')) {
                const structName = internalType.substring(7).replace('.', '');
                return {
                    api:       `[${ innerTypes.map(({ api }) => api).join(', ') }]`,
                    internal:  structName,
                    user:      structName,
                    api2int:   value => `((v:any)=>new ${structName}(${ innerTypes.map(({ api2int }, i) => api2int(`v[${i}]`)) }))(${value})`,
                    int2api:   value => `((v:any)=>[${ innerTypes.map(({ int2api }, i) => int2api(`v[${i}]`)) }])(Object.values(${value}))`,
                    usr2int:   IDENTITY,
                    int2topic: FAIL,
                };
            } else {
                return {
                    api:       `[${ innerTypes.map(({ api }) => api).join(', ') }]`,
                    internal:  `[${ innerTypes.map(({ internal }) => internal).join(', ') }]`,
                    user:      `[${ innerTypes.map(({ user }) => user).join(', ') }]`,
                    api2int:   innerTypes.every(({ api2int }) => api2int == IDENTITY) ? IDENTITY :
                                   value => `((v:any)=>[${ innerTypes.map(({ api2int }, i) => api2int(`v[${i}]`)) }])(${value})`,
                    int2api:   innerTypes.every(({ int2api }) => int2api == IDENTITY) ? IDENTITY :
                                   value => `((v:any)=>[${ innerTypes.map(({ int2api }, i) => int2api(`v[${i}]`)) }])(${value})`,
                    usr2int:   innerTypes.every(({ usr2int }) => usr2int == IDENTITY) ? IDENTITY :
                                   value => `((v:any)=>[${ innerTypes.map(({ usr2int }, i) => usr2int(`v[${i}]`)) }])(${value})`,
                    int2topic: FAIL,
                };
            }
        }
        default:
            return {
                api:       'string',
                internal:  'string',
                user:      'string',
                api2int:   IDENTITY,
                int2api:   IDENTITY,
                usr2int:   IDENTITY,
                int2topic: FAIL,
            };
    }
}
