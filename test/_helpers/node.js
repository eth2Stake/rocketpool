import {
    SafeStakeNodeDeposit,
    SafeStakeNodeManager,
    SafeStakeNodeStaking,
    SafeStakeTokenRPL,
    SafeStakeDAONodeTrustedActions,
    SafeStakeDAONodeTrustedSettingsMembers,
    SafeStakeStorage,
    SafeStakeDAONodeTrusted,
    SafeStakeMinipoolManager,
    SafeStakeMinipoolDelegate,
    SafeStakeMinipoolFactory
} from '../_utils/artifacts';
import { setDaoNodeTrustedBootstrapMember } from '../dao/scenario-dao-node-trusted-bootstrap';
import { daoNodeTrustedMemberJoin } from '../dao/scenario-dao-node-trusted';
import { mintDummyRPL } from '../token/scenario-rpl-mint-fixed';
import { burnFixedRPL } from '../token/scenario-rpl-burn-fixed';
import { allowDummyRPL } from '../token/scenario-rpl-allow-fixed';
import { getDepositDataRoot, getValidatorPubkey, getValidatorSignature } from '../_utils/beacon';
import { getTxContractEvents } from '../_utils/contract';


// Get a node's RPL stake
export async function getNodeRPLStake(nodeAddress) {
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    let stake = await safeStakeNodeStaking.getNodeRPLStake.call(nodeAddress);
    return stake;
}


// Get a node's effective RPL stake
export async function getNodeEffectiveRPLStake(nodeAddress) {
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    let effectiveStake = await safeStakeNodeStaking.getNodeEffectiveRPLStake.call(nodeAddress);
    return effectiveStake;
}


// Get a node's minipool RPL stake
export async function getNodeMinimumRPLStake(nodeAddress) {
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    let minimumStake = await safeStakeNodeStaking.getNodeMinimumRPLStake.call(nodeAddress);
    return minimumStake;
}


// Get total effective RPL stake
export async function getTotalEffectiveRPLStake() {
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    let totalStake = await safeStakeNodeStaking.getTotalEffectiveRPLStake.call();
    return totalStake;
}


// Get calculated effective RPL stake
export async function getCalculatedTotalEffectiveRPLStake(price) {
    const safeStakeNodeStaking = await SafeStakeNodeStaking.deployed();
    let totalStake = await safeStakeNodeStaking.calculateTotalEffectiveRPLStake.call(0, 0, price);
    return totalStake;
}


// Register a node
export async function registerNode(txOptions) {
    const safeStakeNodeManager = await SafeStakeNodeManager.deployed();
    await safeStakeNodeManager.registerNode('Australia/Brisbane', txOptions);
}


// Make a node a trusted dao member, only works in bootstrap mode (< 3 trusted dao members)
export async function setNodeTrusted(_account, _id, _url, owner) {
    // Mints fixed supply RPL, burns that for new RPL and gives it to the account
    let rplMint = async function(_account, _amount) {
        // Load contracts
        const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
        // Convert
        _amount = web3.utils.toWei(_amount.toString(), 'ether');
        // Mint RPL fixed supply for the users to simulate current users having RPL
        await mintDummyRPL(_account, _amount, { from: owner });
        // Mint a large amount of dummy RPL to owner, who then burns it for real RPL which is sent to nodes for testing below
        await allowDummyRPL(safeStakeTokenRPL.address, _amount, { from: _account });
        // Burn existing fixed supply RPL for new RPL
        await burnFixedRPL(_amount, { from: _account }); 
    }
    
    // Allow the given account to spend this users RPL
    let rplAllowanceDAO = async function(_account, _amount) {
        // Load contracts
        const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
        const safeStakeDAONodeTrustedActions = await SafeStakeDAONodeTrustedActions.deployed()
        // Convert
        _amount = web3.utils.toWei(_amount.toString(), 'ether');
        // Approve now
        await safeStakeTokenRPL.approve(safeStakeDAONodeTrustedActions.address, _amount, { from: _account });
    }

    // Get the DAO settings
    let daoNodesettings = await SafeStakeDAONodeTrustedSettingsMembers.deployed();
    // How much RPL is required for a trusted node bond?
    let rplBondAmount = web3.utils.fromWei(await daoNodesettings.getRPLBond());
    // Mint RPL bond required for them to join
    await rplMint(_account, rplBondAmount);
    // Set allowance for the Vault to grab the bond
    await rplAllowanceDAO(_account, rplBondAmount);
    // Create invites for them to become a member
    await setDaoNodeTrustedBootstrapMember(_id, _url, _account, {from: owner});
    // Now get them to join
    await daoNodeTrustedMemberJoin({from: _account});
    // Check registration was successful and details are correct
    const safeStakeDAONodeTrusted = await SafeStakeDAONodeTrusted.deployed();
    const id = await safeStakeDAONodeTrusted.getMemberID(_account);
    assert(id === _id, "Member ID is wrong");
    const url = await safeStakeDAONodeTrusted.getMemberUrl(_account);
    assert(url === _url, "Member URL is wrong");
    const joinedTime = await safeStakeDAONodeTrusted.getMemberJoinedTime(_account);
    assert(!joinedTime.eq(0), "Member joined time is wrong");
    const valid = await safeStakeDAONodeTrusted.getMemberIsValid(_account);
    assert(valid, "Member valid flag is not set");
}


