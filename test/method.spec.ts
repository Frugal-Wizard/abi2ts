import { createSigner, parseValue, Transaction } from '@theorderbookdex/abi2ts-lib';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import addContext from 'mochawesome/addContext';
import { inspect } from 'util';
import { setAccountBalance, setUpEthereum } from './provider';
import { methodScenarios } from './scenarios/method';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('method', function() {
    before(function() {
        setUpEthereum();
    });

    for (const scenario of methodScenarios) {
        (scenario.only ? describe.only : describe)(scenario.description, function() {
            beforeEach(async function() {
                addContext(this, {
                    title: 'method',
                    value: scenario.method,
                });
                addContext(this, {
                    title: 'args',
                    value: inspect(scenario.args),
                });
                addContext(this, {
                    title: 'readonly',
                    value: scenario.readonly,
                });
                if (scenario.expectedReturnType) {
                    addContext(this, {
                        title: 'expectedReturnType',
                        value: typeof scenario.expectedReturnType == 'string' ? scenario.expectedReturnType : scenario.expectedReturnType.name,
                    });
                }
            });

            describe('call', function() {
                it('should work', async function() {
                    await scenario.call();
                });

                if (!scenario.readonly || scenario.expectedReturnType) {
                    it('should return expected type', async function() {
                        if (scenario.readonly) {
                            if (typeof scenario.expectedReturnType == 'string') {
                                expect(await scenario.call())
                                    .to.be.a(scenario.expectedReturnType);
                            } else {
                                expect(await scenario.call())
                                    .to.be.an.instanceOf(scenario.expectedReturnType);
                            }
                        } else {
                            expect(await scenario.call())
                                .to.be.an.instanceOf(Transaction);
                        }
                    });
                }
            });

            if (!scenario.readonly) {
                describe('sendTransaction', function() {
                    it('should work', async function() {
                        await scenario.sendTransaction();
                    });
    
                    it('should return a transaction hash', async function() {
                        await Transaction.get(await scenario.sendTransaction());
                    });
                });
            }

            describe('callStatic', function() {
                it('should work', async function() {
                    await scenario.callStatic();
                });

                if (scenario.expectedReturnType) {
                    it('should return expected type', async function() {
                        if (typeof scenario.expectedReturnType == 'string') {
                            expect(await scenario.callStatic())
                                .to.be.a(scenario.expectedReturnType);
                        } else {
                            expect(await scenario.callStatic())
                                .to.be.an.instanceOf(scenario.expectedReturnType);
                        }
                    });
                }
            });

            describe('populateTransaction', function() {
                it('should work', async function() {
                    await scenario.populateTransaction();
                });

                it('should be sendable through signer', async function() {
                    const signer = await createSigner();
                    await setAccountBalance(signer.address, parseValue(1000));
                    await signer.sendTransaction(await scenario.populateTransaction());
                });
            });

            describe('estimateGas', function() {
                it('should work', async function() {
                    await scenario.estimateGas();
                });

                it('should return expected type', async function() {
                    expect(await scenario.estimateGas())
                        .to.be.a('bigint');
                });
            });

            describe('encode', function() {
                it('should work', async function() {
                    await scenario.encode();
                });

                it('should return expected type', async function() {
                    expect(await scenario.encode())
                        .to.be.a('string');
                });
            });

            describe('staticEncode', function() {
                it('should work', async function() {
                    await scenario.staticEncode();
                });

                it('should return expected type', async function() {
                    expect(await scenario.staticEncode())
                        .to.be.a('string');
                });
            });
        });
    }
});
