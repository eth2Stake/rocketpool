pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "./SafeStakeDAOProtocolSettings.sol";
import "../../../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNodeInterface.sol";

// Network auction settings

contract SafeStakeDAOProtocolSettingsNode is SafeStakeDAOProtocolSettings, SafeStakeDAOProtocolSettingsNodeInterface {

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeDAOProtocolSettings(_safeStakeStorageAddress, "node") {
        // Set version
        version = 2;
        // Initialize settings on deployment
        if(!getBool(keccak256(abi.encodePacked(settingNameSpace, "deployed")))) {
            // Apply settings
            setSettingBool("node.registration.enabled", false);
            setSettingBool("node.deposit.enabled", false);
            // Settings initialised
            setBool(keccak256(abi.encodePacked(settingNameSpace, "deployed")), true);
        }
    }

    // Node registrations currently enabled
    function getRegistrationEnabled() override external view returns (bool) {
        return getSettingBool("node.registration.enabled");
    }

    // Node deposits currently enabled
    function getDepositEnabled() override external view returns (bool) {
        return getSettingBool("node.deposit.enabled");
    }

}
