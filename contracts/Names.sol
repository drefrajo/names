// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract IOutsider {
    mapping(address => bool) public isEOA;
    function proofEOA(address _subject, bytes memory _sig) public virtual;
}

contract Names is Ownable {
    event NameClaimed(address indexed _claimer, string _name);

    mapping(address => string) public resolveAddress;
    mapping(string => address) public resolveName;
    mapping(string => uint) public handleCount;

    uint256 public renameFee = 5 ether;

    IOutsider outsider = IOutsider(0x0a1a6f16febF97417888dbdf1CbC3b30BD0B5b81);

    function claim(string memory _handle, bytes memory _sig) external payable {
        if(_sig.length != 0) {
            outsider.proofEOA(msg.sender, _sig);
        }

        if(bytes(resolveAddress[msg.sender]).length != 0) {
            require(msg.value == renameFee, "Wrong value...");
        }

        require(outsider.isEOA(msg.sender));

        string memory name = string.concat(_handle, "/", Strings.toString(handleCount[_handle]));

        resolveAddress[msg.sender] = name;
        resolveName[name] = msg.sender;

        handleCount[_handle] += 1;

        emit NameClaimed(msg.sender, name);
    }

    function setFee(uint256 _value) external onlyOwner() {
        renameFee = _value;
    }

    function withdrawFee() external onlyOwner() {
        payable(owner()).transfer(address(this).balance);
    }
}