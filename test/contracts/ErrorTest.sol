// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ErrorTest {
    error NoArgsError();
    error OneArgUint256Error(uint256 uint256Arg);
    error OneArgStringError(string stringArg);

    function revertWithDefaultError() external pure {
        revert("error");
    }

    function revertWithoutReason() external pure {
        revert();
    }

    function revertWithNoArgsError() external pure {
        revert NoArgsError();
    }

    function revertWithOneArgUint256Error() external pure {
        revert OneArgUint256Error(1);
    }

    function revertWithOneArgStringError() external pure {
        revert OneArgStringError("error");
    }
}
