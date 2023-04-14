pragma solidity 0.7.6;

import "../../../../dao/protocol/settings/RocketDAOProtocolSettings.sol";
import "../../../../../interface/old/RocketDAOProtocolSettingsNodeInterfaceOld.sol";

// SPDX-License-Identifier: GPL-3.0-only


// Network auction settings

contract RocketDAOProtocolSettingsNodeOld is RocketDAOProtocolSettings, RocketDAOProtocolSettingsNodeInterfaceOld {

    // Construct
    constructor(RocketStorageInterface _rocketStorageAddress) RocketDAOProtocolSettings(_rocketStorageAddress, "node") {
        // Set version
        version = 2;
        // Initialize settings on deployment
        if(!getBool(keccak256(abi.encodePacked(settingNameSpace, "deployed")))) {
            // Apply settings
            setSettingBool("node.registration.enabled", false);
            setSettingBool("node.deposit.enabled", false);
            setSettingBool("node.vacant.minipools.enabled", false);
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
