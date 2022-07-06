import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import addContext from 'mochawesome/addContext';
import { deployScenarios } from './scenarios/deploy';
import { inspect } from 'util';
import { setAccountBalance, setUpEthereum } from './provider';
import { createSigner, parseValue } from 'abi2ts-lib';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('constructor', function() {
    before(function() {
        setUpEthereum();
    });

    for (const scenario of deployScenarios) {
        (scenario.only ? describe.only : describe)(scenario.description, function() {
            beforeEach(async function() {
                if (scenario.expectedError) {
                    addContext(this, {
                        title: 'expectedError',
                        value: scenario.expectedError.name,
                    });
                }
                addContext(this, {
                    title: 'contract',
                    value: scenario.contract,
                });
                addContext(this, {
                    title: 'args',
                    value: inspect(scenario.args),
                });
            });

            describe('deploy', function() {
                if (scenario.expectedError) {
                    it('should fail', async function() {
                        await expect(scenario.deploy())
                            .to.be.rejected;
                    });

                } else {
                    it('should work', async function() {
                        await scenario.deploy();
                    });
                }
            });

            describe('callStatic.deploy', function() {
                if (scenario.expectedError) {
                    const error = scenario.expectedError;
                    it('should fail with expected error', async function() {
                        await expect(scenario.deployStatic())
                            .to.be.rejectedWith(error);
                    });

                } else {
                    it('should work', async function() {
                        await scenario.deployStatic();
                    });
                }
            });

            describe('populateTransaction.deploy', function() {
                it('should work', async function() {
                    await scenario.populateTransaction();
                });

                if (!scenario.expectedError) {
                    it('should be sendable through signer', async function() {
                        const signer = await createSigner();
                        await setAccountBalance(signer.address, parseValue(1000));
                        await signer.sendTransaction(await scenario.populateTransaction());
                    });
                }
            });
        });
    }
});
