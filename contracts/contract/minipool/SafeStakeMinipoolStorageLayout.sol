pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "../../interface/SafeStakeStorageInterface.sol";
import "../../types/MinipoolDeposit.sol";
import "../../types/MinipoolStatus.sol";

// The SafeStakeMinipool contract storage layout, shared by SafeStakeMinipoolDelegate

// ******************************************************
// Note: This contract MUST NOT BE UPDATED after launch.
// All deployed minipool contracts must maintain a
// Consistent storage layout with SafeStakeMinipoolDelegate.
// ******************************************************

abstract contract SafeStakeMinipoolStorageLayout {
    // Storage state enum
    enum StorageState {
        Undefined,
        Uninitialised,
        Initialised
    }

    uint256 internal prelaunchAmount;                  // The amount of ETH initially deposited when minipool is created

	// Main SafeStake Pool storage contract
    SafeStakeStorageInterface internal safeStakeStorage = SafeStakeStorageInterface(0);

    // Status
    MinipoolStatus internal status;
    uint256 internal statusBlock;
    uint256 internal statusTime;
    uint256 internal withdrawalBlock;

    // Deposit type
    MinipoolDeposit internal depositType;

    // Node details
    address internal nodeAddress;
    uint256 internal nodeFee;
    uint256 internal nodeDepositBalance;
    bool internal nodeDepositAssigned;
    uint256 internal nodeRefundBalance;
    uint256 internal nodeSlashBalance;

    // User deposit details
    uint256 internal userDepositBalance;
    uint256 internal userDepositAssignedTime;

    // Upgrade options
    bool internal useLatestDelegate = false;
    address internal safeStakeMinipoolDelegate;
    address internal safeStakeMinipoolDelegatePrev;

    // Local copy of SFETH address
    address internal safeStakeTokenSFETH;

    // Local copy of penalty contract
    address internal safeStakeMinipoolPenalty;

    // Used to prevent direct access to delegate and prevent calling initialise more than once
    StorageState storageState = StorageState.Undefined;

    // Whether node operator has finalised the pool
    bool internal finalised;

    // Trusted member scrub votes
    mapping(address => bool) memberScrubVotes;
    uint256 totalScrubVotes;
}
