import {
    SafeStakeMinipoolDelegate, SafeStakeMinipoolFactory,
    SafeStakeMinipoolManager,
    SafeStakeMinipoolManagerOld,
    SafeStakeNodeDeposit,
    SafeStakeStorage,
} from '../_utils/artifacts';
import { getTxContractEvents } from '../_utils/contract';
import { getDepositDataRoot, getValidatorPubkey, getValidatorSignature } from '../_utils/beacon';

let minipoolSalt = 0;

// Make a node deposit
export async function deposit(minimumNodeFee, txOptions, preUpdate = false) {

    // Load contracts
    const [
        safeStakeMinipoolManager,
        safeStakeMinipoolFactory,
        safeStakeNodeDeposit,
        safeStakeStorage,
        safeStake
    ] = await Promise.all([
        SafeStakeMinipoolManager.deployed(),
        preUpdate ? SafeStakeMinipoolManagerOld.deployed() : SafeStakeMinipoolFactory.deployed(),
        SafeStakeNodeDeposit.deployed(),
        SafeStakeStorage.deployed()
    ]);

    // Get minipool counts
    function getMinipoolCounts(nodeAddress) {
        return Promise.all([
            safeStakeMinipoolManager.getMinipoolCount.call(),
            safeStakeMinipoolManager.getNodeMinipoolCount.call(nodeAddress),
        ]).then(
            ([network, node]) =>
            ({network, node})
        );
    }

    // Get minipool details
    function getMinipoolDetails(minipoolAddress) {
        return SafeStakeMinipoolDelegate.at(minipoolAddress).then(minipool => Promise.all([
            safeStakeMinipoolManager.getMinipoolExists.call(minipoolAddress),
            minipool.getNodeAddress.call(),
            minipool.getNodeDepositBalance.call(),
            minipool.getNodeDepositAssigned.call(),
        ])).then(
            ([exists, nodeAddress, nodeDepositBalance, nodeDepositAssigned]) =>
            ({exists, nodeAddress, nodeDepositBalance, nodeDepositAssigned})
        );
    }

    // Get initial minipool indexes
    let minipoolCounts1 = await getMinipoolCounts(txOptions.from);

    // Deposit

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

    const minipoolAddress = '0x' + raw.substr(raw.length - 40);
    let withdrawalCredentials = '0x010000000000000000000000' + minipoolAddress.substr(2);

    // Get validator deposit data
    let depositData = {
        pubkey: getValidatorPubkey(),
        withdrawalCredentials: Buffer.from(withdrawalCredentials.substr(2), 'hex'),
        amount: BigInt(16000000000), // gwei
        signature: getValidatorSignature(),
    };

    let depositDataRoot = getDepositDataRoot(depositData);

    // Make node deposit
    await safeStakeNodeDeposit.deposit(minimumNodeFee, depositData.pubkey, depositData.signature, depositDataRoot, salt, minipoolAddress, txOptions);

    // Get updated minipool indexes & created minipool details
    let minipoolCounts2 = await getMinipoolCounts(txOptions.from);
    let [
        lastMinipoolAddress,
        lastNodeMinipoolAddress,
        minipoolDetails,
    ] = await Promise.all([
        safeStakeMinipoolManager.getMinipoolAt.call(minipoolCounts2.network.sub(web3.utils.toBN(1))),
        safeStakeMinipoolManager.getNodeMinipoolAt.call(txOptions.from, minipoolCounts2.node.sub(web3.utils.toBN(1))),
        getMinipoolDetails(minipoolAddress),
    ]);

    // Check minipool indexes
    assert(minipoolCounts2.network.eq(minipoolCounts1.network.add(web3.utils.toBN(1))), 'Incorrect updated network minipool count');
    assert.equal(lastMinipoolAddress.toLowerCase(), minipoolAddress.toLowerCase(), 'Incorrect updated network minipool index');
    assert(minipoolCounts2.node.eq(minipoolCounts1.node.add(web3.utils.toBN(1))), 'Incorrect updated node minipool count');
    assert.equal(lastNodeMinipoolAddress.toLowerCase(), minipoolAddress.toLowerCase(), 'Incorrect updated node minipool index');

    // Check minipool details
    assert.isTrue(minipoolDetails.exists, 'Incorrect created minipool exists status');
    assert.equal(minipoolDetails.nodeAddress, txOptions.from, 'Incorrect created minipool node address');
    assert(minipoolDetails.nodeDepositBalance.eq(txOptions.value), 'Incorrect created minipool node deposit balance');
    assert.isTrue(minipoolDetails.nodeDepositAssigned, 'Incorrect created minipool node deposit assigned status');

}

