import { decodeErrorData } from '@frugal-wizard/abi2ts-lib';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ErrorTest, NoArgsError, OneArgStringError, OneArgUint256Error } from './contracts-ts/ErrorTest';
import { setUpEthereum } from './provider';

use(chaiAsPromised);

// TODO tests are too simple since we are only wrapping ethers, but should be more thorough for when we stop using it

describe('error', () => {
    before(() => {
        setUpEthereum();
    });

    describe('functions that throw', () => {
        describe('function that throws no args error', () => {
            it('should throw expected error type', async () => {
                await expect((await ErrorTest.deploy()).throwsNoArgsError())
                    .to.be.rejectedWith(NoArgsError);
            });
        });

        describe('function that throws one arg (uint256) error', () => {
            it('should throw expected error type', async () => {
                await expect((await ErrorTest.deploy()).throwsOneArgUint256Error())
                    .to.be.rejectedWith(OneArgUint256Error);
            });

            it('should throw error with expected properties', async () => {
                try {
                    await (await ErrorTest.deploy()).throwsOneArgUint256Error();
                    expect.fail();
                } catch (error) {
                    if (error instanceof OneArgUint256Error) {
                        expect(error.uint256Arg)
                            .to.be.equal(1n);
                    } else {
                        expect.fail();
                    }
                }
            });
        });

        describe('function that throws one arg (string) error', () => {
            it('should throw expected error type', async () => {
                await expect((await ErrorTest.deploy()).throwsOneArgStringError())
                    .to.be.rejectedWith(OneArgStringError);
            });

            it('should throw error with expected properties', async () => {
                try {
                    await (await ErrorTest.deploy()).throwsOneArgStringError();
                    expect.fail();
                } catch (error) {
                    if (error instanceof OneArgStringError) {
                        expect(error.stringArg)
                            .to.be.equal('error');
                    } else {
                        expect.fail();
                    }
                }
            });
        });
    });

    describe('encode', () => {
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
                    .to.be.instanceOf(OneArgUint256Error);
                if (error instanceof OneArgUint256Error) {
                    expect(error.uint256Arg)
                        .to.be.equal(1n);
                }
            });
        });

        describe('one arg (uint256) error', () => {
            it('should encode correctly', () => {
                const error = decodeErrorData(new OneArgStringError('error').encode());
                expect(error)
                    .to.be.instanceOf(OneArgStringError);
                if (error instanceof OneArgStringError) {
                    expect(error.stringArg)
                        .to.be.equal('error');
                }
            });
        });
    });
});
