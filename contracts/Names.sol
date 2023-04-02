// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";

contract Names {
    event NameClaimed(address indexed _claimer, string _name);

    mapping(address => string) public resolveAddress;
    mapping(string => address) public resolveName;
    mapping(string => uint) public handleCount;

    function claim(string memory _handle, bytes memory _sig) external payable {
        string memory name = string.concat(_handle, "/", Strings.toString(handleCount[_handle]));

        resolveAddress[msg.sender] = name;
        resolveName[name] = msg.sender;

        handleCount[_handle] += 1;

        emit NameClaimed(msg.sender, name);
    }
}