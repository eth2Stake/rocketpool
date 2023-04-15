import {
    RocketNodeDeposit,
    RocketNodeManager,
    RocketNodeStaking,
    RocketNodeStakingOld,
    RocketTokenRPL,
    RocketDAONodeTrustedActions,
    RocketDAONodeTrustedSettingsMembers,
    RocketStorage,
    RocketDAONodeTrusted,
    RocketMinipoolManager,
    RocketMinipoolDelegate,
    RocketMinipoolFactory, RocketNodeManagerOld,
} from '../_utils/artifacts';
import { setDaoNodeTrustedBootstrapMember } from '../dao/scenario-dao-node-trusted-bootstrap';
import { daoNodeTrustedMemberJoin } from '../dao/scenario-dao-node-trusted';
import { mintDummyRPL } from '../token/scenario-rpl-mint-fixed';
import { burnFixedRPL } from '../token/scenario-rpl-burn-fixed';
import { allowDummyRPL } from '../token/scenario-rpl-allow-fixed';
import { getDepositDataRoot, getValidatorPubkey, getValidatorSignature } from '../_utils/beacon';
import { getTxContractEvents } from '../_utils/contract';
import { upgradeExecuted } from '../_utils/upgrade';
import { assertBN } from './bn';


// Get a node's RPL stake
export async function getNodeRPLStake(nodeAddress) {
    const rocketNodeStaking = await RocketNodeStaking.deployed();
    let stake = await rocketNodeStaking.getNodeRPLStake.call(nodeAddress);
    return stake;
}


// Get a node's effective RPL stake
export async function getNodeEffectiveRPLStake(nodeAddress) {
    const rocketNodeStaking = await RocketNodeStaking.deployed();
    let effectiveStake = await rocketNodeStaking.getNodeEffectiveRPLStake.call(nodeAddress);
    return effectiveStake;
}


// Get a node's minipool RPL stake
export async function getNodeMinimumRPLStake(nodeAddress) {
    const rocketNodeStaking = await RocketNodeStaking.deployed();
    let minimumStake = await rocketNodeStaking.getNodeMinimumRPLStake.call(nodeAddress);
    return minimumStake;
}


// Register a node
export async function registerNode(txOptions) {
    const preUpdate = !(await upgradeExecuted());
    const rocketNodeManager = preUpdate ? await RocketNodeManagerOld.deployed() : await RocketNodeManager.deployed();
    await rocketNodeManager.registerNode('Australia/Brisbane', txOptions);
}


// Make a node a trusted dao member, only works in bootstrap mode (< 3 trusted dao members)
export async function setNodeTrusted(_account, _id, _url, owner) {
    // Mints fixed supply RPL, burns that for new RPL and gives it to the account
    

    // Create invites for them to become a member
    await setDaoNodeTrustedBootstrapMember(_id, _url, _account, {from: owner});
    // Now get them to join
    await daoNodeTrustedMemberJoin({from: _account});
    // Check registration was successful and details are correct
    const rocketDAONodeTrusted = await RocketDAONodeTrusted.deployed();
    const id = await rocketDAONodeTrusted.getMemberID(_account);
    assert(id === _id, "Member ID is wrong");
    const url = await rocketDAONodeTrusted.getMemberUrl(_account);
    assert(url === _url, "Member URL is wrong");
    const joinedTime = await rocketDAONodeTrusted.getMemberJoinedTime(_account);
    assert(!joinedTime.eq(0), "Member joined time is wrong");
    const valid = await rocketDAONodeTrusted.getMemberIsValid(_account);
    assert(valid, "Member valid flag is not set");
}


// Set a withdrawal address for a node
export async function setNodeWithdrawalAddress(nodeAddress, withdrawalAddress, txOptions) {
    const rocketStorage = await RocketStorage.deployed();
    await rocketStorage.setWithdrawalAddress(nodeAddress, withdrawalAddress, true, txOptions);
}


