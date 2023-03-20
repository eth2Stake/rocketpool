import {
    SafeStakeDAONodeTrusted, SafeStakeDAOProtocolSettingsNetwork,
    SafeStakeMinipoolPenalty,
    SafeStakeNetworkPenalties,
    SafeStakeStorage
} from '../_utils/artifacts';
import { shouldRevert } from '../_utils/testing';


// Submit network balances
export async function submitPenalty(minipoolAddress, block, txOptions) {

    // Load contracts
    const [
        safeStakeDAONodeTrusted,
        safeStakeNetworkPenalties,
        safeStakeMinipoolPenalty,
        safeStakeStorage,
        safeStakeDAOProtocolSettingsNetwork
    ] = await Promise.all([
        SafeStakeDAONodeTrusted.deployed(),
        SafeStakeNetworkPenalties.deployed(),
        SafeStakeMinipoolPenalty.deployed(),
        SafeStakeStorage.deployed(),
        SafeStakeDAOProtocolSettingsNetwork.deployed()
    ]);

    // Get parameters
    let trustedNodeCount = await safeStakeDAONodeTrusted.getMemberCount.call();

    // Get submission keys
    let penaltyKey = web3.utils.soliditySha3('network.penalties.penalty', minipoolAddress)
    let nodeSubmissionKey = web3.utils.soliditySha3('network.penalties.submitted.node', txOptions.from, minipoolAddress, block);
    let submissionCountKey = web3.utils.soliditySha3('network.penalties.submitted.count', minipoolAddress, block);
    let executionKey = web3.utils.soliditySha3('network.penalties.executed', minipoolAddress, block);

    let maxPenaltyRate = await safeStakeMinipoolPenalty.getMaxPenaltyRate.call();
    let penaltyThreshold = await safeStakeDAOProtocolSettingsNetwork.getNodePenaltyThreshold.call();

    // Get submission details
    function getSubmissionDetails() {
        return Promise.all([
            safeStakeStorage.getBool.call(nodeSubmissionKey),
            safeStakeStorage.getUint.call(submissionCountKey),
            safeStakeStorage.getBool.call(executionKey),
        ]).then(
            ([nodeSubmitted, count, executed]) =>
            ({nodeSubmitted, count, executed})
        );
    }

    function getPenalty() {
        return Promise.all([
            safeStakeMinipoolPenalty.getPenaltyRate.call(minipoolAddress),
            safeStakeStorage.getUint.call(penaltyKey)
        ]).then(
          ([penaltyRate, penaltyCount]) =>
          ({penaltyRate, penaltyCount})
        )
    }

    // Get initial submission details
    let [ submission1, penalty1 ] = await Promise.all([
      getSubmissionDetails(),
      getPenalty()
    ]);

    // Submit balances
    if (submission1.executed) {
        await shouldRevert(safeStakeNetworkPenalties.submitPenalty(minipoolAddress, block, txOptions), "Did not revert on already executed penalty", "Penalty already applied for this block");
    } else {
        await safeStakeNetworkPenalties.submitPenalty(minipoolAddress, block, txOptions);
    }

    // Get updated submission details & balances
    let [ submission2, penalty2 ] = await Promise.all([
        getSubmissionDetails(),
        getPenalty()
    ]);

    // Check if balances should be updated
    let expectedUpdatedPenalty = web3.utils.toBN(web3.utils.toWei('1', 'ether')).mul(submission2.count).div(trustedNodeCount).gte(penaltyThreshold);

    // Check submission details
    assert.isFalse(submission1.nodeSubmitted, 'Incorrect initial node submitted status');

    if (!submission1.executed) {
        assert.isTrue(submission2.nodeSubmitted, 'Incorrect updated node submitted status');
        assert(submission2.count.eq(submission1.count.add(web3.utils.toBN(1))), 'Incorrect updated submission count');
    }

    // Check penalty
    if (!submission1.executed && expectedUpdatedPenalty) {
        assert.isTrue(submission2.executed, 'Penalty not executed');
        assert.strictEqual(penalty2.penaltyCount.toString(), penalty1.penaltyCount.add(web3.utils.toBN(1)).toString(), 'Penalty count not updated')

        // Unless we hit max penalty, expect to see an increase in the penalty rate
        if (penalty1.penaltyRate.lt(maxPenaltyRate) && penalty2.penaltyCount.gte(web3.utils.toBN('3'))){
            assert.isTrue(penalty2.penaltyRate.gt(penalty1.penaltyRate), 'Penalty rate did not increase')
        }
    } else if(!expectedUpdatedPenalty) {
        assert.isFalse(submission2.executed, 'Penalty executed');
    }
}

