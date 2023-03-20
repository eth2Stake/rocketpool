pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../SafeStakeBase.sol";
import "../../interface/dao/node/SafeStakeDAONodeTrustedInterface.sol";
import "../../interface/network/SafeStakeNetworkPenaltiesInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolPenaltyInterface.sol";

// Minipool penalties

contract SafeStakeNetworkPenalties is SafeStakeBase, SafeStakeNetworkPenaltiesInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event PenaltySubmitted(address indexed from, address minipoolAddress, uint256 block, uint256 time);
    event PenaltyUpdated(address indexed minipoolAddress, uint256 penalty, uint256 time);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 1;
    }

    // Submit penalty for node operator non-compliance
    function submitPenalty(address _minipoolAddress, uint256 _block) override external onlyLatestContract("safeStakeNetworkPenalties", address(this)) onlyTrustedNode(msg.sender) onlyRegisteredMinipool(_minipoolAddress) {
        // Get contracts
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        // Get submission keys
        bytes32 nodeSubmissionKey = keccak256(abi.encodePacked("network.penalties.submitted.node", msg.sender, _minipoolAddress, _block));
        bytes32 submissionCountKey = keccak256(abi.encodePacked("network.penalties.submitted.count", _minipoolAddress, _block));
        bytes32 executedKey = keccak256(abi.encodePacked("network.penalties.executed", _minipoolAddress, _block));
        // Check & update node submission status
        require(!getBool(nodeSubmissionKey), "Duplicate submission from node");
        require(!getBool(executedKey), "Penalty already applied for this block");
        setBool(nodeSubmissionKey, true);
        // Increment submission count
        uint256 submissionCount = getUint(submissionCountKey).add(1);
        setUint(submissionCountKey, submissionCount);
        // Emit balances submitted event
        emit PenaltySubmitted(msg.sender, _minipoolAddress, _block, block.timestamp);
        // Check submission count & update network balances
        SafeStakeDAONodeTrustedInterface safeStakeDAONodeTrusted = SafeStakeDAONodeTrustedInterface(getContractAddress("safeStakeDAONodeTrusted"));
        if (calcBase.mul(submissionCount).div(safeStakeDAONodeTrusted.getMemberCount()) >= safeStakeDAOProtocolSettingsNetwork.getNodePenaltyThreshold()) {
            setBool(executedKey, true);
            incrementMinipoolPenaltyCount(_minipoolAddress);
        }
    }

    // Executes incrementMinipoolPenaltyCount if consensus threshold is reached
    function executeUpdatePenalty(address _minipoolAddress, uint256 _block) override external onlyLatestContract("safeStakeNetworkPenalties", address(this)) {
        // Get contracts
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        // Get submission keys
        bytes32 submissionCountKey = keccak256(abi.encodePacked("network.penalties.submitted.count", _minipoolAddress, _block));
        bytes32 executedKey = keccak256(abi.encodePacked("network.penalties.executed", _minipoolAddress, _block));
        // Check whether it's been executed yet
        require(!getBool(executedKey), "Penalty already applied for this block");
        // Get submission count
        uint256 submissionCount = getUint(submissionCountKey);
        // Check submission count & update network balances
        SafeStakeDAONodeTrustedInterface safeStakeDAONodeTrusted = SafeStakeDAONodeTrustedInterface(getContractAddress("safeStakeDAONodeTrusted"));
        require(calcBase.mul(submissionCount).div(safeStakeDAONodeTrusted.getMemberCount()) >= safeStakeDAOProtocolSettingsNetwork.getNodePenaltyThreshold(), "Consensus has not been reached");
        setBool(executedKey, true);
        incrementMinipoolPenaltyCount(_minipoolAddress);
    }

    // Returns the number of penalties for a given minipool
    function getPenaltyCount(address _minipoolAddress) override external view returns (uint256) {
        return getUint(keccak256(abi.encodePacked("network.penalties.penalty", _minipoolAddress)));
    }

    // Increments the number of penalties against given minipool and updates penalty rate appropriately
    function incrementMinipoolPenaltyCount(address _minipoolAddress) private {
        // Get contracts
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        // Calculate penalty count key
        bytes32 key = keccak256(abi.encodePacked("network.penalties.penalty", _minipoolAddress));
        // Get the current penalty count
        uint256 newPenaltyCount = getUint(key).add(1);
        // Update the penalty count
        setUint(key, newPenaltyCount);
        // First two penalties do not increase penalty rate
        if (newPenaltyCount < 3) {
            return;
        }
        newPenaltyCount = newPenaltyCount.sub(2);
        // Calculate the new penalty rate
        uint256 penaltyRate = newPenaltyCount.mul(safeStakeDAOProtocolSettingsNetwork.getPerPenaltyRate());
        // Set the penalty rate
        SafeStakeMinipoolPenaltyInterface safeStakeMinipoolPenalty = SafeStakeMinipoolPenaltyInterface(getContractAddress("safeStakeMinipoolPenalty"));
        safeStakeMinipoolPenalty.setPenaltyRate(_minipoolAddress, penaltyRate);
        // Emit penalty updated event
        emit PenaltyUpdated(_minipoolAddress, penaltyRate, block.timestamp);
    }
}
