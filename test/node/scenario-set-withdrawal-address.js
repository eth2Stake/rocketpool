import { SafeStakeNodeManager, SafeStakeStorage } from '../_utils/artifacts'


// Set a node's withdrawal address
export async function setWithdrawalAddress(nodeAddress, withdrawalAddress, confirm, txOptions) {

    // Load contracts
    const safeStakeStorage = await SafeStakeStorage.deployed();

    // Set withdrawal address
    await safeStakeStorage.setWithdrawalAddress(nodeAddress, withdrawalAddress, confirm, txOptions);

    // Get current & pending withdrawal addresses
    let nodeWithdrawalAddress = await safeStakeStorage.getNodeWithdrawalAddress.call(nodeAddress);
    let nodePendingWithdrawalAddress = await safeStakeStorage.getNodePendingWithdrawalAddress.call(nodeAddress);

    // Confirmed update check
    if (confirm) {
        assert.equal(nodeWithdrawalAddress, withdrawalAddress, 'Incorrect updated withdrawal address');
    }

    // Unconfirmed update check
    else {
        assert.equal(nodePendingWithdrawalAddress, withdrawalAddress, 'Incorrect updated pending withdrawal address');
    }

}


// Confirm a node's net withdrawal address
export async function confirmWithdrawalAddress(nodeAddress, txOptions) {

    // Load contracts
    const safeStakeStorage = await SafeStakeStorage.deployed();

    // Confirm withdrawal address
    await safeStakeStorage.confirmWithdrawalAddress(nodeAddress, txOptions);

    // Get current & pending withdrawal addresses
    let nodeWithdrawalAddress = await safeStakeStorage.getNodeWithdrawalAddress.call(nodeAddress);
    let nodePendingWithdrawalAddress = await safeStakeStorage.getNodePendingWithdrawalAddress.call(nodeAddress);

    // Check
    assert.equal(nodeWithdrawalAddress, txOptions.from, 'Incorrect updated withdrawal address');
    assert.equal(nodePendingWithdrawalAddress, '0x0000000000000000000000000000000000000000', 'Incorrect pending withdrawal address');
}

