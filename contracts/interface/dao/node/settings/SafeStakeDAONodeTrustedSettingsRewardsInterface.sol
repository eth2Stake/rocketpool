pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

interface SafeStakeDAONodeTrustedSettingsRewardsInterface {
    function getNetworkEnabled(uint256 _network) external view returns (bool);
}
