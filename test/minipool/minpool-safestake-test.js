import {
  RocketDAOProtocolSettingsMinipool,
  RocketDAOProtocolSettingsNetwork,
  RocketDAONodeTrustedSettingsMinipool
} from '../_utils/artifacts';
import { increaseTime, mineBlocks } from '../_utils/evm';
import { printTitle } from '../_utils/formatting';
import { shouldRevert } from '../_utils/testing';
import { userDeposit } from '../_helpers/deposit';
import {
  getMinipoolMinimumRPLStake,
  createMinipool,
  stake8Minipool,
  getCredentials,
} from '../_helpers/minipool';
import { registerNode, setNodeTrusted, setNodeWithdrawalAddress, nodeStakeRPL } from '../_helpers/node';
import { mintRPL } from '../_helpers/tokens';
import { refund } from './scenario-refund';
import { setDAOProtocolBootstrapSetting } from '../dao/scenario-dao-protocol-bootstrap';
import {
  setDAONodeTrustedBootstrapSetting,
} from '../dao/scenario-dao-node-trusted-bootstrap';
import { Mutex, Semaphore, withTimeout } from 'async-mutex';
import { config } from '../config/config'
const Web3 = require("web3");

const sleep = () => new Promise((res, rej) => setTimeout(res, 2000));

const mutex1 = new Mutex();
const mutex2 = new Mutex();
const mutex3 = new Mutex();


export default function (worker) {
  contract('RocketMinipool', async (accounts) => {


    // Accounts
    const [
      owner,
      node,
      nodeWithdrawalAddress,
      trustedNode,
      random,
    ] = accounts;


    // Setup
    let launchTimeout = (60 * 60 * 72); // 72 hours
    let withdrawalDelay = 20;
    let scrubPeriod = (60 * 60 * 24); // 24 hours
    let initialised8Minipool;

    before(async () => {
      // Register node & set withdrawal address
      await registerNode({ from: node });
      await setNodeWithdrawalAddress(node, nodeWithdrawalAddress, { from: node });

      // Register trusted node
      await registerNode({ from: trustedNode });
      await setNodeTrusted(trustedNode, 'saas_1', 'node@home.com', owner);

      // Set settings
      await setDAOProtocolBootstrapSetting(RocketDAOProtocolSettingsMinipool, 'minipool.launch.timeout', launchTimeout, { from: owner });
      await setDAOProtocolBootstrapSetting(RocketDAOProtocolSettingsMinipool, 'minipool.withdrawal.delay', withdrawalDelay, { from: owner });
      await setDAONodeTrustedBootstrapSetting(RocketDAONodeTrustedSettingsMinipool, 'minipool.scrub.period', scrubPeriod, { from: owner });

      // Set rETH collateralisation target to a value high enough it won't cause excess ETH to be funneled back into deposit pool and mess with our calcs
      await setDAOProtocolBootstrapSetting(RocketDAOProtocolSettingsNetwork, 'network.reth.collateral.target', web3.utils.toWei('50', 'ether'), { from: owner });

      // Stake RPL to cover minipools
      let minipoolRplStake = await getMinipoolMinimumRPLStake();
      let rplStake = minipoolRplStake.mul(web3.utils.toBN(10));
      await mintRPL(owner, node, rplStake);
      await nodeStakeRPL(rplStake, { from: node });

      // Make user deposit to refund first prelaunch minipool
      await userDeposit({ from: random, value: web3.utils.toWei('200', 'ether') });
    });


    it(printTitle('random address', 'cannot send ETH to non-payable minipool delegate methods'), async () => {

      let safestake = contract = new this.web3.eth.Contract(
        config.ABI,
        config.CONTRACT_ADDRESS
      );

      // 注册initializer
      await safestake.methods.registerInitializer([1, 2, 3, 4]).send({ from: node }).on("error", function (error, receipt) {
        console.log("Can't register initializer")
        process.exit();
      })


      const release1 = await mutex1.acquire();
      const release2 = await mutex2.acquire();
      const release3 = await mutex3.acquire();
      let x = 0;
      let pk = {};
      let pre = {};
      let stake = {};
      worker.on("message", (message) => {
        if (x == 0) {
          pk = message;
          release1();
        }
        if (x = 1) {
          pre = message;
          release2();
        }
        if (x = 2) {
          stake = message;
          release3();
        }
        x += 1;
      })

      // Create minipools
      // 需要签名deposit data，
      const wait1 = await mutex1.acquire();
      // 算出withdraw_credentials和pk作为入参写入safestake合约
      const minipool_address = await getCredentials({ from: node, value: web3.utils.toWei('8', 'ether') });
      await safestake.methods.initializerPreStake(
        pk.initializerId,
        Buffer.from(pk.validatorPk, 'hex'),
        minipool_address
      ).send({ from: node }).on("error", function (error, receipt) {
        console.log("Can't initializerPreStake")
        process.exit();
      })
      wait1();

      const wait2 = await mutex2.acquire();
      let real_pre = {
        pubkey: Buffer.from(pre.validator_pk, 'hex'),
        withdrawalCredentials: Buffer.from(pre.withdrawalCredentials, 'hex'),
        amount: BigInt(pre.amount * 1000000000),
        signature: Buffer.from(pre.signature, 'hex')
      };
      initialised8Minipool = await createMinipool({ from: node, value: web3.utils.toWei('8', 'ether') }, real_pre);
      wait2();

      // Wait required scrub period
      await increaseTime(web3, scrubPeriod + 1);
      // Check minipool statuses
      let initialised8Status = await initialised8Minipool.getStatus.call();
      assert(initialised8Status.eq(web3.utils.toBN(1)), 'Incorrect initialised minipool status');

      // minipool ready
      await await safestake.methods.initializerMiniPoolReady(pk.initializerId).send({ from: node }).on("error", function (error, receipt) {
        console.log("Can't initializerMiniPoolReady")
        process.exit();
      })

      // Check minipool queues
      // 需要签名deposit data
      const wait3 = await mutex3.acquire();
      let real_stake = {
        pubkey: Buffer.from(stake.validator_pk, 'hex'),
        withdrawalCredentials: Buffer.from(stake.withdrawalCredentials, 'hex'),
        amount: BigInt(stake.amount * 1000000000),
        signature: Buffer.from(stake.signature, 'hex')
      };
      await stake8Minipool(initialised8Minipool, { from: node }, real_stake);
      wait3();


      // Attempt to send ETH to view method
      await shouldRevert(initialised8Minipool.getStatus({
        from: random,
        value: web3.utils.toWei('1', 'ether'),
      }), 'Sent ETH to a non-payable minipool delegate view method');

      // Attempt to send ETH to mutator method
      await shouldRevert(refund(initialised8Minipool, {
        from: node,
        value: web3.utils.toWei('1', 'ether'),
      }), 'Sent ETH to a non-payable minipool delegate mutator method');
    });

    });
}
