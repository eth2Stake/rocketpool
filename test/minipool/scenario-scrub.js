// Dissolve a minipool
import {
    RocketDAONodeTrusted,
    RocketDAONodeTrustedSettingsMinipool, RocketDAOProtocolSettingsNode, RocketNetworkPrices,
    RocketNodeDeposit,
    RocketTokenRPL,
    RocketVault
} from '../_utils/artifacts';
import { assertBN } from '../_helpers/bn';
import { minipoolStates } from '../_helpers/minipool';


export async function voteScrub(minipool, txOptions) {
    // Get minipool owner
    const nodeAddress = await minipool.getNodeAddress.call();

    // Get contracts
    const rocketNodeDeposit = await RocketNodeDeposit.deployed();
    const rocketDAONodeTrustedSettingsMinipool = await RocketDAONodeTrustedSettingsMinipool.deployed();

    // Get minipool details
    function getMinipoolDetails() {
        return Promise.all([
            minipool.getStatus.call(),
            minipool.getUserDepositBalance.call(),
            minipool.getTotalScrubVotes.call(),
            minipool.getVacant.call()
        ]).then(
            ([status, userDepositBalance, votes, vacant]) =>
            ({status, userDepositBalance, votes, vacant})
        );
    }

    // Get initial minipool details
    let details1 = await getMinipoolDetails();

    // Dissolve
    await minipool.voteScrub(txOptions);

    // Get updated minipool details
    let details2 = await getMinipoolDetails();

    // Get member count
    const rocketDAONodeTrusted = await RocketDAONodeTrusted.deployed();
    const memberCount = await rocketDAONodeTrusted.getMemberCount();
    const quorum = memberCount.div('2'.BN);

    // Check state
    if (details1.votes.add('1'.BN).gt(quorum)){
        assertBN.equal(details2.status, minipoolStates.Dissolved, 'Incorrect updated minipool status');
    } else {
        assertBN.equal(details2.votes.sub(details1.votes), 1, 'Vote count not incremented');
        assertBN.notEqual(details2.status, minipoolStates.Dissolved, 'Incorrect updated minipool status');
    }
}
