// Import tests
import auctionTests from './auction/auction-tests';
import depositPoolTests from './deposit/deposit-pool-tests';
import minipoolScrubTests from './minipool/minipool-scrub-tests';
import minipoolTests from './minipool/minipool-tests';
import minipoolStatusTests from './minipool/minipool-status-tests';
import minipoolWithdrawalTests from './minipool/minipool-withdrawal-tests';
import networkBalancesTests from './network/network-balances-tests';
import networkPenaltiesTests from './network/network-penalties-tests';
import networkFeesTests from './network/network-fees-tests';
import networkPricesTests from './network/network-prices-tests';
import nodeDepositTests from './node/node-deposit-tests';
import nodeManagerTests from './node/node-manager-tests';
import nodeStakingTests from './node/node-staking-tests';
import nodeDistributorTests from './node/node-distributor-tests';
import daoProtocolTests from './dao/dao-protocol-tests';
import daoNodeTrustedTests from './dao/dao-node-trusted-tests';
import rethTests from './token/reth-tests';
import rplTests from './token/rpl-tests';
import rewardsPoolTests from './rewards/rewards-tests';
import networkStakingTests from './network/network-staking-tests';
import { printGasUsage, startGasUsage, endGasUsage } from './_utils/gasusage';
import { endSnapShot, startSnapShot } from './_utils/snapshotting';
import { setDAOProtocolBootstrapSetting } from './dao/scenario-dao-protocol-bootstrap';
import {
  SafeStakeDAOProtocolSettingsDeposit, SafeStakeDAOProtocolSettingsInflation,
  SafeStakeDAOProtocolSettingsMinipool,
  SafeStakeDAOProtocolSettingsNetwork,
  SafeStakeDAOProtocolSettingsNode
} from './_utils/artifacts';
import minpoolSafestakeTest from './minipool/minpool-safestake-test';
const express = require("express");
const bodyParser = require("body-parser");

const {
  isMainThread,
  Worker,
  parentPort,
  threadId,
  MessageChannel
} = require('worker_threads');

console.log('\n');
console.log('______           _        _    ______           _ ');
console.log('| ___ \\         | |      | |   | ___ \\         | |');
console.log('| |_/ /___   ___| | _____| |_  | |_/ /__   ___ | |');
console.log('|    // _ \\ / __| |/ / _ \\ __| |  __/ _ \\ / _ \\| |');
console.log('| |\\ \\ (_) | (__|   <  __/ |_  | | | (_) | (_) | |');
console.log('\\_| \\_\\___/ \\___|_|\\_\\___|\\__| \\_|  \\___/ \\___/|_|');

// State snapshotting and gas usage tracking
beforeEach(startSnapShot);
beforeEach(startGasUsage);
afterEach(endGasUsage);
afterEach(endSnapShot);
after(printGasUsage);

// Setup starting parameters for all tests
before(async function () {
  const [guardian] = await web3.eth.getAccounts();
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsDeposit, 'deposit.enabled', true, { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsDeposit, 'deposit.assign.enabled', true, { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsDeposit, 'deposit.pool.maximum', web3.utils.toWei('1000', 'ether'), { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNode, 'node.registration.enabled', true, { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNode, 'node.deposit.enabled', true, { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsMinipool, 'minipool.submit.withdrawable.enabled', true, { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNetwork, 'network.node.fee.minimum', web3.utils.toWei('0.05', 'ether'), { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNetwork, 'network.node.fee.target', web3.utils.toWei('0.1', 'ether'), { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNetwork, 'network.node.fee.maximum', web3.utils.toWei('0.2', 'ether'), { from: guardian });
  await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsNetwork, 'network.node.demand.range', web3.utils.toWei('1000', 'ether'), { from: guardian });
  // await setDAOProtocolBootstrapSetting(SafeStakeDAOProtocolSettingsInflation, 'rpl.inflation.interval.start', Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24 * 14), { from: guardian });
});

// Run tests
// daoProtocolTests();
// daoNodeTrustedTests();
// auctionTests();
// depositPoolTests();
// minipoolScrubTests();
// minipoolTests();
const { port1, port2 } = new MessageChannel();
const app = express();
app.use(function (req, res, next) {
  res.append("access-control-allow-origin", "*");
  res.append("content-type", "application/json; charset=utf-8");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  port2.postMessage("hello");
  res.send("Hello World");
  // worker.postMessage()
});

app.post("/v1/validator_pk", async function (req, res) {
  const params = req.body;
  console.log("recive validator_pk success");
  port2.postMessage(params);
  return res.json();
})

app.post("/v1/prestake_signature", async function (req, res) {
  const params = req.body;
  console.log("recive prestake_signature success");
  port2.postMessage(params);
  return res.json();
})

app.post("/v1/stake_signature", async function (req, res) {
  const params = req.body;
  console.log("recive stake_signature success");
  port2.postMessage(params);
  return res.json();
})

app.listen(1234, () =>
  console.log("Start Server, listening on port " + 1234 + "!")
);

minpoolSafestakeTest(port1);

// Header
// minipoolStatusTests();
// minipoolWithdrawalTests();
// networkBalancesTests();
// networkPenaltiesTests();
// networkFeesTests();
// networkPricesTests();
// networkStakingTests();
// nodeDepositTests();
// nodeManagerTests();
// nodeStakingTests();
// nodeDistributorTests();
// rethTests();
// rplTests();
// rewardsPoolTests();
