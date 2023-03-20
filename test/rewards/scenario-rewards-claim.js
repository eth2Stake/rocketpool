import { SafeStakeDAOProtocolSettingsRewards, SafeStakeRewardsPool } from '../_utils/artifacts';


// Get the current rewards claim period in blocks
export async function rewardsClaimIntervalTimeGet(txOptions) {
  // Load contracts
  const safeStakeDAOProtocolSettingsRewards = await SafeStakeDAOProtocolSettingsRewards.deployed();
  return await safeStakeDAOProtocolSettingsRewards.getClaimIntervalTime.call();
};


// Get the current rewards claimers total
export async function rewardsClaimersPercTotalGet(txOptions) {
  // Load contracts
  const safeStakeDAOProtocolSettingsRewards = await SafeStakeDAOProtocolSettingsRewards.deployed();
  return await safeStakeDAOProtocolSettingsRewards.getRewardsClaimersPercTotal.call();
};


// Get how many seconds needed until the next claim interval
export async function rewardsClaimIntervalsPassedGet(txOptions) {
  // Load contracts
  const safeStakeRewardsPool = await SafeStakeRewardsPool.deployed();
  return await safeStakeRewardsPool.getClaimIntervalsPassed.call();
};





