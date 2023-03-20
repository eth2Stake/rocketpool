pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../SafeStakeBase.sol";
import "../../interface/deposit/SafeStakeDepositPoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolManagerInterface.sol";
import "../../interface/network/SafeStakeNetworkFeesInterface.sol";
import "../../interface/node/SafeStakeNodeDepositInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsDepositInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsMinipoolInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";
import "../../interface/dao/node/SafeStakeDAONodeTrustedInterface.sol";
import "../../interface/dao/node/settings/SafeStakeDAONodeTrustedSettingsMembersInterface.sol";
import "../../types/MinipoolDeposit.sol";
import "../../interface/node/SafeStakeNodeManagerInterface.sol";

// Handles node deposits and minipool creation

contract SafeStakeNodeDeposit is SafeStakeBase, SafeStakeNodeDepositInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event DepositReceived(address indexed from, uint256 amount, uint256 time);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 2;
    }

    // Accept a node deposit and create a new minipool under the node
    // Only accepts calls from registered nodes
    function deposit(uint256 _minimumNodeFee, bytes calldata _validatorPubkey, bytes calldata _validatorSignature, bytes32 _depositDataRoot, uint256 _salt, address _expectedMinipoolAddress) override external payable onlyLatestContract("safeStakeNodeDeposit", address(this)) onlyRegisteredNode(msg.sender) {
        // Load contracts
        SafeStakeMinipoolManagerInterface safeStakeMinipoolManager = SafeStakeMinipoolManagerInterface(getContractAddress("safeStakeMinipoolManager"));
        // Check deposits are enabled
        checkDepositsEnabled();
        // Check minipool doesn't exist or previously exist
        require(!safeStakeMinipoolManager.getMinipoolExists(_expectedMinipoolAddress) && !safeStakeMinipoolManager.getMinipoolDestroyed(_expectedMinipoolAddress), "Minipool already exists or was previously destroyed");
        {
            // Check node has initialised their fee distributor
            SafeStakeNodeManagerInterface safeStakeNodeManager = SafeStakeNodeManagerInterface(getContractAddress("safeStakeNodeManager"));
            require(safeStakeNodeManager.getFeeDistributorInitialised(msg.sender), "Fee distributor not initialised");
        }
        // Check node fee
        checkNodeFee(_minimumNodeFee);
        // Get Deposit type
        MinipoolDeposit depositType = getDepositType(msg.value);
        // Check it's a valid deposit size
        require(depositType != MinipoolDeposit.None, "Invalid node deposit amount");
        // Emit deposit received event
        emit DepositReceived(msg.sender, msg.value, block.timestamp);
        // Create minipool
        SafeStakeMinipoolInterface minipool = safeStakeMinipoolManager.createMinipool(msg.sender, depositType, _salt);
        // Ensure minipool address matches expected
        require(address(minipool) == _expectedMinipoolAddress, "Unexpected minipool address");
        // Transfer deposit to minipool
        minipool.nodeDeposit{value: msg.value}(_validatorPubkey, _validatorSignature, _depositDataRoot);
        // Assign deposits if enabled
        assignDeposits();
    }

    // Returns the minipool deposit enum value correseponding to the supplied deposit amount
    function getDepositType(uint256 _amount) public override view returns (MinipoolDeposit) {
        // Get contract
        SafeStakeDAOProtocolSettingsMinipoolInterface safeStakeDAOProtocolSettingsMinipool = SafeStakeDAOProtocolSettingsMinipoolInterface(getContractAddress("safeStakeDAOProtocolSettingsMinipool"));
        // Get deposit type by node deposit amount
        if (_amount == safeStakeDAOProtocolSettingsMinipool.getFullDepositNodeAmount()) { return MinipoolDeposit.Full; }
        else if (_amount == safeStakeDAOProtocolSettingsMinipool.getHalfDepositNodeAmount()) { return MinipoolDeposit.Half; }
        else if (_amount == safeStakeDAOProtocolSettingsMinipool.getQuarterDepositNodeAmount() ) { return MinipoolDeposit.Quarter; }
        // Invalid deposit amount
        return MinipoolDeposit.None;
    }

    function checkNodeFee(uint256 _minimumNodeFee) private view {
        // Load contracts
        SafeStakeNetworkFeesInterface safeStakeNetworkFees = SafeStakeNetworkFeesInterface(getContractAddress("safeStakeNetworkFees"));
        // Check current node fee
        uint256 nodeFee = safeStakeNetworkFees.getNodeFee();
        require(nodeFee >= _minimumNodeFee, "Minimum node fee exceeds current network node fee");
    }

    function checkDepositsEnabled() private view {
        // Get contracts
        SafeStakeDAOProtocolSettingsNodeInterface safeStakeDAOProtocolSettingsNode = SafeStakeDAOProtocolSettingsNodeInterface(getContractAddress("safeStakeDAOProtocolSettingsNode"));
        // Check node settings
        require(safeStakeDAOProtocolSettingsNode.getDepositEnabled(), "Node deposits are currently disabled");
    }

    function assignDeposits() private {
        SafeStakeDAOProtocolSettingsDepositInterface safeStakeDAOProtocolSettingsDeposit = SafeStakeDAOProtocolSettingsDepositInterface(getContractAddress("safeStakeDAOProtocolSettingsDeposit"));
        if (safeStakeDAOProtocolSettingsDeposit.getAssignDepositsEnabled()) {
            SafeStakeDepositPoolInterface safeStakeDepositPool = SafeStakeDepositPoolInterface(getContractAddress("safeStakeDepositPool"));
            safeStakeDepositPool.assignDeposits();
        }
    }
}
