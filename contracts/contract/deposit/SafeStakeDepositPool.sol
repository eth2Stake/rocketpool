pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../SafeStakeBase.sol";
import "../../interface/SafeStakeVaultInterface.sol";
import "../../interface/SafeStakeVaultWithdrawerInterface.sol";
import "../../interface/deposit/SafeStakeDepositPoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolQueueInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsDepositInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsMinipoolInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";
import "../../interface/token/SafeStakeTokenSFETHInterface.sol";
import "../../types/MinipoolDeposit.sol";

// The main entry point for deposits into the RP network
// Accepts user deposits and mints sfETH; handles assignment of deposited ETH to minipools

contract SafeStakeDepositPool is SafeStakeBase, SafeStakeDepositPoolInterface, SafeStakeVaultWithdrawerInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event DepositReceived(address indexed from, uint256 amount, uint256 time);
    event DepositRecycled(address indexed from, uint256 amount, uint256 time);
    event DepositAssigned(address indexed minipool, uint256 amount, uint256 time);
    event ExcessWithdrawn(address indexed to, uint256 amount, uint256 time);


    // Structs
    struct MinipoolAssignment {
        address minipoolAddress;
        uint256 etherAssigned;
    }

    // Modifiers
    modifier onlyThisLatestContract() {
        // Compiler can optimise out this keccak at compile time
        require(address(this) == getAddress(keccak256("contract.addresssafeStakeDepositPool")), "Invalid or outdated contract");
        _;
    }

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 2;
    }

    // Current deposit pool balance
    function getBalance() override public view returns (uint256) {
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        return safeStakeVault.balanceOf("safeStakeDepositPool");
    }

    // Excess deposit pool balance (in excess of minipool queue capacity)
    function getExcessBalance() override public view returns (uint256) {
        // Get minipool queue capacity
        SafeStakeMinipoolQueueInterface safeStakeMinipoolQueue = SafeStakeMinipoolQueueInterface(getContractAddress("safeStakeMinipoolQueue"));
        uint256 minipoolCapacity = safeStakeMinipoolQueue.getEffectiveCapacity();
        // Calculate and return
        uint256 balance = getBalance();
        if (minipoolCapacity >= balance) { return 0; }
        else { return balance.sub(minipoolCapacity); }
    }

    // Receive a vault withdrawal
    // Only accepts calls from the SafeStakeVault contract
    function receiveVaultWithdrawalETH() override external payable onlyThisLatestContract onlyLatestContract("safeStakeVault", msg.sender) {}

    // Accept a deposit from a user
    function deposit() override external payable onlyThisLatestContract {
        // Check deposit settings
        SafeStakeDAOProtocolSettingsDepositInterface safeStakeDAOProtocolSettingsDeposit = SafeStakeDAOProtocolSettingsDepositInterface(getContractAddress("safeStakeDAOProtocolSettingsDeposit"));
        require(safeStakeDAOProtocolSettingsDeposit.getDepositEnabled(), "Deposits into SafeStake Pool are currently disabled");
        require(msg.value >= safeStakeDAOProtocolSettingsDeposit.getMinimumDeposit(), "The deposited amount is less than the minimum deposit size");
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        require(safeStakeVault.balanceOf("safeStakeDepositPool").add(msg.value) <= safeStakeDAOProtocolSettingsDeposit.getMaximumDepositPoolSize(), "The deposit pool size after depositing exceeds the maximum size");
        // Calculate deposit fee
        uint256 depositFee = msg.value.mul(safeStakeDAOProtocolSettingsDeposit.getDepositFee()).div(calcBase);
        uint256 depositNet = msg.value.sub(depositFee);
        // Mint sfETH to user account
        SafeStakeTokenSFETHInterface safeStakeTokenSFETH = SafeStakeTokenSFETHInterface(getContractAddress("safeStakeTokenSFETH"));
        safeStakeTokenSFETH.mint(depositNet, msg.sender);
        // Emit deposit received event
        emit DepositReceived(msg.sender, msg.value, block.timestamp);
        // Process deposit
        processDeposit(safeStakeVault, safeStakeDAOProtocolSettingsDeposit);
    }

    // Recycle a deposit from a dissolved minipool
    // Only accepts calls from registered minipools
    function recycleDissolvedDeposit() override external payable onlyThisLatestContract onlyRegisteredMinipool(msg.sender) {
        // Load contracts
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        SafeStakeDAOProtocolSettingsDepositInterface safeStakeDAOProtocolSettingsDeposit = SafeStakeDAOProtocolSettingsDepositInterface(getContractAddress("safeStakeDAOProtocolSettingsDeposit"));
        // Recycle ETH
        emit DepositRecycled(msg.sender, msg.value, block.timestamp);
        processDeposit(safeStakeVault, safeStakeDAOProtocolSettingsDeposit);
    }

    // Recycle excess ETH from the sfETH token contract
    function recycleExcessCollateral() override external payable onlyThisLatestContract onlyLatestContract("safeStakeTokenSFETH", msg.sender) {
        // Load contracts
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        SafeStakeDAOProtocolSettingsDepositInterface safeStakeDAOProtocolSettingsDeposit = SafeStakeDAOProtocolSettingsDepositInterface(getContractAddress("safeStakeDAOProtocolSettingsDeposit"));
        // Recycle ETH
        emit DepositRecycled(msg.sender, msg.value, block.timestamp);
        processDeposit(safeStakeVault, safeStakeDAOProtocolSettingsDeposit);
    }

    // Process a deposit
    function processDeposit(SafeStakeVaultInterface _safeStakeVault, SafeStakeDAOProtocolSettingsDepositInterface _safeStakeDAOProtocolSettingsDeposit) private {
        // Transfer ETH to vault
        _safeStakeVault.depositEther{value: msg.value}();
        // Assign deposits if enabled
        _assignDeposits(_safeStakeVault, _safeStakeDAOProtocolSettingsDeposit);
    }

    // Assign deposits to available minipools
    function assignDeposits() override external onlyThisLatestContract {
        // Load contracts
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        SafeStakeDAOProtocolSettingsDepositInterface safeStakeDAOProtocolSettingsDeposit = SafeStakeDAOProtocolSettingsDepositInterface(getContractAddress("safeStakeDAOProtocolSettingsDeposit"));
        // Revert if assigning is disabled
        require(_assignDeposits(safeStakeVault, safeStakeDAOProtocolSettingsDeposit), "Deposit assignments are currently disabled");
    }

    // Assigns deposits to available minipools, returns false if assignment is currently disabled
    function _assignDeposits(SafeStakeVaultInterface _safeStakeVault, SafeStakeDAOProtocolSettingsDepositInterface _safeStakeDAOProtocolSettingsDeposit) private returns (bool) {
        // Check if assigning deposits is enabled
        if (!_safeStakeDAOProtocolSettingsDeposit.getAssignDepositsEnabled()) {
            return false;
        }
        // Load contracts
        SafeStakeDAOProtocolSettingsMinipoolInterface safeStakeDAOProtocolSettingsMinipool = SafeStakeDAOProtocolSettingsMinipoolInterface(getContractAddress("safeStakeDAOProtocolSettingsMinipool"));
        SafeStakeMinipoolQueueInterface safeStakeMinipoolQueue = SafeStakeMinipoolQueueInterface(getContractAddress("safeStakeMinipoolQueue"));
        // Setup initial variable values
        uint256 balance = _safeStakeVault.balanceOf("safeStakeDepositPool");
        uint256 totalEther = 0;
        // Calculate minipool assignments
        uint256 maxAssignments = _safeStakeDAOProtocolSettingsDeposit.getMaximumDepositAssignments();
        MinipoolAssignment[] memory assignments = new MinipoolAssignment[](maxAssignments);
        MinipoolDeposit depositType = MinipoolDeposit.None;
        uint256 count = 0;
        uint256 minipoolCapacity = 0;
        for (uint256 i = 0; i < maxAssignments; ++i) {
            // Optimised for multiple of the same deposit type
            if (count == 0) {
                (depositType, count) = safeStakeMinipoolQueue.getNextDeposit();
                if (depositType == MinipoolDeposit.None) { break; }
                minipoolCapacity = safeStakeDAOProtocolSettingsMinipool.getDepositUserAmount(depositType);
            }
            count--;
            if (minipoolCapacity == 0 || balance.sub(totalEther) < minipoolCapacity) { break; }
            // Dequeue the minipool
            address minipoolAddress = safeStakeMinipoolQueue.dequeueMinipoolByDeposit(depositType);
            // Update running total
            totalEther = totalEther.add(minipoolCapacity);
            // Add assignment
            assignments[i].etherAssigned = minipoolCapacity;
            assignments[i].minipoolAddress = minipoolAddress;
        }
        if (totalEther > 0) {
            // Withdraw ETH from vault
            _safeStakeVault.withdrawEther(totalEther);
            // Perform assignments
            for (uint256 i = 0; i < maxAssignments; ++i) {
                if (assignments[i].etherAssigned == 0) { break; }
                SafeStakeMinipoolInterface minipool = SafeStakeMinipoolInterface(assignments[i].minipoolAddress);
                // Assign deposit to minipool
                minipool.userDeposit{value: assignments[i].etherAssigned}();
                // Emit deposit assigned event
                emit DepositAssigned(assignments[i].minipoolAddress, assignments[i].etherAssigned, block.timestamp);
            }
        }
        return true;
    }

    // Withdraw excess deposit pool balance for sfETH collateral
    function withdrawExcessBalance(uint256 _amount) override external onlyThisLatestContract onlyLatestContract("safeStakeTokenSFETH", msg.sender) {
        // Load contracts
        SafeStakeTokenSFETHInterface safeStakeTokenSFETH = SafeStakeTokenSFETHInterface(getContractAddress("safeStakeTokenSFETH"));
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        // Check amount
        require(_amount <= getExcessBalance(), "Insufficient excess balance for withdrawal");
        // Withdraw ETH from vault
        safeStakeVault.withdrawEther(_amount);
        // Transfer to sfETH contract
        safeStakeTokenSFETH.depositExcess{value: _amount}();
        // Emit excess withdrawn event
        emit ExcessWithdrawn(msg.sender, _amount, block.timestamp);
    }
}
