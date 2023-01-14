// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract counter {
    string public name;
    uint256 public count;

    constructor(string memory _name, uint256 _initialCount) {
        name = _name;
        count = _initialCount;
    }

    function increment() public returns (uint256 newCount) {
        count++;
        return count;
    }

    function decrement() public returns (uint256 newCount) {
        count--;
        return count;
    }

    function getCount() public view returns (uint256 newCount) {
        return count;
    }

    function getName() public view returns (string memory newName) {
        return name;
    }

    function setName(string memory _name) public {
        name = _name;
    }
}
