import { SafeStakeDAOProtocolSettingsAuction, SafeStakeDAOProtocolSettingsDeposit, SafeStakeDAOProtocolSettingsMinipool, SafeStakeDAOProtocolSettingsNetwork, SafeStakeDAOProtocolSettingsNode } from '../_utils/artifacts';


// Auction settings
export async function getAuctionSetting(setting) {
    const safeStakeAuctionSettings = await SafeStakeDAOProtocolSettingsAuction.deployed();
    let value = await safeStakeAuctionSettings['get' + setting].call();
    return value;
}

// Deposit settings
export async function getDepositSetting(setting) {
    const safeStakeDAOProtocolSettingsDeposit = await SafeStakeDAOProtocolSettingsDeposit.deployed();
    let value = await safeStakeDAOProtocolSettingsDeposit['get' + setting].call();
    return value;
}

// Minipool settings
export async function getMinipoolSetting(setting) {
    const safeStakeDAOProtocolSettingsMinipool = await SafeStakeDAOProtocolSettingsMinipool.deployed();
    let value = await safeStakeDAOProtocolSettingsMinipool['get' + setting].call();
    return value;
}

// Network settings
export async function getNetworkSetting(setting) {
    const safeStakeDAOProtocolSettingsNetwork = await SafeStakeDAOProtocolSettingsNetwork.deployed();
    let value = await safeStakeDAOProtocolSettingsNetwork['get' + setting].call();
    return value;
}

// Node settings
export async function getNodeSetting(setting) {
    const safeStakeDAOProtocolSettingsNode = await SafeStakeDAOProtocolSettingsNode.deployed();
    let value = await safeStakeDAOProtocolSettingsNode['get' + setting].call();
    return value;
}


