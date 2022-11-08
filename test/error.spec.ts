import { decodeErrorData, DefaultError, OutOfGas, RevertWithoutReason } from '@frugal-wizard/abi2ts-lib';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ErrorTest, NoArgsError, OneArgStringError, OneArgUint256Error } from './contracts-ts/ErrorTest';
import { setUpEthereum } from './provider';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('error', () => {
    before(setUpEthereum);

    describe('functions that revert', () => {
        describe('function that reverts with default error', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithDefaultError())
                    .to.be.rejectedWith(DefaultError)
                    .that.eventually.has.property('reason', 'error');
            });
        });

        describe('function that reverts with default error', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithoutReason())
                    .to.be.rejectedWith(RevertWithoutReason);
            });
        });

        describe('function that reverts with no args error', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithNoArgsError())
                    .to.be.rejectedWith(NoArgsError);
            });
        });

        describe('function that reverts with one arg (uint256) error', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithOneArgUint256Error())
                    .to.be.rejectedWith(OneArgUint256Error)
                    .that.eventually.has.property('uint256Arg', 1n);
            });
        });

        describe('function that reverts with one arg (string) error', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithOneArgStringError())
                    .to.be.rejectedWith(OneArgStringError)
                    .that.eventually.has.property('stringArg', 'error');
            });
        });
    });

    describe('other errors', () => {
        describe('call without enough gas', () => {
            it('should revert with expected error', async () => {
                await expect((await ErrorTest.deploy()).revertWithDefaultError({ gasLimit: 1n }))
                    .to.be.rejectedWith(OutOfGas);
            });
        });
    });

    describe('encode', () => {
        describe('default error', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new DefaultError('error').encode());
                expect(error)
                    .to.be.instanceOf(DefaultError)
                    .that.has.property('reason', 'error');
            });
        });

        describe('revert without reason', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new RevertWithoutReason().encode());
                expect(error)
                    .to.be.instanceOf(RevertWithoutReason);
            });
        });

        describe('no args error', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new NoArgsError().encode());
                expect(error)
                    .to.be.instanceOf(NoArgsError);
            });
        });

        describe('one arg (uint256) error', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new OneArgUint256Error(1n).encode());
                expect(error)
                    .to.be.instanceOf(OneArgUint256Error)
                    .that.has.property('uint256Arg', 1n);
            });
        });

        describe('one arg (uint256) error', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new OneArgStringError('error').encode());
                expect(error)
                    .to.be.instanceOf(OneArgStringError)
                    .that.has.property('stringArg', 'error');
            });
        });
    });
});
