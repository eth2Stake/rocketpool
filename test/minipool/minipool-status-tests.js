import { mineBlocks, getCurrentTime, increaseTime } from '../_utils/evm'
import { printTitle } from '../_utils/formatting';
import { shouldRevert } from '../_utils/testing';
import { userDeposit } from '../_helpers/deposit';
import { getMinipoolMinimumRPLStake, createMinipool, stakeMinipool } from '../_helpers/minipool';
import { registerNode, setNodeTrusted, nodeStakeRPL } from '../_helpers/node';
import { mintRPL } from '../_helpers/tokens';
import { executeSetWithdrawable, submitWithdrawable } from './scenario-submit-withdrawable'
import {
    SafeStakeDAONodeTrustedSettingsMinipool,
    SafeStakeDAONodeTrustedSettingsProposals,
    SafeStakeDAOProtocolSettingsMinipool
} from '../_utils/artifacts';
import { setDAOProtocolBootstrapSetting } from '../dao/scenario-dao-protocol-bootstrap';
import { daoNodeTrustedExecute, daoNodeTrustedMemberLeave, daoNodeTrustedPropose, daoNodeTrustedVote } from '../dao/scenario-dao-node-trusted'
import { getDAOProposalEndTime, getDAOProposalStartTime } from '../dao/scenario-dao-proposal'
import { setDAONodeTrustedBootstrapSetting } from '../dao/scenario-dao-node-trusted-bootstrap'

