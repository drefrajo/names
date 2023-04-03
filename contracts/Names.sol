// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Names {
    using ECDSA for bytes32;

    event NameClaimed(address indexed _claimer, string _name);

    mapping(address => string) public resolveAddress;
    mapping(string => address) public resolveName;
    mapping(string => uint) public handleCount;

    mapping(address => uint) public nonces;

    function setName(string memory _handle, address _subject) private {
        string memory name = string.concat(_handle, "/", Strings.toString(handleCount[_handle]));

        resolveAddress[_subject] = name;
        resolveName[name] = _subject;

        handleCount[_handle] += 1;

        emit NameClaimed(_subject, name);
    }

    function claim(string memory _handle) external {
        setName(_handle, msg.sender);
    }

    function metaClaim(string memory _handle, address _subject, uint _nonce, bytes memory _sig) external {
        // verify meta tx
        bytes32 msgHash = keccak256(
            abi.encodePacked(
                _handle,
                _subject,
                _nonce
            )
        );
        address signer = msgHash.toEthSignedMessageHash().recover(_sig);
        require(signer == _subject, "Invalid signature...");

        // replay protection
        require(nonces[_subject] == _nonce, "Invalid nonce...");
        nonces[_subject]++;

        setName(_handle, _subject);        
    }
}