// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract EventTest {
    event NoArgsEvent();
    event OneArgUint8Event(uint8 uint8Arg);
    event OneArgIndexedUint8Event(uint8 indexed uint8Arg);
    event OneArgUint256Event(uint256 uint256Arg);
    event OneArgIndexedUint256Event(uint256 indexed uint256Arg);
    event OneArgAddressEvent(address addressArg);
    event OneArgIndexedAddressEvent(address indexed addressArg);
    event OneArgStringEvent(string stringArg);

    function emitNoArgsEvent() external {
        emit NoArgsEvent();
    }

    function emitOneArgUint8Event(uint8 uint8Arg) external {
        emit OneArgUint8Event(uint8Arg);
    }

    function emitOneArgIndexedUint8Event(uint8 uint8Arg) external {
        emit OneArgIndexedUint8Event(uint8Arg);
    }

    function emitOneArgUint256Event(uint256 uint256Arg) external {
        emit OneArgUint256Event(uint256Arg);
    }

    function emitOneArgIndexedUint256Event(uint256 uint256Arg) external {
        emit OneArgIndexedUint256Event(uint256Arg);
    }

    function emitOneArgAddressEvent(address addressArg) external {
        emit OneArgAddressEvent(addressArg);
    }

    function emitOneArgIndexedAddressEvent(address addressArg) external {
        emit OneArgIndexedAddressEvent(addressArg);
    }

    function emitOneArgStringEvent(string calldata stringArg) external {
        emit OneArgStringEvent(stringArg);
    }
}