export default function() {
    contract('SafeStakeMinipoolStatus', async (accounts) => {

        // Accounts
        const [
            owner,
            node,
            trustedNode1,
            trustedNode2,
            trustedNode3,
            trustedNode4,
            staker,
            random,
        ] = accounts;


        // Constants
        let proposalCooldown = 10
        let proposalVoteBlocks = 10
        let scrubPeriod = (60 * 60 * 24); // 24 hours


        // Setup
        let stakingMinipool1;
        let stakingMinipool2;
        let stakingMinipool3;
        before(async () => {
            // Register node
            await registerNode({from: node});

            // Register trusted nodes
            await registerNode({from: trustedNode1});
            await registerNode({from: trustedNode2});
            await registerNode({from: trustedNode3});
            await setNodeTrusted(trustedNode1, 'saas_1', 'node1@home.com', owner);
            await setNodeTrusted(trustedNode2, 'saas_2', 'node2@home.com', owner);
            await setNodeTrusted(trustedNode3, 'saas_3', 'node3@home.com', owner);
     

            // Stake RPL to cover minipools
            let minipoolRplStake = await getMinipoolMinimumRPLStake();
            let rplStake = minipoolRplStake.mul(web3.utils.toBN(3));
            await mintRPL(owner, node, rplStake);
            await nodeStakeRPL(rplStake, {from: node});

            // Create minipools
            stakingMinipool1 = await createMinipool({from: node, value: web3.utils.toWei('16', 'ether')});
            stakingMinipool2 = await createMinipool({from: node, value: web3.utils.toWei('16', 'ether')});
            stakingMinipool3 = await createMinipool({from: node, value: web3.utils.toWei('16', 'ether')});

            // Make and assign deposits to minipools
            await userDeposit({from: staker, value: web3.utils.toWei('16', 'ether')});
            await userDeposit({from: staker, value: web3.utils.toWei('16', 'ether')});
            await userDeposit({from: staker, value: web3.utils.toWei('16', 'ether')});

            // Wait required scrub period
            await increaseTime(web3, scrubPeriod + 1);

            // Stake minipools
            await stakeMinipool(stakingMinipool1, {from: node});
            await stakeMinipool(stakingMinipool2, {from: node});
            await stakeMinipool(stakingMinipool3, {from: node});

            // Check minipool statuses
            let stakingStatus1 = await stakingMinipool1.getStatus.call();
            let stakingStatus2 = await stakingMinipool2.getStatus.call();
            let stakingStatus3 = await stakingMinipool3.getStatus.call();
            assert(stakingStatus1.eq(web3.utils.toBN(2)), 'Incorrect staking minipool status');
            assert(stakingStatus2.eq(web3.utils.toBN(2)), 'Incorrect staking minipool status');
            assert(stakingStatus3.eq(web3.utils.toBN(2)), 'Incorrect staking minipool status');

            // Set a small proposal cooldown
            await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsProposals, 'proposal.cooldown', proposalCooldown, { from: owner });
            await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsProposals, 'proposal.vote.blocks', proposalVoteBlocks, { from: owner });
            await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsMinipool, 'minipool.scrub.period', scrubPeriod, {from: owner});
            // Set a small vote delay
            await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsProposals, 'proposal.vote.delay.blocks', 4, { from: owner });

        });


        async function trustedNode4JoinDao() {
            await registerNode({from: trustedNode4});
            await setNodeTrusted(trustedNode4, 'saas_4', 'node@home.com', owner);
        }


        async function trustedNode4LeaveDao() {
            // Wait enough time to do a new proposal
            await mineBlocks(web3, proposalCooldown);
            // Encode the calldata for the proposal
            let proposalCallData = web3.eth.abi.encodeFunctionCall(
              {name: 'proposalLeave', type: 'function', inputs: [{type: 'address', name: '_nodeAddress'}]},
              [trustedNode4]
            );
            // Add the proposal
            let proposalId = await daoNodeTrustedPropose('hey guys, can I please leave the DAO?', proposalCallData, {
                from: trustedNode4
            });
            // Current block
            let timeCurrent = await getCurrentTime(web3);
            // Now mine blocks until the proposal is 'active' and can be voted on
            await increaseTime(web3, (await getDAOProposalStartTime(proposalId)-timeCurrent)+2);
            // Now lets vote
            await daoNodeTrustedVote(proposalId, true, { from: trustedNode1 });
            await daoNodeTrustedVote(proposalId, true, { from: trustedNode2 });
            await daoNodeTrustedVote(proposalId, true, { from: trustedNode3 });
            // Fast forward to this voting period finishing
            timeCurrent = await getCurrentTime(web3);
            await increaseTime(web3, (await getDAOProposalEndTime(proposalId)-timeCurrent)+1);
            // Proposal should be successful, lets execute it
            await daoNodeTrustedExecute(proposalId, { from: trustedNode1 });
            // Member can now leave and collect any RPL bond
            await daoNodeTrustedMemberLeave(trustedNode4, { from: trustedNode4 });
        }


        //
        // Submit withdrawable
        //


        it(printTitle('trusted nodes', 'can submit a withdrawable event for a staking minipool'), async () => {

            // Submit identical withdrawable events to trigger update:

            // Minipool 1 - rewards earned
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode2,
            });

            // Minipool 2 - penalties applied
            await submitWithdrawable(stakingMinipool2.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool2.address, {
                from: trustedNode2,
            });

            // Minipool 3 - penalties applied & RPL slashed
            await submitWithdrawable(stakingMinipool3.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool3.address, {
                from: trustedNode2,
            });

        });


        it(printTitle('trusted nodes', 'cannot submit a withdrawable event for a minipool while withdrawable submissions are disabled'), async () => {

            // Disable submissions
            await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsMinipool, 'minipool.submit.withdrawable.enabled', false, {from: owner});

            // Attempt to submit withdrawable event for staking minipool
            await shouldRevert(submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            }), 'Submitted a withdrawable event while withdrawable submissions were disabled');

        });


        it(printTitle('trusted nodes', 'cannot submit a withdrawable event for a minipool which is not staking'), async () => {

            // Submit withdrawable events to trigger update
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode2,
            });

            // Attempt to submit withdrawable event for withdrawable minipool
            await shouldRevert(submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode3,
            }), 'Submitted a withdrawable event for a minipool which was not staking');

        });


        it(printTitle('trusted nodes', 'cannot submit a withdrawable event for an invalid minipool'), async () => {

            // Attempt to submit withdrawable event for invalid minipool
            await shouldRevert(submitWithdrawable(random, {
                from: trustedNode1,
            }), 'Submitted a withdrawable event for an invalid minipool');

        });


        it(printTitle('trusted nodes', 'cannot submit a withdrawable event for a minipool twice'), async () => {

            // Submit withdrawable event for staking minipool
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            });

            // Attempt to submit withdrawable event for staking minipool again
            await shouldRevert(submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            }), 'Submitted the same withdrawable event for a minipool twice');

        });


        it(printTitle('regular nodes', 'cannot submit a withdrawable event for a minipool'), async () => {

            // Attempt to submit withdrawable event for staking minipool
            await shouldRevert(submitWithdrawable(stakingMinipool1.address, {
                from: node,
            }), 'Regular node submitted a withdrawable event for a minipool');

        });


        it(printTitle('random', 'can execute status update when consensus is reached after member count changes'), async () => {
            // Setup
            await trustedNode4JoinDao();
            // Submit status from 2 nodes (not enough for 4 member consensus but enough for 3)
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode2,
            });
            // trustedNode4 leaves the DAO
            await trustedNode4LeaveDao();
            // There is now consensus with the remaining 3 trusted nodes about the status, try to execute the update
            await executeSetWithdrawable(stakingMinipool1.address, {
                from: random
            })
        });


        it(printTitle('random', 'cannot execute status update without consensus'), async () => {
            // Setup
            await trustedNode4JoinDao();
            // Submit same price from 2 nodes (not enough for 4 member consensus)
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode1,
            });
            await submitWithdrawable(stakingMinipool1.address, {
                from: trustedNode2,
            });
            // There is no consensus so execute should fail
            await shouldRevert(executeSetWithdrawable(stakingMinipool1.address, {
                from: random
            }), 'Random account could execute update status without consensus')
        });
    });
}
