import {
    SafeStakeDAONodeTrusted,
    SafeStakeMerkleDistributorMainnet,
    SafeStakeNetworkPrices, SafeStakeNodeManager, SafeStakeNodeStaking,
    SafeStakeRewardsPool,
    SafeStakeStorage, SafeStakeTokenRPL
} from '../_utils/artifacts';
import { parseRewardsMap } from '../_utils/merkle-tree';


// Submit network prices
export async function claimAndStakeRewards(nodeAddress, indices, rewards, stakeAmount, txOptions) {

    // Load contracts
    const [
        safeStakeRewardsPool,
        safeStakeNodeManager,
        safeStakeNodeStaking,
        safeStakeMerkleDistributorMainnet,
        safeStakeStorage,
        safeStakeTokenRPL,
    ] = await Promise.all([
        SafeStakeRewardsPool.deployed(),
        SafeStakeNodeManager.deployed(),
        SafeStakeNodeStaking.deployed(),
        SafeStakeMerkleDistributorMainnet.deployed(),
        SafeStakeStorage.deployed(),
        SafeStakeTokenRPL.deployed(),
    ]);

    // Get node withdrawal address
    let nodeWithdrawalAddress = await safeStakeNodeManager.getNodeWithdrawalAddress.call(nodeAddress);

    // Get balances
    function getBalances() {
        return Promise.all([
            safeStakeRewardsPool.getClaimIntervalTimeStart(),
            safeStakeTokenRPL.balanceOf.call(nodeWithdrawalAddress),
            safeStakeNodeStaking.getNodeRPLStake(nodeAddress),
            web3.eth.getBalance(nodeWithdrawalAddress)
        ]).then(
          ([claimIntervalTimeStart, nodeRpl, rplStake, nodeEth]) =>
            ({claimIntervalTimeStart, nodeRpl, rplStake, nodeEth: web3.utils.toBN(nodeEth)})
        );
    }

    let [balances1] = await Promise.all([
        getBalances(),
    ]);

    // Construct claim arguments
    let claimer = nodeAddress;
    let claimerIndices = [];
    let amountsRPL = [];
    let amountsETH = [];
    let proofs = [];
    let totalAmountRPL = web3.utils.toBN(0);
    let totalAmountETH = web3.utils.toBN(0);

    for (let i = 0; i < indices.length; i++) {
        let treeData = parseRewardsMap(rewards[i]);

        let proof = treeData.proof.claims[web3.utils.toChecksumAddress(claimer)];

        if (!proof) {
            throw new Error('No proof in merkle tree for ' + claimer)
        }

        claimerIndices.push(proof.index);
        amountsRPL.push(proof.amountRPL);
        amountsETH.push(proof.amountETH);
        proofs.push(proof.proof);

        totalAmountRPL = totalAmountRPL.add(web3.utils.toBN(proof.amountRPL));
    }

    const tx = await safeStakeMerkleDistributorMainnet.claimAndStake(nodeAddress, indices, amountsRPL, amountsETH, proofs, stakeAmount, txOptions);
    let gasUsed = web3.utils.toBN('0');

    if(nodeWithdrawalAddress.toLowerCase() === txOptions.from.toLowerCase()) {
        gasUsed = web3.utils.toBN(tx.receipt.gasUsed).mul(web3.utils.toBN(tx.receipt.effectiveGasPrice));
    }

    let [balances2] = await Promise.all([
        getBalances(),
    ]);

    let amountStaked = balances2.rplStake.sub(balances1.rplStake);

    assert(balances2.nodeRpl.sub(balances1.nodeRpl).eq(totalAmountRPL.sub(amountStaked)), 'Incorrect updated node RPL balance');
    assert(balances2.nodeEth.sub(balances1.nodeEth).add(gasUsed).eq(totalAmountETH), 'Incorrect updated node ETH balance');
}

