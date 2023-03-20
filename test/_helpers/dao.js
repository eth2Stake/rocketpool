import { SafeStakeDAONodeTrusted, SafeStakeDAONodeTrustedActions, SafeStakeDAONodeTrustedSettingsMembers } from '../_utils/artifacts';
import { mintRPL, approveRPL } from './tokens';


export async function mintRPLBond(owner, node) {

    // Load contracts
    const [
        safeStakeDAONodeTrustedActions,
        safeStakeDAONodeTrustedSettings,
    ] = await Promise.all([
        SafeStakeDAONodeTrustedActions.deployed(),
        SafeStakeDAONodeTrustedSettingsMembers.deployed(),
    ]);

    // Get RPL bond amount
    const bondAmount = await safeStakeDAONodeTrustedSettings.getRPLBond.call();

    // Mint RPL amount and approve DAO node contract to spend
    await mintRPL(owner, node, bondAmount);
    await approveRPL(safeStakeDAONodeTrustedActions.address, bondAmount, {from: node});

}


export async function bootstrapMember(address, id, url, txOptions) {
    const safeStakeDAONodeTrusted = await SafeStakeDAONodeTrusted.deployed();
    await safeStakeDAONodeTrusted.bootstrapMember(id, url, address, txOptions);
}


export async function memberJoin(txOptions) {
    const safeStakeDAONodeTrustedActions = await SafeStakeDAONodeTrustedActions.deployed();
    await safeStakeDAONodeTrustedActions.actionJoin(txOptions);
}

