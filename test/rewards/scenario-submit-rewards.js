import {
    SafeStakeClaimDAO,
    SafeStakeDAONodeTrusted,
    SafeStakeNetworkPrices,
    SafeStakeRewardsPool,
    SafeStakeStorage,
    SafeStakeTokenRETH, SafeStakeTokenRPL,
} from '../_utils/artifacts';
import { parseRewardsMap } from '../_utils/merkle-tree';


// Submit rewards
export async function submitRewards(index, rewards, treasuryRPL, userETH, txOptions) {

    // Load contracts
    const [
        safeStakeDAONodeTrusted,
        safeStakeRewardsPool,
        safeStakeTokenRETH,
        safeStakeTokenRPL,
        safeStakeClaimDAO
    ] = await Promise.all([
        SafeStakeDAONodeTrusted.deployed(),
        SafeStakeRewardsPool.deployed(),
        SafeStakeTokenRETH.deployed(),
        SafeStakeTokenRPL.deployed(),
        SafeStakeClaimDAO.deployed()
    ]);

    // Get parameters
    let trustedNodeCount = await safeStakeDAONodeTrusted.getMemberCount.call();

    // Construct the merkle tree
    let treeData = parseRewardsMap(rewards);

    const trustedNodeRPL = [];
    const nodeRPL = [];
    const nodeETH = [];
    treasuryRPL = web3.utils.toBN(treasuryRPL);
    userETH = web3.utils.toBN(userETH);

    let maxNetwork = rewards.reduce((a,b) => Math.max(a, b.network), 0);

    for(let i = 0; i <= maxNetwork; i++) {
        trustedNodeRPL[i] = web3.utils.toBN('0')
        nodeRPL[i] = web3.utils.toBN('0')
        nodeETH[i] = web3.utils.toBN('0')
    }

    for(let i = 0; i < rewards.length; i++) {
        trustedNodeRPL[rewards[i].network] = trustedNodeRPL[rewards[i].network].add(web3.utils.toBN(rewards[i].trustedNodeRPL))
        nodeRPL[rewards[i].network] = nodeRPL[rewards[i].network].add(web3.utils.toBN(rewards[i].nodeRPL))
        nodeETH[rewards[i].network] = nodeETH[rewards[i].network].add(web3.utils.toBN(rewards[i].nodeETH))
    }

    // web3 doesn't like an array of BigNumbers, have to convert to dec string
    for(let i = 0; i <= maxNetwork; i++) {
        trustedNodeRPL[i] = trustedNodeRPL[i].toString()
        nodeRPL[i] = nodeRPL[i].toString()
        nodeETH[i] = nodeETH[i].toString()
    }

    const root = treeData.proof.merkleRoot;
    const cid = '0';

    const submission = {
        rewardIndex: index,
        executionBlock: '0',
        consensusBlock: '0',
        merkleRoot: root,
        merkleTreeCID: cid,
        intervalsPassed: '1',
        treasuryRPL: treasuryRPL.toString(),
        trustedNodeRPL: trustedNodeRPL,
        nodeRPL: nodeRPL,
        nodeETH: nodeETH,
        userETH: userETH.toString()
    }

    // Get submission details
    function getSubmissionDetails() {
        return Promise.all([
            safeStakeRewardsPool.getTrustedNodeSubmitted(txOptions.from, index),
            safeStakeRewardsPool.getSubmissionCount(submission),
        ]).then(
            ([nodeSubmitted, count]) =>
            ({nodeSubmitted, count})
        );
    }

    // Get initial submission details
    let [submission1, rewardIndex1, treasuryRpl1, rethBalance1] = await Promise.all([
        getSubmissionDetails(),
        safeStakeRewardsPool.getRewardIndex(),
        safeStakeTokenRPL.balanceOf(safeStakeClaimDAO.address),
        web3.eth.getBalance(safeStakeTokenRETH.address)
    ]);


    // Submit prices
    await safeStakeRewardsPool.submitRewardSnapshot(submission, txOptions);

    // Get updated submission details & prices
    let [submission2, rewardIndex2, treasuryRpl2, rethBalance2] = await Promise.all([
        getSubmissionDetails(),
        safeStakeRewardsPool.getRewardIndex(),
        safeStakeTokenRPL.balanceOf(safeStakeClaimDAO.address),
        web3.eth.getBalance(safeStakeTokenRETH.address)
    ]);

    // Check if prices should be updated
    let expectedExecute = submission2.count.mul(web3.utils.toBN(2)).gt(trustedNodeCount);

    // Check submission details
    assert.isFalse(submission1.nodeSubmitted, 'Incorrect initial node submitted status');
    assert.isTrue(submission2.nodeSubmitted, 'Incorrect updated node submitted status');
    assert(submission2.count.eq(submission1.count.add(web3.utils.toBN(1))), 'Incorrect updated submission count');

    // Calculate changes in user ETH and treasury RPL
    rethBalance1 = web3.utils.toBN(rethBalance1);
    rethBalance2 = web3.utils.toBN(rethBalance2);
    let userETHChange = rethBalance2.sub(rethBalance1);
    treasuryRpl1 = web3.utils.toBN(treasuryRpl1);
    treasuryRpl2 = web3.utils.toBN(treasuryRpl2);
    let treasuryRPLChange = treasuryRpl2.sub(treasuryRpl1);

    // Check reward index and user balances
    if (expectedExecute) {
        assert(rewardIndex2.eq(rewardIndex1.add(web3.utils.toBN(1))), 'Incorrect updated network prices block');
        assert(userETHChange.eq(userETH), 'User ETH balance not correct');
        assert(treasuryRPLChange.eq(treasuryRPL), 'Treasury RPL balance not correct');
    } else {
        assert(rewardIndex2.eq(rewardIndex1), 'Incorrect updated network prices block');
        assert(rethBalance1.eq(rethBalance2), 'User ETH balance changed');
        assert(treasuryRpl1.eq(treasuryRpl2), 'Treasury RPL balance changed');
    }
}