// Set a withdrawal address for a node
export async function setNodeWithdrawalAddress(nodeAddress, withdrawalAddress, txOptions) {
    const safeStakeStorage = await SafeStakeStorage.deployed();
    await safeStakeStorage.setWithdrawalAddress(nodeAddress, withdrawalAddress, true, txOptions);
}


// Submit a node RPL stake
export async function nodeStakeRPL(amount, txOptions) {
    const [safeStakeNodeStaking, safeStakeTokenRPL] = await Promise.all([
        SafeStakeNodeStaking.deployed(),
        SafeStakeTokenRPL.deployed(),
    ]);
    await safeStakeTokenRPL.approve(safeStakeNodeStaking.address, amount, txOptions);
    const before = await safeStakeNodeStaking.getNodeRPLStake(txOptions.from)
    await safeStakeNodeStaking.stakeRPL(amount, txOptions);
    const after = await safeStakeNodeStaking.getNodeRPLStake(txOptions.from)
    assert(after.sub(before).eq(web3.utils.toBN(amount)), 'Staking balance did not increase by amount staked')
}


// Withdraw a node RPL stake
export async function nodeWithdrawRPL(amount, txOptions) {
    const safeStakeNodeStaking= await SafeStakeNodeStaking.deployed();
    await safeStakeNodeStaking.withdrawRPL(amount, txOptions);
}


// Make a node deposit
let minipoolSalt = 0;
export async function nodeDeposit(txOptions) {

    // Load contracts
    const [
        safeStakeMinipoolManager,
          safeStakeMinipoolFactory,
        safeStakeNodeDeposit,
        safeStakeStorage,
    ] = await Promise.all([
        SafeStakeMinipoolManager.deployed(),
        SafeStakeMinipoolFactory.deployed(),
        SafeStakeNodeDeposit.deployed(),
        SafeStakeStorage.deployed()
    ]);

    // Get artifact and bytecode
    const SafeStakeMinipool = artifacts.require('SafeStakeMinipool');
    const contractBytecode = SafeStakeMinipool.bytecode;

    // Get deposit type from tx amount
    const depositType = await safeStakeNodeDeposit.getDepositType(txOptions.value);

    // Construct creation code for minipool deploy
    const constructorArgs = web3.eth.abi.encodeParameters(['address', 'address', 'uint8'], [safeStakeStorage.address, txOptions.from, depositType]);
    const deployCode = contractBytecode + constructorArgs.substr(2);
    const salt = minipoolSalt++;

    // Calculate keccak(nodeAddress, salt)
    const nodeSalt = web3.utils.soliditySha3(
      {type: 'address', value: txOptions.from},
      {type: 'uint256', value: salt}
    )

    // Calculate hash of deploy code
    const bytecodeHash = web3.utils.soliditySha3(
      {type: 'bytes', value: deployCode}
    )

    // Construct deterministic minipool address
    const raw = web3.utils.soliditySha3(
      {type: 'bytes1', value: '0xff'},
      {type: 'address', value: safeStakeMinipoolFactory.address},
      {type: 'bytes32', value: nodeSalt},
      {type: 'bytes32', value: bytecodeHash}
    )

    const minipoolAddress = raw.substr(raw.length - 40);
    let withdrawalCredentials = '0x010000000000000000000000' + minipoolAddress;

    // Get validator deposit data
    let depositData = {
        pubkey: getValidatorPubkey(),
        withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
        amount: BigInt(16000000000), // gwei
        signature: getValidatorSignature(),
    };

    let depositDataRoot = getDepositDataRoot(depositData);

    // Make node deposit
    await safeStakeNodeDeposit.deposit(web3.utils.toWei('0', 'ether'), depositData.pubkey, depositData.signature, depositDataRoot, salt, '0x' + minipoolAddress, txOptions);
}
