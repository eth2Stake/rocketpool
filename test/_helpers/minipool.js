import {
    SafeStakeMinipoolDelegate,
    SafeStakeMinipoolManager,
    SafeStakeMinipoolFactory,
    SafeStakeDAOProtocolSettingsMinipool,
    SafeStakeMinipoolStatus,
    SafeStakeNetworkPrices,
    SafeStakeNodeDeposit,
    SafeStakeDAOProtocolSettingsNode,
    SafeStakeStorage
} from '../_utils/artifacts';
import { getValidatorPubkey, getValidatorSignature, getDepositDataRoot } from '../_utils/beacon';


// Get the number of minipools a node has
export async function getNodeMinipoolCount(nodeAddress) {
    const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed();
    let count = await safeStakeMinipoolManager.getNodeMinipoolCount.call(nodeAddress);
    return count;
}

// Get the number of minipools a node has in Staking status
export async function getNodeStakingMinipoolCount(nodeAddress) {
  const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed();
  let count = await safeStakeMinipoolManager.getNodeStakingMinipoolCount.call(nodeAddress);
  return count;
}

// Get the number of minipools a node has in that are active
export async function getNodeActiveMinipoolCount(nodeAddress) {
    const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed();
    let count = await safeStakeMinipoolManager.getNodeActiveMinipoolCount.call(nodeAddress);
    return count;
}

// Get the minimum required RPL stake for a minipool
export async function getMinipoolMinimumRPLStake() {

    // Load contracts
    const [
        safeStakeDAOProtocolSettingsMinipool,
        safeStakeNetworkPrices,
        safeStakeDAOProtocolSettingsNode,
    ] = await Promise.all([
        SafeStakeDAOProtocolSettingsMinipool.deployed(),
        SafeStakeNetworkPrices.deployed(),
        SafeStakeDAOProtocolSettingsNode.deployed(),
    ]);

    // Load data
    let [depositUserAmount, minMinipoolStake, rplPrice] = await Promise.all([
        safeStakeDAOProtocolSettingsMinipool.getHalfDepositUserAmount(),
        safeStakeDAOProtocolSettingsNode.getMinimumPerMinipoolStake(),
        safeStakeNetworkPrices.getRPLPrice(),
    ]);

    // Calculate & return
    return depositUserAmount.mul(minMinipoolStake).div(rplPrice);

}

let minipoolSalt = 1

export async function getCredentials(txOptions){
    const [
        safeStakeMinipoolFactory,
        safeStakeNodeDeposit,
        safeStakeStorage,
    ] = await Promise.all([
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

    let salt = minipoolSalt++;

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
    return minipoolAddress;
}
// Create a minipool
export async function createMinipool(txOptions,depositData = null, salt = null) {

    // Load contracts
    const [
        safeStakeMinipoolFactory,
        safeStakeNodeDeposit,
        safeStakeStorage,
    ] = await Promise.all([
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

    if(salt === null){
        salt = minipoolSalt++;
    }

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
    if (depositData == null){
        depositData = {
            pubkey: getValidatorPubkey(),
            withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
            amount: BigInt(16000000000), // gwei
            signature: getValidatorSignature(),
        };
    }
    // if (depositType == 3){
    //     depositData.amount =  BigInt(8000000000);
    // }

    let depositDataRoot = getDepositDataRoot(depositData);

    // Make node deposit
    await safeStakeNodeDeposit.deposit(web3.utils.toWei('0', 'ether'), depositData.pubkey, depositData.signature, depositDataRoot, salt, '0x' + minipoolAddress, txOptions);
    return SafeStakeMinipoolDelegate.at('0x' + minipoolAddress);
}


// Refund node ETH from a minipool
export async function refundMinipoolNodeETH(minipool, txOptions) {
    await minipool.refund(txOptions);
}


// Progress a minipool to staking
export async function stakeMinipool(minipool, txOptions) {

    // Get contracts
    const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed()

    // Get minipool validator pubkey
    const validatorPubkey = await safeStakeMinipoolManager.getMinipoolPubkey(minipool.address);

    // Get minipool withdrawal credentials
    let withdrawalCredentials = await safeStakeMinipoolManager.getMinipoolWithdrawalCredentials.call(minipool.address);
    // Get validator deposit data
    let depositData = {
        pubkey: Buffer.from(validatorPubkey.substr(2), 'hex'),
        withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
        amount: BigInt(16000000000), // gwei
        signature: getValidatorSignature(),
    };
    let depositDataRoot = getDepositDataRoot(depositData);

    // Stake
    await minipool.stake(depositData.signature, depositDataRoot, txOptions);

}

// Progress a minipool to staking
export async function stake8Minipool(minipool, txOptions,depositData) {

    // Get contracts
    // const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed()

    // Get minipool validator pubkey
    // const validatorPubkey = await safeStakeMinipoolManager.getMinipoolPubkey(minipool.address);

    // Get minipool withdrawal credentials
    // let withdrawalCredentials = await safeStakeMinipoolManager.getMinipoolWithdrawalCredentials.call(minipool.address);
    // Get validator deposit data
    // let depositData = {
    //     pubkey: Buffer.from(validatorPubkey.substr(2), 'hex'),
    //     withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
    //     amount: BigInt(24000000000), // gwei
    //     signature: getValidatorSignature(),
    // };
    let depositDataRoot = getDepositDataRoot(depositData);

    // Stake
    await minipool.stake(depositData.signature, depositDataRoot, txOptions);

}


// Submit a minipool withdrawable event
export async function submitMinipoolWithdrawable(minipoolAddress, txOptions) {
    const safeStakeMinipoolStatus = await SafeStakeMinipoolStatus.deployed();
    await safeStakeMinipoolStatus.submitMinipoolWithdrawable(minipoolAddress, txOptions);
}


// Dissolve a minipool
export async function dissolveMinipool(minipool, txOptions) {
    await minipool.dissolve(txOptions);
}


// Close a dissolved minipool and destroy it
export async function closeMinipool(minipool, txOptions) {
    await minipool.close(txOptions);
}

