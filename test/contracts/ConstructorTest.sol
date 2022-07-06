// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract ConstructorNoArgs {
    constructor() {
    }
}

contract ConstructorThrowsError {
    constructor() {
        revert("error");
    }
}

contract ConstructorOneArgUint256 {
    constructor(uint256 arg) {
    }
}

contract ConstructorOneArgString {
    constructor(string memory arg) {
    }
}
