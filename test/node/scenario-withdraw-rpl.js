import { SafeStakeMinipoolManager, SafeStakeDAOProtocolSettingsMinipool, SafeStakeNetworkPrices, SafeStakeDAOProtocolSettingsNode, SafeStakeNodeStaking, SafeStakeTokenRPL, SafeStakeVault } from '../_utils/artifacts';


// Withdraw RPL staked against the node
export async function withdrawRpl(amount, txOptions) {

    // Load contracts
    const [
        safeStakeMinipoolManager,
        safeStakeDAOProtocolSettingsMinipool,
        safeStakeNetworkPrices,
        safeStakeDAOProtocolSettingsNode,
        safeStakeNodeStaking,
        safeStakeTokenRPL,
        safeStakeVault,
    ] = await Promise.all([
        SafeStakeMinipoolManager.deployed(),
        SafeStakeDAOProtocolSettingsMinipool.deployed(),
        SafeStakeNetworkPrices.deployed(),
        SafeStakeDAOProtocolSettingsNode.deployed(),
        SafeStakeNodeStaking.deployed(),
        SafeStakeTokenRPL.deployed(),
        SafeStakeVault.deployed(),
    ]);

    // Get parameters
    const [
        depositUserAmount,
        minPerMinipoolStake,
        maxPerMinipoolStake,
        rplPrice,
    ] = await Promise.all([
        safeStakeDAOProtocolSettingsMinipool.getHalfDepositUserAmount.call(),
        safeStakeDAOProtocolSettingsNode.getMinimumPerMinipoolStake.call(),
        safeStakeDAOProtocolSettingsNode.getMaximumPerMinipoolStake.call(),
        safeStakeNetworkPrices.getRPLPrice.call(),
    ]);

    // Get token balances
    function getTokenBalances(nodeAddress) {
        return Promise.all([
            safeStakeTokenRPL.balanceOf.call(nodeAddress),
            safeStakeTokenRPL.balanceOf.call(safeStakeVault.address),
            safeStakeVault.balanceOfToken.call('safeStakeNodeStaking', safeStakeTokenRPL.address),
        ]).then(
            ([nodeRpl, vaultRpl, stakingRpl]) =>
            ({nodeRpl, vaultRpl, stakingRpl})
        );
    }

    // Get staking details
    function getStakingDetails(nodeAddress) {
        return Promise.all([
            safeStakeNodeStaking.getTotalRPLStake.call(),
            safeStakeNodeStaking.getTotalEffectiveRPLStake.call(),
            safeStakeNodeStaking.getNodeRPLStake.call(nodeAddress),
            safeStakeNodeStaking.getNodeEffectiveRPLStake.call(nodeAddress),
            safeStakeNodeStaking.getNodeMinipoolLimit.call(nodeAddress),
        ]).then(
            ([totalStake, totalEffectiveStake, nodeStake, nodeEffectiveStake, nodeMinipoolLimit]) =>
            ({totalStake, totalEffectiveStake, nodeStake, nodeEffectiveStake, nodeMinipoolLimit})
        );
    }

    // Get minipool counts
    function getMinipoolCounts(nodeAddress) {
        return Promise.all([
            safeStakeMinipoolManager.getMinipoolCount.call(),
            safeStakeMinipoolManager.getNodeMinipoolCount.call(nodeAddress),
        ]).then(
            ([total, node]) =>
            ({total, node})
        );
    }

    // Get initial token balances & staking details
    let [balances1, details1] = await Promise.all([
        getTokenBalances(txOptions.from),
        getStakingDetails(txOptions.from),
    ]);

    // Withdraw RPL
    await safeStakeNodeStaking.withdrawRPL(amount, txOptions);

    // Get updated token balances, staking details & minipool counts
    let [balances2, details2, minipoolCounts] = await Promise.all([
        getTokenBalances(txOptions.from),
        getStakingDetails(txOptions.from),
        getMinipoolCounts(txOptions.from),
    ]);

    // Calculate expected effective stakes & node minipool limit
    const maxTotalEffectiveStake = depositUserAmount.mul(maxPerMinipoolStake).mul(minipoolCounts.total).div(rplPrice);
    const expectedTotalEffectiveStake = (details2.totalStake.lt(maxTotalEffectiveStake)? details2.totalStake : maxTotalEffectiveStake);
    const maxNodeEffectiveStake = depositUserAmount.mul(maxPerMinipoolStake).mul(minipoolCounts.node).div(rplPrice);
    const expectedNodeEffectiveStake = (details2.nodeStake.lt(maxNodeEffectiveStake)? details2.nodeStake : maxNodeEffectiveStake);
    const expectedNodeMinipoolLimit = details2.nodeStake.mul(rplPrice).div(depositUserAmount.mul(minPerMinipoolStake));

    // Check token balances
    assert(balances2.nodeRpl.eq(balances1.nodeRpl.add(web3.utils.toBN(amount))), 'Incorrect updated node RPL balance');
    assert(balances2.vaultRpl.eq(balances1.vaultRpl.sub(web3.utils.toBN(amount))), 'Incorrect updated vault RPL balance');
    assert(balances2.stakingRpl.eq(balances1.stakingRpl.sub(web3.utils.toBN(amount))), 'Incorrect updated SafeStakeNodeStaking contract RPL vault balance');

    // Check staking details
    assert(details2.totalStake.eq(details1.totalStake.sub(web3.utils.toBN(amount))), 'Incorrect updated total RPL stake');
    assert(details2.nodeStake.eq(details1.nodeStake.sub(web3.utils.toBN(amount))), 'Incorrect updated node RPL stake');
    assert(details2.totalEffectiveStake.eq(expectedTotalEffectiveStake), 'Incorrect updated effective total RPL stake');
    assert(details2.nodeEffectiveStake.eq(expectedNodeEffectiveStake), 'Incorrect updated effective node RPL stake');
    assert(details2.nodeMinipoolLimit.eq(expectedNodeMinipoolLimit), 'Incorrect updated node minipool limit');

}

