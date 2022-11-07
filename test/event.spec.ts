import { getBlockNumber } from '@frugal-wizard/abi2ts-lib';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { EventTest, NoArgsEvent, OneArgAddressEvent, OneArgIndexedAddressEvent, OneArgIndexedUint256Event, OneArgIndexedUint8Event, OneArgStringEvent, OneArgUint256Event, OneArgUint8Event } from './contracts-ts/EventTest';
import { setUpEthereum } from './provider';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('event', () => {
    before(() => {
        setUpEthereum();
    });

    describe('functions that emit event', () => {
        describe('function that emit no args event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitNoArgsEvent();
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(NoArgsEvent);
            });
        });

        describe('function that emit one arg (uint256) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgUint256Event(1n);
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgUint256Event);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgUint256Event(1n);
                expect((event as OneArgUint256Event).uint256Arg)
                    .to.be.equal(1n);
            });
        });

        describe('function that emit one arg (indexed uint256) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgIndexedUint256Event(1n);
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgIndexedUint256Event);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgIndexedUint256Event(1n);
                expect((event as OneArgIndexedUint256Event).uint256Arg)
                    .to.be.equal(1n);
            });
        });

        describe('function that emit one arg (uint8) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgUint8Event(1);
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgUint8Event);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgUint8Event(1);
                expect((event as OneArgUint8Event).uint8Arg)
                    .to.be.equal(1);
            });
        });

        describe('function that emit one arg (indexed uint8) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgIndexedUint8Event(1);
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgIndexedUint8Event);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgIndexedUint8Event(1);
                expect((event as OneArgIndexedUint8Event).uint8Arg)
                    .to.be.equal(1);
            });
        });

        describe('function that emit one arg (address) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgAddressEvent('0x1000000000000000000000000000000000000000');
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgAddressEvent);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgAddressEvent('0x1000000000000000000000000000000000000000');
                expect((event as OneArgAddressEvent).addressArg)
                    .to.be.equal('0x1000000000000000000000000000000000000000');
            });
        });

        describe('function that emit one arg (indexed address) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgIndexedAddressEvent('0x1000000000000000000000000000000000000000');
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgIndexedAddressEvent);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgIndexedAddressEvent('0x1000000000000000000000000000000000000000');
                expect((event as OneArgIndexedAddressEvent).addressArg)
                    .to.be.equal('0x1000000000000000000000000000000000000000');
            });
        });

        describe('function that emit one arg (address) event', () => {
            it('should emit expected event type', async () => {
                const { events } = await (await EventTest.deploy()).emitOneArgStringEvent('test');
                expect(events)
                    .to.have.length(1);
                expect(events[0])
                    .to.be.instanceOf(OneArgStringEvent);
            });

            it('should emit event with expected properties', async () => {
                const { events: [ event ] } = await (await EventTest.deploy()).emitOneArgStringEvent('test');
                expect((event as OneArgStringEvent).stringArg)
                    .to.be.equal('test');
            });
        });
    });

    describe('get events using filter', () => {
        before(async () => {
            const contract = await EventTest.deploy();
            await contract.emitOneArgIndexedUint256Event(1n);
            await contract.emitOneArgIndexedUint256Event(2n);
            await contract.emitOneArgIndexedUint8Event(1);
            await contract.emitOneArgIndexedUint8Event(2);
            await contract.emitOneArgIndexedAddressEvent('0x1000000000000000000000000000000000000000');
            await contract.emitOneArgIndexedAddressEvent('0x1000000000000000000000000000000000000001');
        });

        describe('get one arg (indexed uint256) event using filter', () => {
            it('should return the expected events', async () => {
                const lastBlock = await getBlockNumber();
                let count = 0;
                for await (const event of OneArgIndexedUint256Event.get({ fromBlock: lastBlock - 6, toBlock: lastBlock, uint256Arg: 1n })) {
                    expect(event.uint256Arg)
                        .to.be.equal(1n);
                    count++;
                }
                expect(count)
                    .to.be.equal(1);
            });
        });

        describe('get one arg (indexed uint8) event using filter', () => {
            it('should return the expected events', async () => {
                const lastBlock = await getBlockNumber();
                let count = 0;
                for await (const event of OneArgIndexedUint8Event.get({ fromBlock: lastBlock - 6, toBlock: lastBlock, uint8Arg: 1 })) {
                    expect(event.uint8Arg)
                        .to.be.equal(1);
                    count++;
                }
                expect(count)
                    .to.be.equal(1);
            });
        });

        describe('get one arg (indexed address) event using filter', () => {
            it('should return the expected events', async () => {
                const lastBlock = await getBlockNumber();
                let count = 0;
                for await (const event of OneArgIndexedAddressEvent.get({ fromBlock: lastBlock - 6, toBlock: lastBlock, addressArg: '0x1000000000000000000000000000000000000000' })) {
                    expect(event.addressArg)
                        .to.be.equal('0x1000000000000000000000000000000000000000');
                    count++;
                }
                expect(count)
                    .to.be.equal(1);
            });
        });
    });
});
