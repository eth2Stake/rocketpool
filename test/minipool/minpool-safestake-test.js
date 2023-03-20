import {
  SafeStakeDAOProtocolSettingsMinipool,
  SafeStakeDAOProtocolSettingsNetwork,
  SafeStakeDAONodeTrustedSettingsMinipool
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
const web3_safestake = new Web3("http://localhost:8585");

var safestake = new web3_safestake.eth.Contract(
  config.ABI,
  config.CONTRACT_ADDRESS
);

safestake.options.data = config.bytecode;

const mutex1 = new Mutex();
const mutex2 = new Mutex();
const mutex3 = new Mutex();

async function registerInitializer(from, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      await safestake.methods.registerInitializer(...payload).send({ from: from }).on("error", function (error, receipt) {
        console.log("Can't register initializer")
        console.log(error)
        console.log(receipt)
        reject(false)
      }).on('receipt', async (receipt) => {
        console.log("register initializer success")
        resolve(true)
      })
    } catch (error) {
      reject(false)
    }
  })
}

async function initializerPreStake(from, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      await safestake.methods.initializerPreStake(...payload).send({ from: from }).on("error", function (error, receipt) {
        console.log("Can't initializerPreStake" + error)
        reject(false)
      }).on('receipt', async (receipt) => {
        // eslint-disable-next-line no-prototype-builtins
        console.log("initializerPreStake success")
        resolve(true)
      })
    } catch (error) {
      reject(false)
    }
  })
}

async function initializerMiniPoolReady(from, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      await safestake.methods.initializerMiniPoolReady(...payload).send({ from: from }).on("error", function (error, receipt) {
        console.log("Can't initializerMiniPoolReady" + error)
        reject(false)
      }).on('receipt', async (receipt) => {
        // eslint-disable-next-line no-prototype-builtins
        console.log("initializerMiniPoolReady success")
        resolve(true)
      })
    } catch (error) {
      reject(false)
    }
  })
}


export default function (worker) {
  contract('SafeStakeMinipool', async (accounts) => {

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
      await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsMinipool, 'minipool.launch.timeout', launchTimeout, { from: owner });
      await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsMinipool, 'minipool.withdrawal.delay', withdrawalDelay, { from: owner });
      await setDAONodeTrustedBootstrapSetting(SafeStakeDAONodeTrustedSettingsMinipool, 'minipool.scrub.period', scrubPeriod, { from: owner });

      // Set rETH collateralisation target to a value high enough it won't cause excess ETH to be funneled back into deposit pool and mess with our calcs
      await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNetwork, 'network.reth.collateral.target', web3.utils.toWei('50', 'ether'), { from: owner });

      // Stake RPL to cover minipools
      let minipoolRplStake = await getMinipoolMinimumRPLStake();
      let rplStake = minipoolRplStake.mul(web3.utils.toBN(10));
      await mintRPL(owner, node, rplStake);
      await nodeStakeRPL(rplStake, { from: node });

      // Make user deposit to refund first prelaunch minipool
      await userDeposit({ from: random, value: web3.utils.toWei('200', 'ether') });

      console.log("contract ready");
    });


    it(printTitle('random address', 'cannot send ETH to non-payable minipool delegate methods'), async () => {

      // 注册initializer
      const [test] = await web3_safestake.eth.getAccounts();

      await registerInitializer(test, [[1, 2, 3, 4]]);

      const release1 = await mutex1.acquire();
      const release2 = await mutex2.acquire();
      const release3 = await mutex3.acquire();
      let x = 0;
      let pk = {};
      let pre = {};
      let stake = {};
      worker.on("message", (message) => {
        console.log(message);
        if (x == 0) {
          pk = message;
          console.log("worker recive validator_pk success");
          release1();
        }
        else if (x == 1) {
          pre = message;
          console.log("worker recive prestake_signature success");
          release2();
        }
        else if (x == 2) {
          stake = message;
          console.log("worker recive stake_signature success");
          release3();
        }
        x += 1;
      })

      // Create minipools
      // 需要签名deposit data，
      const wait1 = await mutex1.acquire();
      // 算出withdraw_credentials和pk作为入参写入safestake合约
      const minipool_address = await getCredentials({ from: node, value: web3.utils.toWei('8', 'ether') });
      await initializerPreStake(test,
        [pk.initializerId,
        Buffer.from(pk.validatorPk, 'hex'),
          minipool_address]
      );
      console.log("initializerPreStake success");
      wait1();

      const wait2 = await mutex2.acquire();
      let real_pre = {
        pubkey: Buffer.from(pre.validatorPk, 'hex'),
        withdrawalCredentials: Buffer.from(pre.withdrawalCredentials, 'hex'),
        amount: BigInt(pre.amount * 1000000000),
        signature: Buffer.from(pre.signature, 'hex')
      };
      initialised8Minipool = await createMinipool({ from: node, value: web3.utils.toWei('8', 'ether') }, real_pre);
      console.log("safeStakepool preStake success");
      wait2();

      // Wait required scrub period
      await increaseTime(web3, scrubPeriod + 1);
      // Check minipool statuses
      let initialised8Status = await initialised8Minipool.getStatus.call();
      assert(initialised8Status.eq(web3.utils.toBN(1)), 'Incorrect initialised minipool status');

      // minipool ready
      await initializerMiniPoolReady(test, [pk.initializerId]);

      console.log("initializerMiniPoolReady success");

      // Check minipool queues
      // 需要签名deposit data
      const wait3 = await mutex3.acquire();
      let real_stake = {
        pubkey: Buffer.from(stake.validatorPk, 'hex'),
        withdrawalCredentials: Buffer.from(stake.withdrawalCredentials, 'hex'),
        amount: BigInt(stake.amount * 1000000000),
        signature: Buffer.from(stake.signature, 'hex')
      };
      await stake8Minipool(initialised8Minipool, { from: node }, real_stake);
      console.log("stake8Minipool success");
      wait3();

      // console.log("test success")

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
