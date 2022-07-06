import { getAccounts, ZERO_ADDRESS } from 'abi2ts-lib';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ConstructorNoArgs } from './contracts-ts/ConstructorTest';
import { MethodTest } from './contracts-ts/MethodTest';
import { setUpEthereum } from './provider';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('override', function() {
    before(function() {
        setUpEthereum();
    });

    describe('from', function() {
        describe('deploy', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await ConstructorNoArgs.deploy({ from });
            });
        });

        describe('callStatic.deploy', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await ConstructorNoArgs.callStatic.deploy({ from });
            });
        });

        describe('method call', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await (await MethodTest.deploy()).noArgsReturnString({ from });
            });
        });

        describe('readonly method call', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await (await MethodTest.deploy()).noArgsReturnStringReadOnly({ from });
            });
        });

        describe('readonly method call from zero address', function() {
            it('should work', async function() {
                const from = ZERO_ADDRESS;
                await (await MethodTest.deploy()).noArgsReturnStringReadOnly({ from });
            });
        });

        describe('method callStatic', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await (await MethodTest.deploy()).callStatic.noArgsReturnString({ from });
            });
        });

        describe('method estimateGas', function() {
            it('should work', async function() {
                const [ , from ] = await getAccounts();
                await (await MethodTest.deploy()).estimateGas.noArgsReturnString({ from });
            });
        });
    });
});
