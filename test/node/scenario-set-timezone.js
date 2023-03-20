import { SafeStakeNodeManager } from '../_utils/artifacts';


// Set a node's timezone location
export async function setTimezoneLocation(timezoneLocation, txOptions) {

    // Load contracts
    const safeStakeNodeManager = await SafeStakeNodeManager.deployed();

    // Set timezone location
    await safeStakeNodeManager.setTimezoneLocation(timezoneLocation, txOptions);

    // Get timezone location
    let nodeTimezoneLocation = await safeStakeNodeManager.getNodeTimezoneLocation.call(txOptions.from);

    // Check
    assert.equal(nodeTimezoneLocation, timezoneLocation, 'Incorrect updated timezone location');

}

