import { printTitle } from '../_utils/formatting';
import {
    SafeStakeNodeManager,
    SafeStakeDAONodeTrustedSettingsMinipool,
    SafeStakeNodeDistributorFactory, SafeStakeNodeManagerNew, SafeStakeNodeManagerOld
} from '../_utils/artifacts';
import {
    createMinipool,
    getMinipoolMinimumRPLStake,
    stakeMinipool,
    submitMinipoolWithdrawable
} from '../_helpers/minipool';
import { registerNode, setNodeTrusted, nodeStakeRPL } from '../_helpers/node';
import { mintRPL } from '../_helpers/tokens';
import { distributeRewards } from './scenario-distribute-rewards';
import { increaseTime } from '../_utils/evm';
import { setDAONodeTrustedBootstrapSetting } from '../dao/scenario-dao-node-trusted-bootstrap';
import { shouldRevert } from '../_utils/testing';

export default function() {
    contract('SafeStakeNodeDistributor', async (accounts) => {

        // Accounts
        const [
            owner,
            node1,
            node2,
            trustedNode,
            random,
        ] = accounts;


        // Setup
        let scrubPeriod = (60 * 60 * 24); // 24 hours
        let distributorAddress;
        let rplStake;

        before(async () => {
            // Get contracts
            const safeStakeNodeDistributorFactory = await SafeStakeNodeDistributorFactory.deployed();
            // Set settings
            await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsMinipool, 'minipool.scrub.period', scrubPeriod, {from: owner});
            // Register node
            await registerNode({from: node1});
            distributorAddress = await safeStakeNodeDistributorFactory.getProxyAddress(node1);
            // Register trusted node
            await registerNode({from: trustedNode});
            await setNodeTrusted(trustedNode, 'saas_1', 'node@home.com', owner);
            // Stake RPL to cover minipools
            let minipoolRplStake = await getMinipoolMinimumRPLStake();
            rplStake = minipoolRplStake.mul(web3.utils.toBN(7));
            await mintRPL(owner, node1, rplStake);
            await nodeStakeRPL(rplStake, {from: node1}, true);
            await mintRPL(owner, node2, rplStake);
        });


        it(printTitle('node operator', 'can not initialise fee distributor if registered after upgrade'), async () => {
            // Register node
            await registerNode({from: node2});
            await nodeStakeRPL(rplStake, {from: node2});
            // Get contracts
            const safeStakeNodeManager = await SafeStakeNodeManager.deployed();
            // Attempt to initialise
            await shouldRevert(safeStakeNodeManager.initialiseFeeDistributor({from: node2}), 'Was able to initialise again', 'Already initialised');
        });


        it(printTitle('node operator', 'can not initialise fee distributor if already initialised'), async () => {
            // Attempt to initialise a second time
            const safeStakeNodeManager = await SafeStakeNodeManager.deployed();
            await shouldRevert(safeStakeNodeManager.initialiseFeeDistributor({from: node1}), 'Was able to initialise again', 'Already initialised');
        });


        it(printTitle('node operator', 'can distribute rewards with no minipools'), async () => {
            // Send ETH and distribute
            await web3.eth.sendTransaction({to: distributorAddress, from: owner, value: web3.utils.toWei("1", "ether")});
            await distributeRewards(node1, null)
        });


        it(printTitle('node operator', 'can distribute rewards with 1 minipool'), async () => {
            // Register node
            await registerNode({from: node2});
            await nodeStakeRPL(rplStake, {from: node2});
            // Create and stake a minipool
            let stakingMinipool = await createMinipool({from: node2, value: web3.utils.toWei('32', 'ether')});
            await increaseTime(web3, scrubPeriod + 1);
            await stakeMinipool(stakingMinipool, {from: node2});
            // Distribute
            await web3.eth.sendTransaction({to: distributorAddress, from: owner, value: web3.utils.toWei("1", "ether")});
            await distributeRewards(node2, null)
        });


        it(printTitle('node operator', 'can distribute rewards with multiple minipools'), async () => {
            // Register node
            await registerNode({from: node2});
            await nodeStakeRPL(rplStake, {from: node2});
            // Create and stake a minipool
            let stakingMinipool1 = await createMinipool({from: node2, value: web3.utils.toWei('32', 'ether')});
            let stakingMinipool2 = await createMinipool({from: node2, value: web3.utils.toWei('32', 'ether')});
            await increaseTime(web3, scrubPeriod + 1);
            await stakeMinipool(stakingMinipool1, {from: node2});
            await stakeMinipool(stakingMinipool2, {from: node2});

            await web3.eth.sendTransaction({to: distributorAddress, from: owner, value: web3.utils.toWei("1", "ether")});
            await distributeRewards(node2, null)
        });


        it(printTitle('node operator', 'can distribute rewards after staking and withdrawing'), async () => {
            // Register node
            await registerNode({from: node2});
            await nodeStakeRPL(rplStake, {from: node2});
            // Create and stake a minipool
            let stakingMinipool1 = await createMinipool({from: node2, value: web3.utils.toWei('32', 'ether')});
            let stakingMinipool2 = await createMinipool({from: node2, value: web3.utils.toWei('32', 'ether')});
            await increaseTime(web3, scrubPeriod + 1);
            await stakeMinipool(stakingMinipool1, {from: node2});
            await stakeMinipool(stakingMinipool2, {from: node2});

            // Mark minipool as withdrawable to remove it from the average fee calculation
            await submitMinipoolWithdrawable(stakingMinipool1.address, {from: trustedNode});

            await web3.eth.sendTransaction({to: distributorAddress, from: owner, value: web3.utils.toWei("1", "ether")});
            await distributeRewards(node2, null)
        });
    });
}