// Submit a node RPL stake
export async function nodeStakeRPL(amount, txOptions) {
    const preUpdate = !(await upgradeExecuted());

    const [rocketNodeStaking, rocketTokenRPL] = await Promise.all([
        preUpdate ? RocketNodeStakingOld.deployed() : RocketNodeStaking.deployed(),
        RocketTokenRPL.deployed(),
    ]);
    await rocketTokenRPL.approve(rocketNodeStaking.address, amount, txOptions);
    const before = await rocketNodeStaking.getNodeRPLStake(txOptions.from);
    await rocketNodeStaking.stakeRPL(amount, txOptions);
    const after = await rocketNodeStaking.getNodeRPLStake(txOptions.from);
    assertBN.equal(after.sub(before), amount, 'Staking balance did not increase by amount staked');
}


// Submit a node RPL stake on behalf of another node
export async function nodeStakeRPLFor(nodeAddress, amount, txOptions) {
    const preUpdate = !(await upgradeExecuted());

    const [rocketNodeStaking, rocketTokenRPL] = await Promise.all([
        preUpdate ? RocketNodeStakingOld.deployed() : RocketNodeStaking.deployed(),
        RocketTokenRPL.deployed(),
    ]);
    await rocketTokenRPL.approve(rocketNodeStaking.address, amount, txOptions);
    const before = await rocketNodeStaking.getNodeRPLStake(nodeAddress);
    await rocketNodeStaking.stakeRPLFor(nodeAddress, amount, txOptions);
    const after = await rocketNodeStaking.getNodeRPLStake(nodeAddress);
    assertBN.equal(after.sub(before), amount, 'Staking balance did not increase by amount staked');
}


// Sets allow state for staking on behalf
export async function setStakeRPLForAllowed(caller, state, txOptions) {
    const preUpdate = !(await upgradeExecuted());

    const [rocketNodeStaking] = await Promise.all([
        preUpdate ? RocketNodeStakingOld.deployed() : RocketNodeStaking.deployed(),
    ]);
    await rocketNodeStaking.setStakeRPLForAllowed(caller, state, txOptions);
}


// Withdraw a node RPL stake
export async function nodeWithdrawRPL(amount, txOptions) {
    const rocketNodeStaking= await RocketNodeStaking.deployed();
    await rocketNodeStaking.withdrawRPL(amount, txOptions);
}


// Make a node deposit
let minipoolSalt = 0;
export async function nodeDeposit(txOptions) {

    // Load contracts
    const [
        rocketMinipoolFactory,
        rocketNodeDeposit,
        rocketStorage,
    ] = await Promise.all([
        RocketMinipoolFactory.deployed(),
        RocketNodeDeposit.deployed(),
        RocketStorage.deployed()
    ]);

    const salt = minipoolSalt++;
    const minipoolAddress = (await rocketMinipoolFactory.getExpectedAddress(txOptions.from, salt)).substr(2);
    let withdrawalCredentials = '0x010000000000000000000000' + minipoolAddress;

    // Get validator deposit data
    let depositData = {
        pubkey: getValidatorPubkey(),
        withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
        amount: BigInt(1000000000), // 1 ETH in gwei
        signature: getValidatorSignature(),
    };

    let depositDataRoot = getDepositDataRoot(depositData);

    // Make node deposit
    await rocketNodeDeposit.deposit(txOptions.value, '0'.ether, depositData.pubkey, depositData.signature, depositDataRoot, salt, '0x' + minipoolAddress, txOptions);
}


// Get a node's deposit credit balance
export async function getNodeDepositCredit(nodeAddress) {
    const rocketNodeDeposit = await RocketNodeDeposit.deployed();
    let credit = await rocketNodeDeposit.getNodeDepositCredit(nodeAddress);
    return credit;
}

// Get a node's effective RPL stake
export async function getNodeAverageFee(nodeAddress) {
    const rocketNodeManager = await RocketNodeManager.deployed();
    let averageFee = await rocketNodeManager.getAverageNodeFee.call(nodeAddress);
    return averageFee;
}