// Execute a reward period that already has consensus
export async function executeRewards(index, rewards, treasuryRPL, userETH, txOptions) {

    // Load contracts
    const [
        safeStakeRewardsPool,
    ] = await Promise.all([
        SafeStakeRewardsPool.deployed(),
    ]);

    // Construct the merkle tree
    let treeData = parseRewardsMap(rewards);

    const trustedNodeRPL = [];
    const nodeRPL = [];
    const nodeETH = [];
    treasuryRPL = web3.utils.toBN(treasuryRPL);
    userETH = web3.utils.toBN(userETH);

    let maxNetwork = rewards.reduce((a,b) => Math.max(a, b.network), 0);

    for(let i = 0; i <= maxNetwork; i++) {
        trustedNodeRPL[i] = web3.utils.toBN('0')
        nodeRPL[i] = web3.utils.toBN('0')
        nodeETH[i] = web3.utils.toBN('0')
    }

    for(let i = 0; i < rewards.length; i++) {
        trustedNodeRPL[rewards[i].network] = trustedNodeRPL[rewards[i].network].add(web3.utils.toBN(rewards[i].trustedNodeRPL))
        nodeRPL[rewards[i].network] = nodeRPL[rewards[i].network].add(web3.utils.toBN(rewards[i].nodeRPL))
        nodeETH[rewards[i].network] = nodeETH[rewards[i].network].add(web3.utils.toBN(rewards[i].nodeETH))
    }

    // web3 doesn't like an array of BigNumbers, have to convert to dec string
    for(let i = 0; i <= maxNetwork; i++) {
        trustedNodeRPL[i] = trustedNodeRPL[i].toString()
        nodeRPL[i] = nodeRPL[i].toString()
        nodeETH[i] = nodeETH[i].toString()
    }

    const root = treeData.proof.merkleRoot;
    const cid = '0';

    const submission = {
        rewardIndex: index,
        executionBlock: 0,
        consensusBlock: 0,
        merkleRoot: root,
        merkleTreeCID: cid,
        intervalsPassed: 1,
        treasuryRPL: treasuryRPL.toString(),
        trustedNodeRPL: trustedNodeRPL,
        nodeRPL: nodeRPL,
        nodeETH: nodeETH,
        userETH: userETH.toString()
    }

    // Submit prices
    let rewardIndex1 = await safeStakeRewardsPool.getRewardIndex();
    await safeStakeRewardsPool.executeRewardSnapshot(submission, txOptions);
    let rewardIndex2 = await safeStakeRewardsPool.getRewardIndex();

    // Check index incremented
    assert(rewardIndex2.eq(rewardIndex1.add(web3.utils.toBN(1))), 'Incorrect updated network prices block');
}

