import { Transaction, UnsignedTransaction } from '@frugalwizard/abi2ts-lib';
import { OverloadTest } from '../contracts-ts/OverloadTest';

interface Scenario {
    readonly only?: boolean;
    readonly description: string;
    readonly method: string;
    readonly args: unknown[];
    call(): Promise<Transaction>;
    sendTransaction(): Promise<string>;
    callStatic(): Promise<string>;
    populateTransaction(): Promise<UnsignedTransaction>;
    estimateGas(): Promise<number>;
    encode(): string;
    staticEncode(): string;
}

type Methods = OverloadTest['encode'];

type MethodName = keyof Methods;

function fillInScenario<M extends MethodName>(method: M, ...args: Parameters<Methods[M]>) {
    return {
        method,
        args,
        async call() {
            const contract = await OverloadTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract[method] as any)(...args);
        },
        async sendTransaction() {
            const contract = await OverloadTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.sendTransaction as any)[method](...args);
        },
        async callStatic() {
            const contract = await OverloadTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.callStatic as any)[method](...args);
        },
        async populateTransaction() {
            const contract = await OverloadTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.populateTransaction as any)[method](...args);
        },
        async estimateGas() {
            const contract = await OverloadTest.deploy();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (contract.estimateGas as any)[method](...args);
        },
        encode() {
            const contract = OverloadTest.at('0x0000000000000000000000000000000000000000');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (contract.encode as any)[method](...args);
        },
        staticEncode() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (OverloadTest.encode as any)[method](...args);
        },
    };
}

export const overloadScenarios: Scenario[] = [
    {
        description: 'call overloaded()',
        ...fillInScenario('overloaded()'),
    },
    {
        description: 'call overloaded(uint256)',
        ...fillInScenario('overloaded(uint256)', 1n),
    },
    {
        description: 'call overloaded(uint256,uint256)',
        ...fillInScenario('overloaded(uint256,uint256)', 1n, 2n),
    },
    {
        description: 'call overloaded(string)',
        ...fillInScenario('overloaded(string)', '1'),
    },
    {
        description: 'call overloaded(bytes)',
        ...fillInScenario('overloaded(bytes)', '0x01'),
    },
];
