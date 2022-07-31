import { UnsignedTransaction } from '@theorderbookdex/abi2ts-lib';
import { MethodTest } from '../contracts-ts/MethodTest';

// eslint-disable-next-line @typescript-eslint/ban-types
type ReturnType = string | Function;

interface Scenario {
    readonly only?: boolean;
    readonly description: string;
    readonly method: string;
    readonly args: unknown[];
    readonly readonly: boolean;
    readonly expectedReturnType?: ReturnType;
    call(): Promise<unknown>;
    sendTransaction(): Promise<string>;
    callStatic(): Promise<unknown>;
    populateTransaction(): Promise<UnsignedTransaction>;
    estimateGas(): Promise<unknown>;
    encode(): unknown;
    staticEncode(): unknown;
}

type Methods = MethodTest['encode'];

type MethodName = keyof Methods;

function fillInScenario<M extends MethodName>(method: M, ...args: Parameters<Methods[M]>) {
    return {
        method,
        args,
        async call() {
            const contract = await MethodTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract[method] as any)(...args);
        },
        async sendTransaction() {
            const contract = await MethodTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.sendTransaction as any)[method](...args);
        },
        async callStatic() {
            const contract = await MethodTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.callStatic as any)[method](...args);
        },
        async populateTransaction() {
            const contract = await MethodTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.populateTransaction as any)[method](...args);
        },
        async estimateGas() {
            const contract = await MethodTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.estimateGas as any)[method](...args);
        },
        encode() {
            const contract = MethodTest.at('0x0000000000000000000000000000000000000000');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (contract.encode as any)[method](...args);
        },
        staticEncode() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (MethodTest.encode as any)[method](...args);
        },
    };
}

export const methodScenarios: Scenario[] = [
    {
        description: 'method with no args and no return',
        readonly: false,
        ...fillInScenario('noArgsNoReturn'),
    },
    {
        description: 'method with no args and returns string',
        readonly: false,
        expectedReturnType: 'string',
        ...fillInScenario('noArgsReturnString'),
    },
    {
        description: 'readonly method with no args and returns string',
        readonly: true,
        expectedReturnType: 'string',
        ...fillInScenario('noArgsReturnStringReadOnly'),
    },
    {
        description: 'method with no args and returns uint256',
        readonly: false,
        expectedReturnType: 'bigint',
        ...fillInScenario('noArgsReturnUint256'),
    },
    {
        description: 'readonly method with no args and returns uint256',
        readonly: true,
        expectedReturnType: 'bigint',
        ...fillInScenario('noArgsReturnUint256ReadOnly'),
    },
    {
        description: 'method with one arg (string) and no return',
        readonly: false,
        ...fillInScenario('oneArgStringNoReturn', 'string'),
    },
    {
        description: 'method with one arg (string) and returns string',
        readonly: false,
        expectedReturnType: 'string',
        ...fillInScenario('oneArgStringReturnString', 'string'),
    },
    {
        description: 'readonly method with one arg (string) and returns string',
        readonly: true,
        expectedReturnType: 'string',
        ...fillInScenario('oneArgStringReturnStringReadOnly', 'string'),
    },
    {
        description: 'method with one arg (string) and returns uint256',
        readonly: false,
        expectedReturnType: 'bigint',
        ...fillInScenario('oneArgStringReturnUint256', 'string'),
    },
    {
        description: 'readonly method with one arg (string) and returns uint256',
        readonly: true,
        expectedReturnType: 'bigint',
        ...fillInScenario('oneArgStringReturnUint256ReadOnly', 'string'),
    },
    {
        description: 'method with one arg (uint256) and no return',
        readonly: false,
        ...fillInScenario('oneArgUint256NoReturn', 1n),
    },
    {
        description: 'method with one arg (uint256) and returns string',
        readonly: false,
        expectedReturnType: 'string',
        ...fillInScenario('oneArgUint256ReturnString', 1n),
    },
    {
        description: 'readonly method with one arg (uint256) and returns string',
        readonly: true,
        expectedReturnType: 'string',
        ...fillInScenario('oneArgUint256ReturnStringReadOnly', 1n),
    },
    {
        description: 'method with one arg (uint256) and returns uint256',
        readonly: false,
        expectedReturnType: 'bigint',
        ...fillInScenario('oneArgUint256ReturnUint256', 1n),
    },
    {
        description: 'readonly method with one arg (uint256) and returns uint256',
        readonly: true,
        expectedReturnType: 'bigint',
        ...fillInScenario('oneArgUint256ReturnUint256ReadOnly', 1n),
    },
];
