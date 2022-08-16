// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract SenderTest {
    event SenderAddress(address senderAddress);

    function senderAddress() external returns (address) {
        emit SenderAddress(msg.sender);
        return msg.sender;
    }
}
