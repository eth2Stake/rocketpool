pragma solidity 0.7.6;

import "../../interface/SafeStakeStorageInterface.sol";

// SPDX-License-Identifier: GPL-3.0-only

abstract contract SafeStakeNodeDistributorStorageLayout {
    SafeStakeStorageInterface safeStakeStorage;
    address nodeAddress;
}