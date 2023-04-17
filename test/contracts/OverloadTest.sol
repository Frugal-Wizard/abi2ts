// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract OverloadTest {
    event Called(string method, bytes data);

    function overloaded() external returns (bytes memory) {
        emit Called("overloaded()", msg.data);
        return abi.encode("overloaded()", msg.data);
    }

    function overloaded(uint256) external returns (bytes memory) {
        emit Called("overloaded(uint256)", msg.data);
        return abi.encode("overloaded(uint256)", msg.data);
    }

    function overloaded(uint256, uint256) external returns (bytes memory) {
        emit Called("overloaded(uint256,uint256)", msg.data);
        return abi.encode("overloaded(uint256,uint256)", msg.data);
    }

    function overloaded(string calldata) external returns (bytes memory) {
        emit Called("overloaded(string)", msg.data);
        return abi.encode("overloaded(string)", msg.data);
    }

    function overloaded(bytes calldata) external returns (bytes memory) {
        emit Called("overloaded(bytes)", msg.data);
        return abi.encode("overloaded(bytes)", msg.data);
    }
}
