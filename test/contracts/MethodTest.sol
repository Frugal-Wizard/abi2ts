// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MethodTest {
    function noArgsNoReturn() external {
    }

    function noArgsReturnUint256() external returns (uint256) {
    }

    function noArgsReturnUint256ReadOnly() external view returns (uint256) {
    }

    function noArgsReturnString() external returns (string memory) {
    }

    function noArgsReturnStringReadOnly() external view returns (string memory) {
    }

    function oneArgUint256NoReturn(uint256) external {
    }

    function oneArgUint256ReturnUint256(uint256) external returns (uint256) {
    }

    function oneArgUint256ReturnUint256ReadOnly(uint256) external view returns (uint256) {
    }

    function oneArgUint256ReturnString(uint256) external returns (string memory) {
    }

    function oneArgUint256ReturnStringReadOnly(uint256) external view returns (string memory) {
    }

    function oneArgStringNoReturn(string calldata) external {
    }

    function oneArgStringReturnUint256(string calldata) external returns (uint256) {
    }

    function oneArgStringReturnUint256ReadOnly(string calldata) external view returns (uint256) {
    }

    function oneArgStringReturnString(string calldata) external returns (string memory) {
    }

    function oneArgStringReturnStringReadOnly(string calldata) external view returns (string memory) {
    }

    function oneArgAddressNoReturn(address) external {
    }

    function oneArgUint256ArrayNoReturn(uint256[] calldata) external {
    }

    function oneArgStringArrayNoReturn(string[] calldata) external {
    }

    function oneArgAddressArrayNoReturn(address[] calldata) external {
    }
}
