pragma solidity 0.7.6;
pragma abicoder v2;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./SafeStakeMinipool.sol";
import "../SafeStakeBase.sol";
import "../../types/MinipoolStatus.sol";
import "../../types/MinipoolDeposit.sol";
import "../../types/MinipoolDetails.sol";
import "../../interface/dao/node/SafeStakeDAONodeTrustedInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolManagerInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolQueueInterface.sol";
import "../../interface/util/AddressSetStorageInterface.sol";
import "../../interface/node/SafeStakeNodeManagerInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsMinipoolInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolFactoryInterface.sol";
import "../../interface/node/SafeStakeNodeDistributorFactoryInterface.sol";
import "../../interface/node/SafeStakeNodeDistributorInterface.sol";
import "../../interface/network/SafeStakeNetworkPenaltiesInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolPenaltyInterface.sol";

// Minipool creation, removal and management

contract SafeStakeMinipoolManager is SafeStakeBase, SafeStakeMinipoolManagerInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event MinipoolCreated(address indexed minipool, address indexed node, uint256 time);
    event MinipoolDestroyed(address indexed minipool, address indexed node, uint256 time);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 2;
    }

    // Get the number of minipools in the network
    function getMinipoolCount() override public view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getCount(keccak256(bytes("minipools.index")));
    }

    // Get the number of minipools in the network in the Staking state
    function getStakingMinipoolCount() override external view returns (uint256) {
        return getUint(keccak256(bytes("minipools.staking.count")));
    }

    // Get the number of finalised minipools in the network
    function getFinalisedMinipoolCount() override external view returns (uint256) {
        return getUint(keccak256(bytes("minipools.finalised.count")));
    }

    // Get the number of active minipools in the network
    function getActiveMinipoolCount() override public view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        uint256 total = addressSetStorage.getCount(keccak256(bytes("minipools.index")));
        uint256 finalised = getUint(keccak256(bytes("minipools.finalised.count")));
        return total.sub(finalised);
    }

    // Get the number of minipools in each status.
    // Returns the counts for Initialised, Prelaunch, Staking, Withdrawable, and Dissolved in that order.
    function getMinipoolCountPerStatus(uint256 _offset, uint256 _limit) override external view
    returns (uint256 initialisedCount, uint256 prelaunchCount, uint256 stakingCount, uint256 withdrawableCount, uint256 dissolvedCount) {
        // Get contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Precompute minipool key
        bytes32 minipoolKey = keccak256(abi.encodePacked("minipools.index"));
        // Iterate over the requested minipool range
        uint256 totalMinipools = getMinipoolCount();
        uint256 max = _offset.add(_limit);
        if (max > totalMinipools || _limit == 0) { max = totalMinipools; }
        for (uint256 i = _offset; i < max; i++) {
            // Get the minipool at index i
            SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(addressSetStorage.getItem(minipoolKey, i));
            // Get the minipool's status, and update the appropriate counter
            MinipoolStatus status = minipool.getStatus();
            if (status == MinipoolStatus.Initialised) {
                initialisedCount++;
            }
            else if (status == MinipoolStatus.Prelaunch) {
                prelaunchCount++;
            }
            else if (status == MinipoolStatus.Staking) {
                stakingCount++;
            }
            else if (status == MinipoolStatus.Withdrawable) {
                withdrawableCount++;
            }
            else if (status == MinipoolStatus.Dissolved) {
                dissolvedCount++;
            }
        }
    }

    // Returns an array of all minipools in the prelaunch state
    function getPrelaunchMinipools(uint256 offset, uint256 limit) override external view
    returns (address[] memory) {
        // Get contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Precompute minipool key
        bytes32 minipoolKey = keccak256(abi.encodePacked("minipools.index"));
        // Iterate over the requested minipool range
        uint256 totalMinipools = getMinipoolCount();
        uint256 max = offset.add(limit);
        if (max > totalMinipools || limit == 0) { max = totalMinipools; }
        // Create array big enough for every minipool
        address[] memory minipools = new address[](max.sub(offset));
        uint256 total = 0;
        for (uint256 i = offset; i < max; i++) {
            // Get the minipool at index i
            SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(addressSetStorage.getItem(minipoolKey, i));
            // Get the minipool's status, and to array if it's in prelaunch
            MinipoolStatus status = minipool.getStatus();
            if (status == MinipoolStatus.Prelaunch) {
                minipools[total] = address(minipool);
                total++;
            }
        }
        // Dirty hack to cut unused elements off end of return value
        assembly {
            mstore(minipools, total)
        }
        return minipools;
    }

    // Get a network minipool address by index
    function getMinipoolAt(uint256 _index) override external view returns (address) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getItem(keccak256(abi.encodePacked("minipools.index")), _index);
    }

    // Get the number of minipools owned by a node
    function getNodeMinipoolCount(address _nodeAddress) override external view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getCount(keccak256(abi.encodePacked("node.minipools.index", _nodeAddress)));
    }

    // Get the number of minipools owned by a node that are not finalised
    function getNodeActiveMinipoolCount(address _nodeAddress) override public view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        uint256 finalised = getUint(keccak256(abi.encodePacked("node.minipools.finalised.count", _nodeAddress)));
        uint256 total = addressSetStorage.getCount(keccak256(abi.encodePacked("node.minipools.index", _nodeAddress)));
        return total.sub(finalised);
    }

    // Get the number of minipools owned by a node that are finalised
    function getNodeFinalisedMinipoolCount(address _nodeAddress) override external view returns (uint256) {
        return getUint(keccak256(abi.encodePacked("node.minipools.finalised.count", _nodeAddress)));
    }

    // Get the number of minipools owned by a node that are in staking status
    function getNodeStakingMinipoolCount(address _nodeAddress) override external view returns (uint256) {
        return getUint(keccak256(abi.encodePacked("node.minipools.staking.count", _nodeAddress)));
    }

    // Get a node minipool address by index
    function getNodeMinipoolAt(address _nodeAddress, uint256 _index) override external view returns (address) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getItem(keccak256(abi.encodePacked("node.minipools.index", _nodeAddress)), _index);
    }

    // Get the number of validating minipools owned by a node
    function getNodeValidatingMinipoolCount(address _nodeAddress) override external view returns (uint256) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getCount(keccak256(abi.encodePacked("node.minipools.validating.index", _nodeAddress)));
    }

    // Get a validating node minipool address by index
    function getNodeValidatingMinipoolAt(address _nodeAddress, uint256 _index) override external view returns (address) {
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        return addressSetStorage.getItem(keccak256(abi.encodePacked("node.minipools.validating.index", _nodeAddress)), _index);
    }

    // Get a minipool address by validator pubkey
    function getMinipoolByPubkey(bytes memory _pubkey) override public view returns (address) {
        return getAddress(keccak256(abi.encodePacked("validator.minipool", _pubkey)));
    }

    // Check whether a minipool exists
    function getMinipoolExists(address _minipoolAddress) override public view returns (bool) {
        return getBool(keccak256(abi.encodePacked("minipool.exists", _minipoolAddress)));
    }

    // Check whether a minipool previously existed at the given address
    function getMinipoolDestroyed(address _minipoolAddress) override external view returns (bool) {
        return getBool(keccak256(abi.encodePacked("minipool.destroyed", _minipoolAddress)));
    }

    // Get a minipool's validator pubkey
    function getMinipoolPubkey(address _minipoolAddress) override public view returns (bytes memory) {
        return getBytes(keccak256(abi.encodePacked("minipool.pubkey", _minipoolAddress)));
    }

    // Get the withdrawal credentials for the minipool contract
    function getMinipoolWithdrawalCredentials(address _minipoolAddress) override public pure returns (bytes memory) {
        return abi.encodePacked(byte(0x01), bytes11(0x0), address(_minipoolAddress));
    }

    // Increments _nodeAddress' number of minipools in staking status
    function incrementNodeStakingMinipoolCount(address _nodeAddress) override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyRegisteredMinipool(msg.sender) {
        // Get contracts
        SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(msg.sender);
        // Try to distribute current fees at previous average commission rate
        _tryDistribute(_nodeAddress);
        // Update the node specific count
        bytes32 nodeKey = keccak256(abi.encodePacked("node.minipools.staking.count", _nodeAddress));
        uint256 nodeValue = getUint(nodeKey);
        setUint(nodeKey, nodeValue.add(1));
        // Update the total count
        bytes32 totalKey = keccak256(abi.encodePacked("minipools.staking.count"));
        uint256 totalValue = getUint(totalKey);
        setUint(totalKey, totalValue.add(1));
        // Update node fee average
        addUint(keccak256(abi.encodePacked("node.average.fee.numerator", _nodeAddress)), minipool.getNodeFee());
    }

    // Decrements _nodeAddress' number of minipools in staking status
    function decrementNodeStakingMinipoolCount(address _nodeAddress) override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyRegisteredMinipool(msg.sender) {
        // Get contracts
        SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(msg.sender);
        // Try to distribute current fees at previous average commission rate
        _tryDistribute(_nodeAddress);
        // Update the node specific count
        bytes32 nodeKey = keccak256(abi.encodePacked("node.minipools.staking.count", _nodeAddress));
        uint256 nodeValue = getUint(nodeKey);
        setUint(nodeKey, nodeValue.sub(1));
        // Update the total count
        bytes32 totalKey = keccak256(abi.encodePacked("minipools.staking.count"));
        uint256 totalValue = getUint(totalKey);
        setUint(totalKey, totalValue.sub(1));
        // Update node fee average
        subUint(keccak256(abi.encodePacked("node.average.fee.numerator", _nodeAddress)), minipool.getNodeFee());
    }

    // Calls distribute on the given node's distributor if it has a balance and has been initialised
    function _tryDistribute(address _nodeAddress) internal {
        // Get contracts
        SafeStakeNodeDistributorFactoryInterface safeStakeNodeDistributorFactory = SafeStakeNodeDistributorFactoryInterface(getContractAddress("safeStakeNodeDistributorFactory"));
        address distributorAddress = safeStakeNodeDistributorFactory.getProxyAddress(_nodeAddress);
        // If there are funds to distribute than call distribute
        if (distributorAddress.balance > 0) {
            // Get contracts
            SafeStakeNodeManagerInterface safeStakeNodeManager = SafeStakeNodeManagerInterface(getContractAddress("safeStakeNodeManager"));
            // Ensure distributor has been initialised
            require(safeStakeNodeManager.getFeeDistributorInitialised(_nodeAddress), "Distributor not initialised");
            SafeStakeNodeDistributorInterface distributor = SafeStakeNodeDistributorInterface(distributorAddress);
            distributor.distribute();
        }
    }

    // Increments _nodeAddress' number of minipools that have been finalised
    function incrementNodeFinalisedMinipoolCount(address _nodeAddress) override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyRegisteredMinipool(msg.sender) {
        // Update the node specific count
        addUint(keccak256(abi.encodePacked("node.minipools.finalised.count", _nodeAddress)), 1);
        // Update the total count
        addUint(keccak256(bytes("minipools.finalised.count")), 1);
    }

    // Create a minipool
    // Only accepts calls from the SafeStakeNodeDeposit contract
    function createMinipool(address _nodeAddress, MinipoolDeposit _depositType, uint256 _salt) override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyLatestContract("safeStakeNodeDeposit", msg.sender) returns (SafeStakeMinipoolInterface) {
        // Load contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        { // Local scope to prevent stack too deep error
          SafeStakeDAOProtocolSettingsMinipoolInterface safeStakeDAOProtocolSettingsMinipool = SafeStakeDAOProtocolSettingsMinipoolInterface(getContractAddress("safeStakeDAOProtocolSettingsMinipool"));
          // Check global minipool limit
          uint256 totalMinipoolCount = getActiveMinipoolCount();
          require(totalMinipoolCount.add(1) <= safeStakeDAOProtocolSettingsMinipool.getMaximumCount(), "Global minipool limit reached");
        }
        // Create minipool contract
        address contractAddress = deployContract(_nodeAddress, _depositType, _salt);
        // Initialize minipool data
        setBool(keccak256(abi.encodePacked("minipool.exists", contractAddress)), true);
        // Add minipool to indexes
        addressSetStorage.addItem(keccak256(abi.encodePacked("minipools.index")), contractAddress);
        addressSetStorage.addItem(keccak256(abi.encodePacked("node.minipools.index", _nodeAddress)), contractAddress);
        // Update unbonded validator count if minipool is unbonded
        if (_depositType == MinipoolDeposit.Empty) {
            SafeStakeDAONodeTrustedInterface safeStakeDAONodeTrusted = SafeStakeDAONodeTrustedInterface(getContractAddress("safeStakeDAONodeTrusted"));
            safeStakeDAONodeTrusted.incrementMemberUnbondedValidatorCount(_nodeAddress);
        }
        // Emit minipool created event
        emit MinipoolCreated(contractAddress, _nodeAddress, block.timestamp);
        // Add minipool to queue
        SafeStakeMinipoolQueueInterface(getContractAddress("safeStakeMinipoolQueue")).enqueueMinipool(_depositType, contractAddress);
        // Return created minipool address
        return SafeStakeMinipoolInterface(contractAddress);
    }

    // Destroy a minipool
    // Only accepts calls from registered minipools
    function destroyMinipool() override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyRegisteredMinipool(msg.sender) {
        // Load contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Initialize minipool & get properties
        SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(msg.sender);
        address nodeAddress = minipool.getNodeAddress();
        // Update minipool data
        setBool(keccak256(abi.encodePacked("minipool.exists", msg.sender)), false);
        // Record minipool as destroyed to prevent recreation at same address
        setBool(keccak256(abi.encodePacked("minipool.destroyed", msg.sender)), true);
        // Remove minipool from indexes
        addressSetStorage.removeItem(keccak256(abi.encodePacked("minipools.index")), msg.sender);
        addressSetStorage.removeItem(keccak256(abi.encodePacked("node.minipools.index", nodeAddress)), msg.sender);
        // Clean up pubkey state
        bytes memory pubkey = getMinipoolPubkey(msg.sender);
        deleteBytes(keccak256(abi.encodePacked("minipool.pubkey", msg.sender)));
        deleteAddress(keccak256(abi.encodePacked("validator.minipool", pubkey)));
        // Emit minipool destroyed event
        emit MinipoolDestroyed(msg.sender, nodeAddress, block.timestamp);
    }

    // Set a minipool's validator pubkey
    // Only accepts calls from registered minipools
    function setMinipoolPubkey(bytes calldata _pubkey) override external onlyLatestContract("safeStakeMinipoolManager", address(this)) onlyRegisteredMinipool(msg.sender) {
        // Load contracts
        AddressSetStorageInterface addressSetStorage = AddressSetStorageInterface(getContractAddress("addressSetStorage"));
        // Initialize minipool & get properties
        SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(msg.sender);
        address nodeAddress = minipool.getNodeAddress();
        // Set minipool validator pubkey & validator minipool address
        setBytes(keccak256(abi.encodePacked("minipool.pubkey", msg.sender)), _pubkey);
        setAddress(keccak256(abi.encodePacked("validator.minipool", _pubkey)), msg.sender);
        // Add minipool to node validating minipools index
        addressSetStorage.addItem(keccak256(abi.encodePacked("node.minipools.validating.index", nodeAddress)), msg.sender);
    }

    // Performs a CREATE2 deployment of a minipool contract with given salt
    function deployContract(address _nodeAddress, MinipoolDeposit _depositType, uint256 _salt) private returns (address) {
        SafeStakeMinipoolFactoryInterface safeStakeMinipoolFactory = SafeStakeMinipoolFactoryInterface(getContractAddress("safeStakeMinipoolFactory"));
        return safeStakeMinipoolFactory.deployContract(_nodeAddress, _depositType, _salt);
    }

    // Retrieves all on-chain information about a given minipool in a single convenience view function
    function getMinipoolDetails(address _minipoolAddress) override external view returns (MinipoolDetails memory) {
        // Get contracts
        SafeStakeMinipoolInterface minipoolInterface = SafeStakeMinipoolInterface(_minipoolAddress);
        SafeStakeMinipool minipool = SafeStakeMinipool(payable(_minipoolAddress));
        SafeStakeNetworkPenaltiesInterface safeStakeNetworkPenalties = SafeStakeNetworkPenaltiesInterface(getContractAddress("safeStakeNetworkPenalties"));
        SafeStakeMinipoolPenaltyInterface safeStakeMinipoolPenalty = SafeStakeMinipoolPenaltyInterface(getContractAddress("safeStakeMinipoolPenalty"));
        // Minipool details
        MinipoolDetails memory details;
        details.exists = getMinipoolExists(_minipoolAddress);
        details.pubkey = getMinipoolPubkey(_minipoolAddress);
        details.status = minipoolInterface.getStatus();
        details.statusBlock = minipoolInterface.getStatusBlock();
        details.statusTime = minipoolInterface.getStatusTime();
        details.finalised = minipoolInterface.getFinalised();
        details.depositType = minipoolInterface.getDepositType();
        details.nodeFee = minipoolInterface.getNodeFee();
        details.nodeDepositBalance = minipoolInterface.getNodeDepositBalance();
        details.nodeDepositAssigned = minipoolInterface.getNodeDepositAssigned();
        details.userDepositBalance = minipoolInterface.getUserDepositBalance();
        details.userDepositAssigned = minipoolInterface.getUserDepositAssigned();
        details.userDepositAssignedTime = minipoolInterface.getUserDepositAssignedTime();
        // Delegate details
        details.useLatestDelegate = minipool.getUseLatestDelegate();
        details.delegate = minipool.getDelegate();
        details.previousDelegate = minipool.getPreviousDelegate();
        details.effectiveDelegate = minipool.getEffectiveDelegate();
        // Penalty details
        details.penaltyCount = safeStakeNetworkPenalties.getPenaltyCount(_minipoolAddress);
        details.penaltyRate = safeStakeMinipoolPenalty.getPenaltyRate(_minipoolAddress);
        return details;
    }
}
