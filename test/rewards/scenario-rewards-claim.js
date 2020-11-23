import { mineBlocks } from '../_utils/evm';
import { RocketTokenRPL, RocketDAOSettings, RocketRewardsPool, RocketRewardsClaimNode, RocketStorage } from '../_utils/artifacts';


// Get the current rewards claim period in blocks
export async function rewardsClaimIntervalBlocksGet(txOptions) {
    // Load contracts
    const rocketDAOSettings = await RocketDAOSettings.deployed();
    return await rocketDAOSettings.getClaimIntervalBlocks.call();
};


// Get the current rewards claimers total
export async function rewardsClaimersPercTotalGet(txOptions) {
    // Load contracts
    const rocketDAOSettings = await RocketDAOSettings.deployed();
    return await rocketDAOSettings.getRewardsClaimersPercTotal.call();
};


// Get how many blocks needed until the next claim interval
export async function rewardsClaimIntervalsPassedGet(txOptions) {
    // Load contracts
    const rocketRewardsPool = await RocketRewardsPool.deployed();
    return await rocketRewardsPool.getClaimIntervalsPassed.call();
};

// Set the current rewards claim period in blocks
export async function rewardsClaimIntervalBlocksSet(intervalBlocks, txOptions) {
    // Load contracts
    const rocketDAOSettings = await RocketDAOSettings.deployed();
    // Get data about the tx
    function getTxData() {
        return Promise.all([
            rocketDAOSettings.getRewardsClaimIntervalBlocks(),
        ]).then(
            ([claimIntervalBlocks]) =>
            ({claimIntervalBlocks})
        );
    }
    // Capture data
    let dataSet1 = await getTxData();
    // Perform tx
    await rocketDAOSettings.setRewardsClaimIntervalBlocks(intervalBlocks, txOptions);
    // Capture data
    let dataSet2 = await getTxData();
    // Verify
    assert(dataSet2.claimIntervalBlocks.eq(web3.utils.toBN(intervalBlocks)), 'Claim interval blocks not set correctly')
};


// Set a contract that can claim rewards
export async function rewardsClaimerPercSet(contractName, perc, txOptions, expectedTotalPerc = null) {
    // Load contracts
    const rocketDAOSettings = await RocketDAOSettings.deployed();
    // Get data about the tx
    function getTxData() {
        return Promise.all([
            rocketDAOSettings.getRewardsClaimerPerc(contractName),
            rocketDAOSettings.getRewardsClaimersPercTotal(),
        ]).then(
            ([rewardsClaimerPerc, rewardsClaimersPercTotal]) =>
            ({rewardsClaimerPerc, rewardsClaimersPercTotal})
        );
    }
    // Capture data
    let dataSet1 = await getTxData();
    //console.log(dataSet1.rewardsClaimerPerc.toString(), dataSet1.rewardsClaimersPercTotal.toString());
    // Perform tx
    await rocketDAOSettings.setRewardsClaimerPerc(contractName, perc, txOptions);
    // Capture data
    let dataSet2 = await getTxData();
    //console.log(dataSet2.rewardsClaimerPerc.toString(), dataSet2.rewardsClaimersPercTotal.toString());
    // Verify
    assert(dataSet2.rewardsClaimerPerc.eq(web3.utils.toBN(perc)), 'Claim percentage not updated correctly');

    // Verify an expected total Perc if given
    if(expectedTotalPerc) {
        let targetTotalPerc = expectedTotalPerc
        assert(dataSet2.rewardsClaimersPercTotal.eq(web3.utils.toBN(web3.utils.toWei(expectedTotalPerc.toString()))), 'Total claim percentage not matching given target');
    } 
};

