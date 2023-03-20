import { SafeStakeDepositPool, SafeStakeDAOProtocolSettingsDeposit, SafeStakeMinipoolQueue, SafeStakeDAOProtocolSettingsMinipool, SafeStakeVault } from '../_utils/artifacts';


// Assign deposits to minipools
export async function assignDeposits(txOptions) {

    // Load contracts
    const [
        safeStakeDepositPool,
        safeStakeDAOProtocolSettingsDeposit,
        safeStakeMinipoolQueue,
        safeStakeDAOProtocolSettingsMinipool,
        safeStakeVault,
    ] = await Promise.all([
        SafeStakeDepositPool.deployed(),
        SafeStakeDAOProtocolSettingsDeposit.deployed(),
        SafeStakeMinipoolQueue.deployed(),
        SafeStakeDAOProtocolSettingsMinipool.deployed(),
        SafeStakeVault.deployed(),
    ]);

    // Get parameters
    let [
        depositPoolBalance,
        maxDepositAssignments,
        fullMinipoolQueueLength, halfMinipoolQueueLength, emptyMinipoolQueueLength,
        fullDepositUserAmount, halfDepositUserAmount, emptyDepositUserAmount,
    ] = await Promise.all([
        safeStakeDepositPool.getBalance.call(),
        safeStakeDAOProtocolSettingsDeposit.getMaximumDepositAssignments.call(),
        safeStakeMinipoolQueue.getLength.call(1), safeStakeMinipoolQueue.getLength.call(2), safeStakeMinipoolQueue.getLength.call(3),
        safeStakeDAOProtocolSettingsMinipool.getDepositUserAmount(1), safeStakeDAOProtocolSettingsMinipool.getDepositUserAmount(2), safeStakeDAOProtocolSettingsMinipool.getDepositUserAmount(3),
    ]);

    // Get queued minipool capacities
    let minipoolCapacities = [];
    for (let i = 0; i < halfMinipoolQueueLength; ++i)  minipoolCapacities.push(halfDepositUserAmount);
    for (let i = 0; i < fullMinipoolQueueLength; ++i)  minipoolCapacities.push(fullDepositUserAmount);
    for (let i = 0; i < emptyMinipoolQueueLength; ++i) minipoolCapacities.push(emptyDepositUserAmount);

    // Get expected deposit assignment parameters
    let expectedDepositAssignments = 0;
    let expectedEthAssigned = web3.utils.toBN(0);
    let depositBalanceRemaining = depositPoolBalance;
    let depositAssignmentsRemaining = maxDepositAssignments;
    while (minipoolCapacities.length > 0 && depositBalanceRemaining.gte(minipoolCapacities[0]) && depositAssignmentsRemaining > 0) {
        let capacity = minipoolCapacities.shift();
        ++expectedDepositAssignments;
        expectedEthAssigned = expectedEthAssigned.add(capacity);
        depositBalanceRemaining = depositBalanceRemaining.sub(capacity);
        --depositAssignmentsRemaining;
    }

    // Get balances
    function getBalances() {
        return Promise.all([
            safeStakeDepositPool.getBalance.call(),
            web3.eth.getBalance(safeStakeVault.address).then(value => web3.utils.toBN(value)),
        ]).then(
            ([depositPoolEth, vaultEth]) =>
            ({depositPoolEth, vaultEth})
        );
    }

    // Get minipool queue details
    function getMinipoolQueueDetails() {
        return Promise.all([
            safeStakeMinipoolQueue.getTotalLength.call(),
            safeStakeMinipoolQueue.getTotalCapacity.call(),
        ]).then(
            ([totalLength, totalCapacity]) =>
            ({totalLength, totalCapacity})
        );
    }

    // Get initial balances & minipool queue details
    let [balances1, queue1] = await Promise.all([
        getBalances(),
        getMinipoolQueueDetails(),
    ]);

    // Assign deposits
    await safeStakeDepositPool.assignDeposits(txOptions);

    // Get updated balances & minipool queue details
    let [balances2, queue2] = await Promise.all([
        getBalances(),
        getMinipoolQueueDetails(),
    ]);

    // Check balances
    assert(balances2.depositPoolEth.eq(balances1.depositPoolEth.sub(expectedEthAssigned)), 'Incorrect updated deposit pool ETH balance');
    assert(balances2.vaultEth.eq(balances1.vaultEth.sub(expectedEthAssigned)), 'Incorrect updated vault ETH balance');

    // Check minipool queues
    assert(queue2.totalLength.eq(queue1.totalLength.sub(web3.utils.toBN(expectedDepositAssignments))), 'Incorrect updated minipool queue length');
    assert(queue2.totalCapacity.eq(queue1.totalCapacity.sub(expectedEthAssigned)), 'Incorrect updated minipool queue capacity');

}

