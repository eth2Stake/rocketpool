pragma solidity 0.7.6;
pragma abicoder v2;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../SafeStakeBase.sol";
import "../../types/MinipoolStatus.sol";
import "../../types/NodeDetails.sol";
import "../../interface/node/SafeStakeNodeManagerInterface.sol";
import "../../interface/rewards/claims/SafeStakeClaimNodeInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol"; 
import "../../interface/util/AddressSetStorageInterface.sol";
import "../../interface/node/SafeStakeNodeDistributorFactoryInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolManagerInterface.sol";
import "../../interface/node/SafeStakeNodeDistributorInterface.sol";
import "../../interface/dao/node/settings/SafeStakeDAONodeTrustedSettingsRewardsInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsRewardsInterface.sol";
import "../../interface/node/SafeStakeNodeStakingInterface.sol";


// Node registration and management 
contract SafeStakeNodeManager is SafeStakeBase, SafeStakeNodeManagerInterface {

    // Libraries
    using SafeMath for uint256;

    // Events
    event NodeRegistered(address indexed node, uint256 time);
    event NodeTimezoneLocationSet(address indexed node, uint256 time);
    event NodeRewardNetworkChanged(address indexed node, uint256 network);
    event NodeSmoothingPoolStateChanged(address indexed node, bool state);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 2;
    }

    // Get the number of nodes in the network
    function getNodeCount() override public view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getCount(keccak256(abi.encodePacked("nodes.index")));
    }

    // Get a breakdown of the number of nodes per timezone
    function getNodeCountPerTimezone(uint256 _offset, uint256 _limit) override external view returns (TimezoneCount[] memory) {
        // Get contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Precompute node key
        bytes32 nodeKey = keccak256(abi.encodePacked("nodes.index"));
        // Calculate range
        uint256 totalNodes = addressSetStorage.getCount(nodeKey);
        uint256 max = _offset.add(_limit);
        if (max > totalNodes || _limit == 0) { max = totalNodes; }
        // Create an array with as many elements as there are potential values to return
        TimezoneCount[] memory counts = new TimezoneCount[](max.sub(_offset));
        uint256 uniqueTimezoneCount = 0;
        // Iterate the minipool range
        for (uint256 i = _offset; i < max; i++) {
            address nodeAddress = addressSetStorage.getItem(nodeKey, i);
            string memory timezone = getString(keccak256(abi.encodePacked("node.timezone.location", nodeAddress)));
            // Find existing entry in our array
            bool existing = false;
            for (uint256 j = 0; j < uniqueTimezoneCount; j++) {
                if (keccak256(bytes(counts[j].timezone)) == keccak256(bytes(timezone))) {
                    existing = true;
                    // Increment the counter
                    counts[j].count++;
                    break;
                }
            }
            // Entry was not found, so create a new one
            if (!existing) {
                counts[uniqueTimezoneCount].timezone = timezone;
                counts[uniqueTimezoneCount].count = 1;
                uniqueTimezoneCount++;
            }
        }
        // Dirty hack to cut unused elements off end of return value
        assembly {
            mstore(counts, uniqueTimezoneCount)
        }
        return counts;
    }

    // Get a node address by index
    function getNodeAt(uint256 _index) override external view returns (address) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getItem(keccak256(abi.encodePacked("nodes.index")), _index);
    }

    // Check whether a node exists
    function getNodeExists(address _nodeAddress) override public view returns (bool) {
        return getBool(keccak256(abi.encodePacked("node.exists", _nodeAddress)));
    }

    // Get a node's current withdrawal address
    function getNodeWithdrawalAddress(address _nodeAddress) override public view returns (address) {
        return safeStakeStorage.getNodeWithdrawalAddress(_nodeAddress);
    }

    // Get a node's pending withdrawal address
    function getNodePendingWithdrawalAddress(address _nodeAddress) override public view returns (address) {
        return safeStakeStorage.getNodePendingWithdrawalAddress(_nodeAddress);
    }

    // Get a node's timezone location
    function getNodeTimezoneLocation(address _nodeAddress) override public view returns (string memory) {
        return getString(keccak256(abi.encodePacked("node.timezone.location", _nodeAddress)));
    }

    // Register a new node with SafeStake Pool
    function registerNode(string calldata _timezoneLocation) override external onlyLatestContract("safeStakeNodeManager", address(this)) {
        // Load contracts
        SafeStakeDAOProtocolSettingsNodeInterface safeStakeDAOProtocolSettingsNode = SafeStakeDAOProtocolSettingsNodeInterface(getContractAddress("safeStakeDAOProtocolSettingsNode"));
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Check node settings
        require(safeStakeDAOProtocolSettingsNode.getRegistrationEnabled(), "SafeStake Pool node registrations are currently disabled");
        // Check timezone location
        require(bytes(_timezoneLocation).length >= 4, "The timezone location is invalid");
        // Initialise node data
        setBool(keccak256(abi.encodePacked("node.exists", msg.sender)), true);
        setString(keccak256(abi.encodePacked("node.timezone.location", msg.sender)), _timezoneLocation);
        // Add node to index
        addressSetStorage.addItem(keccak256(abi.encodePacked("nodes.index")), msg.sender);
        // Initialise fee distributor for this node
        _initialiseFeeDistributor(msg.sender);
        // Set node registration time (uses old storage key name for backwards compatibility)
        setUint(keccak256(abi.encodePacked("rewards.pool.claim.contract.registered.time", "safeStakeClaimNode", msg.sender)), block.timestamp);
        // Emit node registered event
        emit NodeRegistered(msg.sender, block.timestamp);
    }

    // Get's the timestamp of when a node was registered
    function getNodeRegistrationTime(address _nodeAddress) onlyRegisteredNode(_nodeAddress) override public view returns (uint256) {
        return getUint(keccak256(abi.encodePacked("rewards.pool.claim.contract.registered.time", "safeStakeClaimNode", _nodeAddress)));
    }

    // Set a node's timezone location
    // Only accepts calls from registered nodes
    function setTimezoneLocation(string calldata _timezoneLocation) override external onlyLatestContract("safeStakeNodeManager", address(this)) onlyRegisteredNode(msg.sender) {
        // Check timezone location
        require(bytes(_timezoneLocation).length >= 4, "The timezone location is invalid");
        // Set timezone location
        setString(keccak256(abi.encodePacked("node.timezone.location", msg.sender)), _timezoneLocation);
        // Emit node timezone location set event
        emit NodeTimezoneLocationSet(msg.sender, block.timestamp);
    }

    // Returns true if node has initialised their fee distributor contract
    function getFeeDistributorInitialised(address _nodeAddress) override public view returns (bool) {
        // Load contracts
        SafeStakeNodeDistributorFactoryInterface safeStakeNodeDistributorFactory = SafeStakeNodeDistributorFactoryInterface(getContractAddress("safeStakeNodeDistributorFactory"));
        // Get distributor address
        address contractAddress = safeStakeNodeDistributorFactory.getProxyAddress(_nodeAddress);
        // Check if contract exists at that address
        uint32 codeSize;
        assembly {
            codeSize := extcodesize(contractAddress)
        }
        return codeSize > 0;
    }

    // Node operators created before the distributor was implemented must call this to setup their distributor contract
    function initialiseFeeDistributor() override external onlyLatestContract("safeStakeNodeManager", address(this)) onlyRegisteredNode(msg.sender) {
        // Prevent multiple calls
        require(!getFeeDistributorInitialised(msg.sender), "Already initialised");
        // Load contracts
        SafeStakeMinipoolManagerInterface safeStakeMinipoolManager = SafeStakeMinipoolManagerInterface(getContractAddress("safeStakeMinipoolManager"));
        // Calculate and set current average fee numerator
        uint256 count = safeStakeMinipoolManager.getNodeMinipoolCount(msg.sender);
        if (count > 0){
            uint256 numerator;
            // Note: this loop is safe as long as all current node operators at the time of upgrade have few enough minipools
            for (uint256 i = 0; i < count; i++) {
                SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(safeStakeMinipoolManager.getMinipoolAt(i));
                if (minipool.getStatus() == MinipoolStatus.Staking){
                    numerator = numerator.add(minipool.getNodeFee());
                }
            }
            setUint(keccak256(abi.encodePacked("node.average.fee.numerator", msg.sender)), numerator);
        }
        // Create the distributor contract
        _initialiseFeeDistributor(msg.sender);
    }

    // Deploys the fee distributor contract for a given node
    function _initialiseFeeDistributor(address _nodeAddress) internal {
        // Load contracts
        SafeStakeNodeDistributorFactoryInterface safeStakeNodeDistributorFactory = SafeStakeNodeDistributorFactoryInterface(getContractAddress("safeStakeNodeDistributorFactory"));
        // Create the distributor proxy
        safeStakeNodeDistributorFactory.createProxy(_nodeAddress);
    }

    // Calculates a nodes average node fee
    function getAverageNodeFee(address _nodeAddress) override external view returns (uint256) {
        // Load contracts
        SafeStakeMinipoolManagerInterface safeStakeMinipoolManager = SafeStakeMinipoolManagerInterface(getContractAddress("safeStakeMinipoolManager"));
        // Calculate average
        uint256 denominator = safeStakeMinipoolManager.getNodeStakingMinipoolCount(_nodeAddress);
        if (denominator == 0) {
            return 0;
        }
        uint256 numerator = getUint(keccak256(abi.encodePacked("node.average.fee.numerator", _nodeAddress)));
        return numerator.div(denominator);
    }

    // Designates which network a node would like their rewards relayed to
    function setRewardNetwork(address _nodeAddress, uint256 _network) override external onlyLatestContract("safeStakeNodeManager", address(this)) {
        // Confirm the transaction is from the node's current withdrawal address
        address withdrawalAddress = safeStakeStorage.getNodeWithdrawalAddress(_nodeAddress);
        require(withdrawalAddress == msg.sender, "Only a tx from a node's withdrawal address can change reward network");
        // Check network is enabled
        SafeStakeDAONodeTrustedSettingsRewardsInterface safeStakeDAONodeTrustedSettingsRewards = SafeStakeDAONodeTrustedSettingsRewardsInterface(getContractAddress("safeStakeDAONodeTrustedSettingsRewards"));
        require(safeStakeDAONodeTrustedSettingsRewards.getNetworkEnabled(_network), "Network is not enabled");
        // Set the network
        setUint(keccak256(abi.encodePacked("node.reward.network", _nodeAddress)), _network);
        // Emit event
        emit NodeRewardNetworkChanged(_nodeAddress, _network);
    }

    // Returns which network a node has designated as their desired reward network
    function getRewardNetwork(address _nodeAddress) override public view onlyLatestContract("safeStakeNodeManager", address(this)) returns (uint256) {
        return getUint(keccak256(abi.encodePacked("node.reward.network", _nodeAddress)));
    }

    // Allows a node to register or deregister from the smoothing pool
    function setSmoothingPoolRegistrationState(bool _state) override external onlyLatestContract("safeStakeNodeManager", address(this)) onlyRegisteredNode(msg.sender) {
        // Ensure registration is enabled
        SafeStakeDAOProtocolSettingsNodeInterface daoSettingsNode = SafeStakeDAOProtocolSettingsNodeInterface(getContractAddress("safeStakeDAOProtocolSettingsNode"));
        require(daoSettingsNode.getSmoothingPoolRegistrationEnabled(), "Smoothing pool registrations are not active");
        // Precompute storage keys
        bytes32 changeKey = keccak256(abi.encodePacked("node.smoothing.pool.changed.time", msg.sender));
        bytes32 stateKey = keccak256(abi.encodePacked("node.smoothing.pool.state", msg.sender));
        // Get from the DAO settings
        SafeStakeDAOProtocolSettingsRewardsInterface daoSettingsRewards = SafeStakeDAOProtocolSettingsRewardsInterface(getContractAddress("safeStakeDAOProtocolSettingsRewards"));
        uint256 rewardInterval = daoSettingsRewards.getRewardsClaimIntervalTime();
        // Ensure node operator has waited the required time
        uint256 lastChange = getUint(changeKey);
        require(block.timestamp >= lastChange.add(rewardInterval), "Not enough time has passed since changing state");
        // Ensure state is actually changing
        require(getBool(stateKey) != _state, "Invalid state change");
        // Update registration state
        setUint(changeKey, block.timestamp);
        setBool(stateKey, _state);
        // Emit state change event
        emit NodeSmoothingPoolStateChanged(msg.sender, _state);
    }

    // Returns whether a node is registered or not from the smoothing pool
    function getSmoothingPoolRegistrationState(address _nodeAddress) override public view returns (bool) {
        return getBool(keccak256(abi.encodePacked("node.smoothing.pool.state", _nodeAddress)));
    }

    // Returns the timestamp of when the node last changed their smoothing pool registration state
    function getSmoothingPoolRegistrationChanged(address _nodeAddress) override external view returns (uint256) {
        return getUint(keccak256(abi.encodePacked("node.smoothing.pool.changed.time", _nodeAddress)));
    }

    // Returns the sum of nodes that are registered for the smoothing pool between _offset and (_offset + _limit)
    function getSmoothingPoolRegisteredNodeCount(uint256 _offset, uint256 _limit) override external view returns (uint256) {
        // Get contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Precompute node key
        bytes32 nodeKey = keccak256(abi.encodePacked("nodes.index"));
        // Iterate over the requested minipool range
        uint256 totalNodes = getNodeCount();
        uint256 max = _offset.add(_limit);
        if (max > totalNodes || _limit == 0) { max = totalNodes; }
        uint256 count = 0;
        for (uint256 i = _offset; i < max; i++) {
            address nodeAddress = addressSetStorage.getItem(nodeKey, i);
            if (getSmoothingPoolRegistrationState(nodeAddress)) {
                count++;
            }
        }
        return count;
    }

    // Convenience function to return all on-chain details about a given node
    function getNodeDetails(address _nodeAddress) override external view returns (NodeDetails memory nodeDetails) {
        // Get contracts
        SafeStakeNodeStakingInterface safeStakeNodeStaking = SafeStakeNodeStakingInterface(getContractAddress("safeStakeNodeStaking"));
        SafeStakeNodeDistributorFactoryInterface safeStakeNodeDistributorFactory = SafeStakeNodeDistributorFactoryInterface(getContractAddress("safeStakeNodeDistributorFactory"));
        SafeStakeMinipoolManagerInterface safeStakeMinipoolManager = SafeStakeMinipoolManagerInterface(getContractAddress("safeStakeMinipoolManager"));
        IERC20 safeStakeTokenRETH = IERC20(getContractAddress("safeStakeTokenRETH"));
        IERC20 safeStakeTokenRPL = IERC20(getContractAddress("safeStakeTokenRPL"));
        IERC20 safeStakeTokenRPLFixedSupply = IERC20(getContractAddress("safeStakeTokenRPLFixedSupply"));
        // Node details
        nodeDetails.withdrawalAddress = safeStakeStorage.getNodeWithdrawalAddress(_nodeAddress);
        nodeDetails.pendingWithdrawalAddress = safeStakeStorage.getNodePendingWithdrawalAddress(_nodeAddress);
        nodeDetails.exists = getNodeExists(_nodeAddress);
        nodeDetails.registrationTime = getNodeRegistrationTime(_nodeAddress);
        nodeDetails.timezoneLocation = getNodeTimezoneLocation(_nodeAddress);
        nodeDetails.feeDistributorInitialised = getFeeDistributorInitialised(_nodeAddress);
        nodeDetails.rewardNetwork = getRewardNetwork(_nodeAddress);
        // Staking details
        nodeDetails.rplStake = safeStakeNodeStaking.getNodeRPLStake(_nodeAddress);
        nodeDetails.effectiveRPLStake = safeStakeNodeStaking.getNodeEffectiveRPLStake(_nodeAddress);
        nodeDetails.minimumRPLStake = safeStakeNodeStaking.getNodeMinimumRPLStake(_nodeAddress);
        nodeDetails.maximumRPLStake = safeStakeNodeStaking.getNodeMaximumRPLStake(_nodeAddress);
        nodeDetails.minipoolLimit = safeStakeNodeStaking.getNodeMinipoolLimit(_nodeAddress);
        // Distributor details
        nodeDetails.feeDistributorAddress = safeStakeNodeDistributorFactory.getProxyAddress(_nodeAddress);
        // Minipool details
        nodeDetails.minipoolCount = safeStakeMinipoolManager.getNodeMinipoolCount(_nodeAddress);
        // Balance details
        nodeDetails.balanceETH = _nodeAddress.balance;
        nodeDetails.balanceRETH = safeStakeTokenRETH.balanceOf(_nodeAddress);
        nodeDetails.balanceRPL = safeStakeTokenRPL.balanceOf(_nodeAddress);
        nodeDetails.balanceOldRPL = safeStakeTokenRPLFixedSupply.balanceOf(_nodeAddress);
    }

    // Returns a slice of the node operator address set
    function getNodeAddresses(uint256 _offset, uint256 _limit) override external view returns (address[] memory) {
        // Get contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Precompute node key
        bytes32 nodeKey = keccak256(abi.encodePacked("nodes.index"));
        // Iterate over the requested minipool range
        uint256 totalNodes = getNodeCount();
        uint256 max = _offset.add(_limit);
        if (max > totalNodes || _limit == 0) { max = totalNodes; }
        // Create array big enough for every minipool
        address[] memory nodes = new address[](max.sub(_offset));
        uint256 total = 0;
        for (uint256 i = _offset; i < max; i++) {
            nodes[total] = addressSetStorage.getItem(nodeKey, i);
            total++;
        }
        // Dirty hack to cut unused elements off end of return value
        assembly {
            mstore(nodes, total)
        }
        return nodes;
    }
}
