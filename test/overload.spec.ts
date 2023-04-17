import { abidecode, createSigner, parseValue, Transaction } from '@frugalwizard/abi2ts-lib';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import addContext from 'mochawesome/addContext';
import { inspect } from 'util';
import { setAccountBalance, setUpEthereum } from './provider';
import { overloadScenarios } from './scenarios/overload';
import { Called } from './contracts-ts/OverloadTest';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('overload', function() {
    before(function() {
        setUpEthereum();
    });

    for (const scenario of overloadScenarios) {
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
            });

            describe('call', function() {
                it('should work', async function() {
                    const { events } = await scenario.call();
                    expect(events).to.have.length(1);
                    expect(events[0])
                        .to.be.instanceOf(Called)
                        .and.satisfy(({ method, data }: Called) => {
                            expect(method).to.be.equal(scenario.method);
                            expect(data).to.be.equal(scenario.encode());
                            return true;
                        });
                });
            });

            describe('sendTransaction', function() {
                it('should work', async function() {
                    const { events } = await Transaction.get(await scenario.sendTransaction());
                    expect(events).to.have.length(1);
                    expect(events[0])
                        .to.be.instanceOf(Called)
                        .and.satisfy(({ method, data }: Called) => {
                            expect(method).to.be.equal(scenario.method);
                            expect(data).to.be.equal(scenario.encode());
                            return true;
                        });
                });
            });

            describe('callStatic', function() {
                it('should work', async function() {
                    const [ method, data ] = abidecode(['string', 'bytes'], await scenario.callStatic()) as [ string, string ];
                    expect(method).to.be.equal(scenario.method);
                    expect(data).to.be.equal(scenario.encode());
                });
            });

            describe('populateTransaction', function() {
                it('should work', async function() {
                    const signer = await createSigner();
                    await setAccountBalance(signer.address, parseValue(1000));
                    const { events } = await signer.sendTransaction(await scenario.populateTransaction());
                    expect(events).to.have.length(1);
                    expect(events[0])
                        .to.be.instanceOf(Called)
                        .and.satisfy(({ method, data }: Called) => {
                            expect(method).to.be.equal(scenario.method);
                            expect(data).to.be.equal(scenario.encode());
                            return true;
                        });
                });
            });

            describe('estimateGas', function() {
                it('should work', async function() {
                    await scenario.estimateGas();
                });
            });

            describe('staticEncode', function() {
                it('should work', async function() {
                    expect(scenario.staticEncode())
                        .to.be.equal(scenario.encode());
                });
            });
        });
    }
});
