import { getAccounts, ZERO_ADDRESS } from '@frugal-wizard/abi2ts-lib';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SenderTest, SenderAddress } from './contracts-ts/SenderTest';
import { setUpEthereum } from './provider';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('sender', () => {
    before(() => {
        setUpEthereum();
    });

    describe('using main account', () => {
        describe('method call', () => {
            it('should emit event with correct address', async () => {
                const [ from ] = await getAccounts();
                const { events: [ event ] } = await (await SenderTest.deploy()).senderAddress();
                expect(event).to.exist;
                expect(event).to.be.instanceOf(SenderAddress);
                expect((event as SenderAddress).senderAddress)
                    .to.be.equal(from);
            });
        });

        describe('method callStatic', () => {
            it('should return correct address', async () => {
                const [ from ] = await getAccounts();
                expect(await (await SenderTest.deploy()).callStatic.senderAddress())
                    .to.be.equal(from);
            });
        });

        describe('method populateTransaction', () => {
            it('should create transaction with no address', async () => {
                const tx = await (await SenderTest.deploy()).populateTransaction.senderAddress();
                expect(tx.from)
                    .to.be.undefined;
            });
        });
    });

    describe('using second account', () => {
        describe('method call', () => {
            it('should emit event with correct address', async () => {
                const [ , from ] = await getAccounts();
                const { events: [ event ] } = await (await SenderTest.deploy()).senderAddress({ from });
                expect(event).to.exist;
                expect(event).to.be.instanceOf(SenderAddress);
                expect((event as SenderAddress).senderAddress)
                    .to.be.equal(from);
            });
        });

        describe('method callStatic', () => {
            it('should return correct address', async () => {
                const [ , from ] = await getAccounts();
                expect(await (await SenderTest.deploy()).callStatic.senderAddress({ from }))
                    .to.be.equal(from);
            });
        });

        describe('method populateTransaction', () => {
            it('should create transaction with correct address', async () => {
                const [ , from ] = await getAccounts();
                const tx = await (await SenderTest.deploy()).populateTransaction.senderAddress({ from });
                expect(tx.from)
                    .to.be.equal(from);
            });
        });
    });

    describe('using zero address', () => {
        describe('method callStatic', () => {
            it('should return correct address', async () => {
                expect(await (await SenderTest.deploy()).callStatic.senderAddress({ from: ZERO_ADDRESS }))
                    .to.be.equal(ZERO_ADDRESS);
            });
        });

        describe('method populateTransaction', () => {
            it('should create transaction with correct address', async () => {
                const tx = await (await SenderTest.deploy()).populateTransaction.senderAddress({ from: ZERO_ADDRESS });
                expect(tx.from)
                    .to.be.equal(ZERO_ADDRESS);
            });
        });
    });
});
