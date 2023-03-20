import { SafeStakeDAONodeTrusted, SafeStakeMinipoolDelegate, SafeStakeMinipoolStatus, SafeStakeNodeStaking, SafeStakeStorage } from '../_utils/artifacts';


// Submit a minipool withdrawable event
export async function submitWithdrawable(minipoolAddress, txOptions) {

    // Load contracts
    const [
        safeStakeDAONodeTrusted,
        safeStakeMinipoolStatus,
        safeStakeNodeStaking,
        safeStakeStorage,
    ] = await Promise.all([
        SafeStakeDAONodeTrusted.deployed(),
        SafeStakeMinipoolStatus.deployed(),
        SafeStakeNodeStaking.deployed(),
        SafeStakeStorage.deployed(),
    ]);

    // Get parameters
    let trustedNodeCount = await safeStakeDAONodeTrusted.getMemberCount.call();

    // Get submission keys
    let nodeSubmissionKey = web3.utils.soliditySha3('minipool.withdrawable.submitted.node', txOptions.from, minipoolAddress);
    let submissionCountKey = web3.utils.soliditySha3('minipool.withdrawable.submitted.count', minipoolAddress);

    // Get submission details
    function getSubmissionDetails() {
        return Promise.all([
            safeStakeStorage.getBool.call(nodeSubmissionKey),
            safeStakeStorage.getUint.call(submissionCountKey),
        ]).then(
            ([nodeSubmitted, count]) =>
            ({nodeSubmitted, count})
        );
    }

    // Get minipool details
    function getMinipoolDetails() {
        return SafeStakeMinipoolDelegate.at(minipoolAddress).then(minipool => Promise.all([
            minipool.getStatus.call(),
            minipool.getUserDepositBalance.call(),
        ])).then(
            ([status, userDepositBalance]) =>
            ({status, userDepositBalance})
        );
    }

    // Get node details
    function getNodeDetails() {
        return SafeStakeMinipoolDelegate.at(minipoolAddress)
            .then(minipool => minipool.getNodeAddress.call())
            .then(nodeAddress => safeStakeNodeStaking.getNodeRPLStake.call(nodeAddress))
            .then(rplStake => ({rplStake}));
    }

    // Get initial details
    let [submission1, nodeDetails1] = await Promise.all([
        getSubmissionDetails(),
        getNodeDetails().catch(e => ({})),
    ]);

    // Submit
    await safeStakeMinipoolStatus.submitMinipoolWithdrawable(minipoolAddress, txOptions);

    // Get updated details
    let [submission2, nodeDetails2, minipoolDetails] = await Promise.all([
        getSubmissionDetails(),
        getNodeDetails(),
        getMinipoolDetails(),
    ]);

    // Check if minipool should be withdrawable
    let expectWithdrawable = submission2.count.mul(web3.utils.toBN(2)).gt(trustedNodeCount);

    // Check submission details
    assert.isFalse(submission1.nodeSubmitted, 'Incorrect initial node submitted status');
    assert.isTrue(submission2.nodeSubmitted, 'Incorrect updated node submitted status');
    assert(submission2.count.eq(submission1.count.add(web3.utils.toBN(1))), 'Incorrect updated submission count');

    // Check minipool details
    const withdrawable = web3.utils.toBN(3);
    if (expectWithdrawable) {
        assert(minipoolDetails.status.eq(withdrawable), 'Incorrect updated minipool status');
    } else {
        assert(!minipoolDetails.status.eq(withdrawable), 'Incorrect updated minipool status');
    }

}

// Execute a minipool withdrawable update event
export async function executeSetWithdrawable(minipoolAddress, txOptions) {

    // Load contracts
    const [
        safeStakeMinipoolStatus,
        safeStakeNodeStaking,
    ] = await Promise.all([
        SafeStakeMinipoolStatus.deployed(),
        SafeStakeNodeStaking.deployed(),
    ]);

    // Get minipool details
    function getMinipoolDetails() {
        return SafeStakeMinipoolDelegate.at(minipoolAddress).then(minipool => Promise.all([
            minipool.getStatus.call(),
            minipool.getUserDepositBalance.call(),
        ])).then(
          ([status, userDepositBalance]) =>
            ({status, userDepositBalance})
        );
    }

    // Get node details
    function getNodeDetails() {
        return SafeStakeMinipoolDelegate.at(minipoolAddress)
          .then(minipool => minipool.getNodeAddress.call())
          .then(nodeAddress => safeStakeNodeStaking.getNodeRPLStake.call(nodeAddress))
          .then(rplStake => ({rplStake}));
    }

    // Get initial details
    let nodeDetails1 = await getNodeDetails().catch(e => ({}))

    // Submit
    await safeStakeMinipoolStatus.executeMinipoolWithdrawable(minipoolAddress, txOptions);

    // Get updated details
    let [nodeDetails2, minipoolDetails] = await Promise.all([
        getNodeDetails(),
        getMinipoolDetails(),
    ]);

    // Check minipool details
    const withdrawable = web3.utils.toBN(3);
    assert(minipoolDetails.status.eq(withdrawable), 'Incorrect updated minipool status');

}
