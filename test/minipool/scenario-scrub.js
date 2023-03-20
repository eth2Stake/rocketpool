// Dissolve a minipool
import {
    SafeStakeDAONodeTrusted,
    SafeStakeDAONodeTrustedSettingsMinipool, SafeStakeDAOProtocolSettingsNode, SafeStakeNetworkPrices,
    SafeStakeNodeStaking,
    SafeStakeTokenRPL,
    SafeStakeVault
} from '../_utils/artifacts';


export async function voteScrub(minipool, txOptions) {

    // Get minipool owner
    const nodeAddress = await minipool.getNodeAddress.call();

    // Get contracts
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    const safeStakeVault = await SafeStakeVault.deployed();
    const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
    const safeStakeDAONodeTrustedSettingsMinipool = await SafeStakeDAONodeTrustedSettingsMinipool.deployed();
    const safeStakeNetworkPrices = await SafeStakeNetworkPrices.deployed();
    const safeStakeDAOProtocolSettingsNode = await SafeStakeDAOProtocolSettingsNode.deployed();

    // Get minipool details
    function getMinipoolDetails() {
        return Promise.all([
            minipool.getStatus.call(),
            minipool.getUserDepositBalance.call(),
            minipool.getTotalScrubVotes.call(),
            safeStakeNodeStaking.getNodeRPLStake.call(nodeAddress),
            safeStakeVault.balanceOfToken('safeStakeAuctionManager', safeStakeTokenRPL.address),
            safeStakeDAONodeTrustedSettingsMinipool.getScrubPenaltyEnabled()
        ]).then(
            ([status, userDepositBalance, votes, nodeRPLStake, auctionBalance, penaltyEnabled]) =>
            ({status, userDepositBalance, votes, nodeRPLStake, auctionBalance, penaltyEnabled})
        );
    }

    // Get initial minipool details
    let details1 = await getMinipoolDetails();

    // Dissolve
    await minipool.voteScrub(txOptions);

    // Get updated minipool details
    let details2 = await getMinipoolDetails();

    // Get member count
    const safeStakeDAONodeTrusted = await SafeStakeDAONodeTrusted.deployed();
    const memberCount = web3.utils.toBN(await safeStakeDAONodeTrusted.getMemberCount());
    const quorum = memberCount.div(web3.utils.toBN(2));

    // Check state
    const dissolved = web3.utils.toBN(4);
    if (details1.votes.add(web3.utils.toBN(1)).gt(quorum)){
        assert(details2.status.eq(dissolved), 'Incorrect updated minipool status');
        assert(details2.userDepositBalance.eq(web3.utils.toBN(0)), 'Incorrect updated minipool user deposit balance');
        // Check slashing if penalties are enabled
        if (details1.penaltyEnabled) {
            // Calculate amount slashed
            const slashAmount = details1.nodeRPLStake.sub(details2.nodeRPLStake);
            // Get current RPL price
            const rplPrice = await safeStakeNetworkPrices.getRPLPrice.call();
            // Calculate amount slashed in ETH
            const slashAmountEth = slashAmount.mul(rplPrice).div(web3.utils.toBN(web3.utils.toWei('1', 'ether')));
            // Calculate expected slash amount
            const minimumStake = await safeStakeDAOProtocolSettingsNode.getMinimumPerMinipoolStake();
            const expectedSlash = web3.utils.toBN(web3.utils.toWei('16', 'ether')).mul(minimumStake).div(web3.utils.toBN(web3.utils.toWei('1', 'ether')));
            // Perform checks
            assert(slashAmountEth.eq(expectedSlash), 'Amount of RPL slashed is incorrect');
            assert(details2.auctionBalance.sub(details1.auctionBalance).eq(slashAmount), 'RPL was not sent to auction manager');
        }
    } else {
        assert(details2.votes.sub(details1.votes).eq(web3.utils.toBN(1)), 'Vote count not incremented');
        assert(!details2.status.eq(dissolved), 'Incorrect updated minipool status');
        assert(details2.nodeRPLStake.eq(details1.nodeRPLStake), 'RPL was slashed');
    }

}

