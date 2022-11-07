// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ErrorTest {
    error NoArgsError();
    error OneArgUint256Error(uint256 uint256Arg);
    error OneArgStringError(string stringArg);

    function throwDefaultError() external pure {
        revert("error");
    }

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
