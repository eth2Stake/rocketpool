import {
  SafeStakeMinipoolDelegate, SafeStakeMinipoolManager, SafeStakeMinipoolManagerNew,
  SafeStakeNodeDistributorDelegate,
  SafeStakeNodeDistributorFactory, SafeStakeNodeManager, SafeStakeNodeManagerNew,
  SafeStakeStorage,
  SafeStakeTokenRETH
} from '../_utils/artifacts';


export async function distributeRewards(nodeAddress, txOptions) {
  // Get contracts
  const safeStakeStorage = await SafeStakeStorage.deployed();
  const safeStakeNodeDistributorFactory = await SafeStakeNodeDistributorFactory.deployed();
  const distributorAddress = await safeStakeNodeDistributorFactory.getProxyAddress(nodeAddress);
  const distributor = await SafeStakeNodeDistributorDelegate.at(distributorAddress);
  const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
  const safeStakeMinipoolManager = await SafeStakeMinipoolManager.deployed();
  const safeStakeNodeManager = await SafeStakeNodeManager.deployed();
  // Get node withdrawal address
  const withdrawalAddress = await safeStakeStorage.getNodeWithdrawalAddress(nodeAddress);
  // Get distributor contract balance
  const distributorBalance = new web3.utils.BN(await web3.eth.getBalance(distributorAddress));
  // Get nodes average fee
  const minipoolCount = new web3.utils.BN(await safeStakeMinipoolManager.getNodeMinipoolCount(nodeAddress)).toNumber();

  async function getMinipoolDetails(index) {
    const minipoolAddress = await safeStakeMinipoolManager.getNodeMinipoolAt(nodeAddress, index);
    const minipool = await SafeStakeMinipoolDelegate.at(minipoolAddress)
    return Promise.all([
      minipool.getStatus(),
      minipool.getNodeFee()
    ]).then(
      ([status, fee]) => ({
        status: new web3.utils.BN(status),
        fee: new web3.utils.BN(fee)
      })
    )
  }

  // Get status and node fee of each minipool
  const minipoolDetails = await Promise.all([...Array(minipoolCount).keys()].map(i => getMinipoolDetails(i)))

  let numerator = new web3.utils.BN(0);
  let denominator = new web3.utils.BN(0);

  for (const minipoolDetail of minipoolDetails) {
    if (minipoolDetail.status.toNumber() === 2){ // Staking
      numerator = numerator.add(minipoolDetail.fee);
      denominator = denominator.add(new web3.utils.BN(1));
    }
  }

  let expectedAverageFee = new web3.utils.BN(0);

  if (!numerator.eq(expectedAverageFee)){
    expectedAverageFee = numerator.div(denominator);
  }

  // Query average fee from contracts
  const averageFee = new web3.utils.BN(await safeStakeNodeManager.getAverageNodeFee(nodeAddress));
  assert.strictEqual(averageFee.toString(), expectedAverageFee.toString(), 'Incorrect average node fee');

  // Calculate expected node and user amounts from average fee
  const halfAmount = distributorBalance.div(new web3.utils.BN(2));
  const expectedNodeAmount = halfAmount.add(halfAmount.mul(averageFee).div(new web3.utils.BN(web3.utils.toWei('1', 'ether'))));
  const expectedUserAmount = distributorBalance.sub(expectedNodeAmount);

  async function getBalances() {
    return Promise.all([
      web3.eth.getBalance(withdrawalAddress),
      web3.eth.getBalance(safeStakeTokenRETH.address),
    ]).then(
      ([nodeEth, userEth]) =>
        ({
          nodeEth: new web3.utils.BN(nodeEth),
          userEth: new web3.utils.BN(userEth)
        })
    );
  }

  // Get balance before distribute
  const balances1 = await getBalances();
  // Call distributor
  await distributor.distribute();
  // Get balance after distribute
  const balances2 = await getBalances();
  // Check results
  const nodeEthChange = balances2.nodeEth.sub(balances1.nodeEth);
  const userEthChange = balances2.userEth.sub(balances1.userEth);
  assert.strictEqual(nodeEthChange.toString(), expectedNodeAmount.toString(), 'Node ETH balance not correct');
  assert.strictEqual(userEthChange.toString(), expectedUserAmount.toString(), 'User ETH balance not correct');
}
