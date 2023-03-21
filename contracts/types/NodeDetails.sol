pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

// A struct containing all the information on-chain about a specific node

struct NodeDetails {
    bool exists;
    uint256 registrationTime;
    string timezoneLocation;
    bool feeDistributorInitialised;
    address feeDistributorAddress;
    uint256 rewardNetwork;
    uint256 minipoolLimit;
    uint256 minipoolCount;
    uint256 balanceETH;
    uint256 balanceSFETH;
    address withdrawalAddress;
    address pendingWithdrawalAddress;
}
