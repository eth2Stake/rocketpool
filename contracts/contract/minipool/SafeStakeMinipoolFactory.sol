pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./SafeStakeMinipool.sol";
import "../SafeStakeBase.sol";
import "../../types/MinipoolStatus.sol";
import "../../types/MinipoolDeposit.sol";
import "../../interface/dao/node/SafeStakeDAONodeTrustedInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolManagerInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolQueueInterface.sol";
import "../../interface/node/SafeStakeNodeStakingInterface.sol";
import "../../interface/util/AddressSetStorageInterface.sol";
import "../../interface/node/SafeStakeNodeManagerInterface.sol";
import "../../interface/network/SafeStakeNetworkPricesInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsMinipoolInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolFactoryInterface.sol";

// Minipool creation, removal and management

contract SafeStakeMinipoolFactory is SafeStakeBase, SafeStakeMinipoolFactoryInterface {

    // Libs
    using SafeMath for uint;

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 1;
    }

    // Returns the bytecode for SafeStakeMinipool
    function getMinipoolBytecode() override public pure returns (bytes memory) {
        return type(SafeStakeMinipool).creationCode;
    }

    // Performs a CREATE2 deployment of a minipool contract with given salt
    function deployContract(address _nodeAddress, MinipoolDeposit _depositType, uint256 _salt) override external onlyLatestContract("safeStakeMinipoolFactory", address(this)) onlyLatestContract("safeStakeMinipoolManager", msg.sender) returns (address) {
        // Construct deployment bytecode
        bytes memory creationCode = getMinipoolBytecode();
        bytes memory bytecode = abi.encodePacked(creationCode, abi.encode(safeStakeStorage, _nodeAddress, _depositType));
        // Construct final salt
        uint256 salt = uint256(keccak256(abi.encodePacked(_nodeAddress, _salt)));
        // CREATE2 deployment
        address contractAddress;
        uint256 codeSize;
        assembly {
            contractAddress := create2(
            0,
            add(bytecode, 0x20),
            mload(bytecode),
            salt
            )

            codeSize := extcodesize(contractAddress)
        }
        // Ensure deployment was successful
        require(codeSize > 0, "Contract creation failed");
        // Return address
        return contractAddress;
    }

}
