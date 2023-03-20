import { SafeStakeNodeManager } from '../_utils/artifacts';


// Register a node
export async function setSmoothingPoolRegistrationState(state, txOptions) {

    // Load contracts
    const safeStakeNodeManager = await SafeStakeNodeManager.deployed();

    // Register
    await safeStakeNodeManager.setSmoothingPoolRegistrationState(state, txOptions);

    // Check details
    const newState = await safeStakeNodeManager.getSmoothingPoolRegistrationState(txOptions.from);
    assert.equal(newState, state, 'Incorrect smoothing pool registration state');
}

