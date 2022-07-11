import { parseCompiledSolidity } from './parse';
import { ArgData, ContractData, findStructs, LinkArgData, StructsData, transformConstructor, transformError, transformEvent, transformFunction } from './process';

function declareArgs(args: (ArgData | LinkArgData)[], includeOverrides = false) {
    return args
        .map(({ name, type, defaultValue }) => `${name}: ${type.user}${ defaultValue ? ` = ${defaultValue}` : '' }`)
        .concat(includeOverrides ? 'overrides: abi2tsLib.CallOverrides = {}' : '')
        .join(', ');
}

function declareApiArgs(args: ArgData[]) {
    return args.map(({ name, type }) => `${name}: ${type.api}`).join(', ');
}

function usr2apiArgs(args: ArgData[]) {
    return args.map(({ name, type }) => type.int2api(type.usr2int(name))).join(', ');
}

function linkArgsObject(linkArgs: LinkArgData[]) {
    return `{ ${ linkArgs.map(({ name, placeholder }) => `'${placeholder}': ${name}`).join(', ')} }`;
}

function argsArray(args: ArgData[]) {
    return `[ ${usr2apiArgs(args)} ]`;
}

export function abi2ts(jsonContents: Buffer): Buffer {
    const structs: StructsData = {};
    const contracts: ContractData[] = [];
    for (const [ className, { abi, evm: { bytecode: { object: bytecode, linkReferences } } } ] of Object.entries(parseCompiledSolidity(jsonContents.toString()))) {
        findStructs(abi, structs);
        const constructorDef = abi.find(({ type }) => type == 'constructor') || { type: 'constructor' };
        const { deployArgs, linkArgs, ctorArgs } = transformConstructor({ ...constructorDef, linkReferences });
        const errors = abi.filter(({ type }) => type == 'error').map(transformError);
        const events = abi.filter(({ type }) => type == 'event').map(transformEvent);
        const functions = abi.filter(({ type }) => type == 'function').map(transformFunction);
        contracts.push({ className, abi, bytecode, deployArgs, linkArgs, ctorArgs, errors, events, functions });
    }
    return Buffer.from(`
import * as ethers from 'ethers';
import * as abi2tsLib from '@theorderbookdex/abi2ts-lib';

${ Object.entries(structs).map(([ structName, fields ]) => `
export class ${structName} {${ fields.map(({ name, type }) => `
    ${name}: ${type.internal};
`).join('') }
    constructor(${declareArgs(fields)}) {${ fields.map(({ name, type }) => `
        this.${name} = ${type.usr2int(name)};`).join('') }
    }
}
`).join('') }

${ contracts.map(({ className, abi, bytecode, deployArgs, linkArgs, ctorArgs, errors, events, functions }) => `
export class ${className} extends abi2tsLib.Contract {
    static readonly ABI = ${JSON.stringify(abi)};

    static readonly BYTECODE = '${bytecode}';

    private static readonly _interface = new ethers.utils.Interface(this.ABI);

${ bytecode ? `
    static async deploy(${declareArgs(deployArgs, true)}): Promise<${className}> {
        return await this._deploy(${linkArgsObject(linkArgs)}, ${argsArray(ctorArgs)}, overrides);
    }

    static readonly callStatic = {
        deploy: async (${declareArgs(deployArgs, true)}): Promise<string> => {
            return await this._deployStatic(${linkArgsObject(linkArgs)}, ${argsArray(ctorArgs)}, overrides);
        }
    };

    static readonly populateTransaction = {
        deploy: async (${declareArgs(deployArgs, true)}): Promise<abi2tsLib.UnsignedTransaction> => {
            return await this._deployPopulateTransaction(${linkArgsObject(linkArgs)}, ${argsArray(ctorArgs)}, overrides);
        }
    };
`: '' }

${ functions.map(({ read, name, args, returnType }) => read ? `
    async ${name}(${declareArgs(args, true)}): Promise<${returnType.internal}> {
        return ${ returnType.api2int(`await this._callStatic('${name}', ${argsArray(args)}, overrides)` )};
    }
` : `
    async ${name}(${declareArgs(args, true)}): Promise<abi2tsLib.Transaction> {
        return await this._call('${name}', ${argsArray(args)}, overrides);
    }
`).join('') }

    readonly callStatic = {
${ functions.map(({ name, args, returnType }) => `
        ${name}: async (${declareArgs(args, true)}): Promise<${returnType.internal}> => {
            return ${ returnType.api2int(`await this._callStatic('${name}', ${argsArray(args)}, overrides)` )};
        },
`).join('') }
    };

    readonly populateTransaction = {
${ functions.map(({ name, args }) => `
        ${name}: async (${declareArgs(args, true)}): Promise<abi2tsLib.UnsignedTransaction> => {
            return await this._populateTransaction('${name}', ${argsArray(args)}, overrides);
        },
`).join('') }
    };

    readonly estimateGas = {
${ functions.map(({ name, args }) => `
        ${name}: async (${declareArgs(args, true)}): Promise<bigint> => {
            return await this._estimateGas('${name}', ${argsArray(args)}, overrides);
        },
`).join('') }
    };

    static readonly encode = {
${ functions.map(({ name, args }) => `
        ${name}: (${declareArgs(args)}): string => {
            return this._encode('${name}', ${argsArray(args)});
        },
`).join('') }
    };

    readonly encode = ${className}.encode;
}

${ events.map(({ name, sig, topic, args }) => `
export interface ${name}Filter {
    address?: string;
    fromBlock?: number;
    toBlock?: number;${ args.filter(({ indexed }) => indexed).map(({ name, type }) => `
    ${name}?: ${type.user};`).join('') }
}

export class ${name} extends abi2tsLib.ContractEvent {
    static async * get(filter: ${name}Filter = {}): AsyncIterable<${name}> {
        for (const log of await abi2tsLib.getLogs({ address: filter.address, fromBlock: filter.fromBlock, toBlock: filter.toBlock, topics: [ ${name}.TOPIC${ args.filter(({ indexed }) => indexed).map(({ name, type }) => `, filter.${name} === undefined ? null : ${type.int2topic(type.usr2int(`filter.${name}`))}`).join('') } ] })) {
            yield abi2tsLib.ContractEvent.decode(log) as ${name};
        }
    }

    static [Symbol.hasInstance](instance: unknown) {
        return instance instanceof abi2tsLib.ContractEvent && instance.sig === ${name}.SIG;
    }

    static readonly SIG = '${sig}';

    static readonly TOPIC = '${topic}';

    get name() {
        return '${name}';
    }

    get sig() {
        return ${name}.SIG;
    }

    private get decodedLog() {
        const fragment = ethers.utils.Fragment.from(this.sig) as ethers.utils.EventFragment;
        return new ethers.utils.Interface([ fragment ]).decodeEventLog(fragment, this.log.data, this.log.topics);
    }
${ args.map(({ name, type }, index) => `
    get ${name}(): ${type.internal} {
        return ${type.api2int(`this.decodedLog[${index}]`)};
    }
`).join('') }
}

abi2tsLib.ContractEvent.register(${name});
`).join('') }

${ errors.map(({ name, sig, args }) => `
export class ${name} extends abi2tsLib.ContractError {
    static [Symbol.hasInstance](instance: unknown) {
        return instance instanceof abi2tsLib.ContractError && instance.sig === ${name}.SIG;
    }

    static readonly SIG = '${sig}';

    get sig() {
        return ${name}.SIG;
    }
${ args.map(({ name, type }) => `
    readonly ${name}: ${type.internal};
`).join('') }
    constructor(${declareArgs(args)}) {
        super(\`${name}(${ args.map(({ name }) => `\${${name}}`).join(', ') })\`);
        this.name = '${name}';${ args.map(({ name, type }) => `
        this.${name} = ${type.usr2int(name)};`).join('') }
    }
}

abi2tsLib.registerError({
    sig: ${name}.SIG,
    factory(${declareApiArgs(args)}) {
        return new ${name}(${ args.map(({ name, type }) => type.api2int(name)).join(', ') });
    },
    encode(error: ${name}) {
        return [ ${ args.map(({ name, type }) => type.int2api(`error.${name}`)).join(', ') } ];
    },
});
`).join('') }
`).join('') }
`);
}
