pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../SafeStakeBase.sol";
import "../../interface/dao/node/SafeStakeDAONodeTrustedInterface.sol";
import "../../interface/network/SafeStakeNetworkBalancesInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";

// Network balances

contract SafeStakeNetworkBalances is SafeStakeBase, SafeStakeNetworkBalancesInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event BalancesSubmitted(address indexed from, uint256 block, uint256 totalEth, uint256 stakingEth, uint256 sfethSupply, uint256 time);
    event BalancesUpdated(uint256 block, uint256 totalEth, uint256 stakingEth, uint256 sfethSupply, uint256 time);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 1;
    }

    // The block number which balances are current for
    function getBalancesBlock() override public view returns (uint256) {
        return getUint(keccak256("network.balances.updated.block"));
    }
    function setBalancesBlock(uint256 _value) private {
        setUint(keccak256("network.balances.updated.block"), _value);
    }

    // The current RP network total ETH balance
    function getTotalETHBalance() override public view returns (uint256) {
        return getUint(keccak256("network.balance.total"));
    }
    function setTotalETHBalance(uint256 _value) private {
        setUint(keccak256("network.balance.total"), _value);
    }

    // The current RP network staking ETH balance
    function getStakingETHBalance() override public view returns (uint256) {
        return getUint(keccak256("network.balance.staking"));
    }
    function setStakingETHBalance(uint256 _value) private {
        setUint(keccak256("network.balance.staking"), _value);
    }

    // The current RP network total sfETH supply
    function getTotalSFETHSupply() override external view returns (uint256) {
        return getUint(keccak256("network.balance.sfeth.supply"));
    }
    function setTotalSFETHSupply(uint256 _value) private {
        setUint(keccak256("network.balance.sfeth.supply"), _value);
    }

    // Get the current RP network ETH utilization rate as a fraction of 1 ETH
    // Represents what % of the network's balance is actively earning rewards
    function getETHUtilizationRate() override external view returns (uint256) {
        uint256 totalEthBalance = getTotalETHBalance();
        uint256 stakingEthBalance = getStakingETHBalance();
        if (totalEthBalance == 0) { return calcBase; }
        return calcBase.mul(stakingEthBalance).div(totalEthBalance);
    }

    // Submit network balances for a block
    // Only accepts calls from trusted (oracle) nodes
    function submitBalances(uint256 _block, uint256 _totalEth, uint256 _stakingEth, uint256 _sfethSupply) override external onlyLatestContract("safeStakeNetworkBalances", address(this)) onlyTrustedNode(msg.sender) {
        // Check settings
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        require(safeStakeDAOProtocolSettingsNetwork.getSubmitBalancesEnabled(), "Submitting balances is currently disabled");
        // Check block
        require(_block < block.number, "Balances can not be submitted for a future block");
        require(_block > getBalancesBlock(), "Network balances for an equal or higher block are set");
        // Check balances
        require(_stakingEth <= _totalEth, "Invalid network balances");
        // Get submission keys
        bytes32 nodeSubmissionKey = keccak256(abi.encodePacked("network.balances.submitted.node", msg.sender, _block, _totalEth, _stakingEth, _sfethSupply));
        bytes32 submissionCountKey = keccak256(abi.encodePacked("network.balances.submitted.count", _block, _totalEth, _stakingEth, _sfethSupply));
        // Check & update node submission status
        require(!getBool(nodeSubmissionKey), "Duplicate submission from node");
        setBool(nodeSubmissionKey, true);
        setBool(keccak256(abi.encodePacked("network.balances.submitted.node", msg.sender, _block)), true);
        // Increment submission count
        uint256 submissionCount = getUint(submissionCountKey).add(1);
        setUint(submissionCountKey, submissionCount);
        // Emit balances submitted event
        emit BalancesSubmitted(msg.sender, _block, _totalEth, _stakingEth, _sfethSupply, block.timestamp);
        // Check submission count & update network balances
        SafeStakeDAONodeTrustedInterface safeStakeDAONodeTrusted = SafeStakeDAONodeTrustedInterface(getContractAddress("safeStakeDAONodeTrusted"));
        if (calcBase.mul(submissionCount).div(safeStakeDAONodeTrusted.getMemberCount()) >= safeStakeDAOProtocolSettingsNetwork.getNodeConsensusThreshold()) {
            updateBalances(_block, _totalEth, _stakingEth, _sfethSupply);
        }
    }

    // Executes updateBalances if consensus threshold is reached
    function executeUpdateBalances(uint256 _block, uint256 _totalEth, uint256 _stakingEth, uint256 _sfethSupply) override external onlyLatestContract("safeStakeNetworkBalances", address(this)) {
        // Check settings
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        require(safeStakeDAOProtocolSettingsNetwork.getSubmitBalancesEnabled(), "Submitting balances is currently disabled");
        // Check block
        require(_block < block.number, "Balances can not be submitted for a future block");
        require(_block > getBalancesBlock(), "Network balances for an equal or higher block are set");
        // Check balances
        require(_stakingEth <= _totalEth, "Invalid network balances");
        // Get submission keys
        bytes32 submissionCountKey = keccak256(abi.encodePacked("network.balances.submitted.count", _block, _totalEth, _stakingEth, _sfethSupply));
        // Get submission count
        uint256 submissionCount = getUint(submissionCountKey);
        // Check submission count & update network balances
        SafeStakeDAONodeTrustedInterface safeStakeDAONodeTrusted = SafeStakeDAONodeTrustedInterface(getContractAddress("safeStakeDAONodeTrusted"));
        require(calcBase.mul(submissionCount).div(safeStakeDAONodeTrusted.getMemberCount()) >= safeStakeDAOProtocolSettingsNetwork.getNodeConsensusThreshold(), "Consensus has not been reached");
        updateBalances(_block, _totalEth, _stakingEth, _sfethSupply);
    }

    // Update network balances
    function updateBalances(uint256 _block, uint256 _totalEth, uint256 _stakingEth, uint256 _sfethSupply) private {
        // Update balances
        setBalancesBlock(_block);
        setTotalETHBalance(_totalEth);
        setStakingETHBalance(_stakingEth);
        setTotalSFETHSupply(_sfethSupply);
        // Emit balances updated event
        emit BalancesUpdated(_block, _totalEth, _stakingEth, _sfethSupply, block.timestamp);
    }

    // Returns the latest block number that oracles should be reporting balances for
    function getLatestReportableBlock() override external view returns (uint256) {
        // Load contracts
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        // Get the block balances were lasted updated and the update frequency
        uint256 updateFrequency = safeStakeDAOProtocolSettingsNetwork.getSubmitBalancesFrequency();
        // Calculate the last reportable block based on update frequency
        return block.number.div(updateFrequency).mul(updateFrequency);
    }
}
