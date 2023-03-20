import { SafeStakeNetworkBalances, SafeStakeNetworkFees, SafeStakeNetworkPrices, SafeStakeNetworkWithdrawal } from '../_utils/artifacts';


// Get the network total ETH balance
export async function getTotalETHBalance() {
    const safeStakeNetworkBalances = await SafeStakeNetworkBalances.deployed();
    let balance = await safeStakeNetworkBalances.getTotalETHBalance.call();
    return balance;
}


// Get the network staking ETH balance
export async function getStakingETHBalance() {
    const safeStakeNetworkBalances = await SafeStakeNetworkBalances.deployed();
    let balance = await safeStakeNetworkBalances.getStakingETHBalance.call();
    return balance;
}


// Get the network ETH utilization rate
export async function getETHUtilizationRate() {
    const safeStakeNetworkBalances = await SafeStakeNetworkBalances.deployed();
    let utilizationRate = await safeStakeNetworkBalances.getETHUtilizationRate.call();
    return utilizationRate;
}


// Submit network balances
export async function submitBalances(block, totalEth, stakingEth, rethSupply, txOptions) {
    const safeStakeNetworkBalances = await SafeStakeNetworkBalances.deployed();
    await safeStakeNetworkBalances.submitBalances(block, totalEth, stakingEth, rethSupply, txOptions);
}


// Submit network token prices
export async function submitPrices(block, rplPrice, effectiveRplStake, txOptions) {
    const safeStakeNetworkPrices = await SafeStakeNetworkPrices.deployed();
    await safeStakeNetworkPrices.submitPrices(block, rplPrice, effectiveRplStake, txOptions);
}


// Get network RPL price
export async function getRPLPrice() {
    const safeStakeNetworkPrices = await SafeStakeNetworkPrices.deployed();
    let price = await safeStakeNetworkPrices.getRPLPrice.call();
    return price;
}


// Get the network node demand
export async function getNodeDemand() {
    const safeStakeNetworkFees = await SafeStakeNetworkFees.deployed();
    let nodeDemand = await safeStakeNetworkFees.getNodeDemand.call();
    return nodeDemand;
}


// Get the current network node fee
export async function getNodeFee() {
    const safeStakeNetworkFees = await SafeStakeNetworkFees.deployed();
    let nodeFee = await safeStakeNetworkFees.getNodeFee.call();
    return nodeFee;
}


// Get the network node fee for a node demand value
export async function getNodeFeeByDemand(nodeDemand) {
    const safeStakeNetworkFees = await SafeStakeNetworkFees.deployed();
    let nodeFee = await safeStakeNetworkFees.getNodeFeeByDemand.call(nodeDemand);
    return nodeFee;
}



