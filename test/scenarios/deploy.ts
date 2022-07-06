import { DefaultError, UnsignedTransaction } from 'abi2ts-lib';
import { ConstructorNoArgs, ConstructorOneArgString, ConstructorOneArgUint256, ConstructorThrowsError } from '../contracts-ts/ConstructorTest';

interface Scenario {
    readonly only?: boolean;
    readonly description: string;
    readonly expectedError?: { new(...args: never[]): Error }
    readonly contract: string;
    readonly args: unknown[];
    deploy(): Promise<unknown>;
    deployStatic(): Promise<string>;
    populateTransaction(): Promise<UnsignedTransaction>;
}

interface Contract<Args extends unknown[]> {
    name: string;
    deploy(...args: Args): Promise<unknown>;
    callStatic: {
        deploy(...args: Args): Promise<string>;
    };
    populateTransaction: {
        deploy(...args: Args): Promise<UnsignedTransaction>;
    };
}

function fillInScenario<C extends Contract<A>, A extends unknown[]>(contract: C, ...args: A) {
    return {
        contract: contract.name,
        args,
        async deploy() {
            return await contract.deploy(...args);
        },
        async deployStatic() {
            return await contract.callStatic.deploy(...args);
        },
        async populateTransaction() {
            return await contract.populateTransaction.deploy(...args);
        },
    }
}

export const deployScenarios: Scenario[] = [
    {
        description: 'constructor with no args',
        ...fillInScenario(ConstructorNoArgs),
    },
    {
        description: 'constructor with one arg (uint256)',
        ...fillInScenario(ConstructorOneArgUint256, 1n),
    },
    {
        description: 'constructor with one arg (string)',
        ...fillInScenario(ConstructorOneArgString, 'test'),
    },
    {
        description: 'constructor that throws error',
        expectedError: DefaultError,
        ...fillInScenario(ConstructorThrowsError),
    },
];
