import { SafeStakeNodeManager } from '../_utils/artifacts';


// Register a node
export async function register(timezoneLocation, txOptions) {

    // Load contracts
    const safeStakeNodeManager = await SafeStakeNodeManager.deployed();

    // Get node details
    function getNodeDetails(nodeAddress) {
        return Promise.all([
            safeStakeNodeManager.getNodeExists.call(nodeAddress),
            safeStakeNodeManager.getNodeTimezoneLocation.call(nodeAddress),
        ]).then(
            ([exists, timezoneLocation]) =>
            ({exists, timezoneLocation})
        );
    }

    // Get initial node index
    let nodeCount1 = await safeStakeNodeManager.getNodeCount.call();

    // Register
    await safeStakeNodeManager.registerNode(timezoneLocation, txOptions);

    // Get updated node index & node details
    let nodeCount2 = await safeStakeNodeManager.getNodeCount.call();
    let [lastNodeAddress, details] = await Promise.all([
        safeStakeNodeManager.getNodeAt.call(nodeCount2.sub(web3.utils.toBN(1))),
        getNodeDetails(txOptions.from),
    ]);

    // Check details
    assert(nodeCount2.eq(nodeCount1.add(web3.utils.toBN(1))), 'Incorrect updated node count');
    assert.equal(lastNodeAddress, txOptions.from, 'Incorrect updated node index');
    assert.isTrue(details.exists, 'Incorrect node exists flag');
    assert.equal(details.timezoneLocation, timezoneLocation, 'Incorrect node timezone location');

}

