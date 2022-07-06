// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract ErrorTest {
    error NoArgsError();
    error OneArgUint256Error(uint256 uint256Arg);
    error OneArgStringError(string stringArg);

    function throwsNoArgsError() external pure {
        revert NoArgsError();
    }

    function throwsOneArgUint256Error() external pure {
        revert OneArgUint256Error(1);
    }

    function throwsOneArgStringError() external pure {
        revert OneArgStringError("error");
    }
}
