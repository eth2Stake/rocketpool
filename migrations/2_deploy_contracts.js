/*** Dependencies ********************/


const pako = require('pako');


/*** Settings ************************/

const config = require('../truffle.js');

/*** Utility Methods *****************/


// Compress / decompress ABIs
function compressABI(abi) {
  return Buffer.from(pako.deflate(JSON.stringify(abi))).toString('base64');
}
function decompressABI(abi) {
  return JSON.parse(pako.inflate(Buffer.from(abi, 'base64'), {to: 'string'}));
}

// Load ABI files and parse
function loadABI(abiFilePath) {
  return JSON.parse(config.fs.readFileSync(abiFilePath));
}


/*** Contracts ***********************/


// Storage
const safeStakeStorage =                       artifacts.require('SafeStakeStorage.sol');

// Network contracts
const contracts = {
  // Vault
  safeStakeVault:                              artifacts.require('SafeStakeVault.sol'),
  // Auction
  safeStakeAuctionManager:                     artifacts.require('SafeStakeAuctionManager.sol'),
  // Deposit
  safeStakeDepositPool:                        artifacts.require('SafeStakeDepositPool.sol'),
  // Minipool
  safeStakeMinipoolDelegate:                   artifacts.require('SafeStakeMinipoolDelegate.sol'),
  safeStakeMinipoolManager:                    artifacts.require('SafeStakeMinipoolManager.sol'),
  safeStakeMinipoolQueue:                      artifacts.require('SafeStakeMinipoolQueue.sol'),
  safeStakeMinipoolStatus:                     artifacts.require('SafeStakeMinipoolStatus.sol'),
  safeStakeMinipoolPenalty:                    artifacts.require('SafeStakeMinipoolPenalty.sol'),
  // Network
  safeStakeNetworkBalances:                    artifacts.require('SafeStakeNetworkBalances.sol'),
  safeStakeNetworkFees:                        artifacts.require('SafeStakeNetworkFees.sol'),
  safeStakeNetworkPrices:                      artifacts.require('SafeStakeNetworkPrices.sol'),
  safeStakeNetworkPenalties:                   artifacts.require('SafeStakeNetworkPenalties.sol'),
  // Rewards
  safeStakeRewardsPool:                        artifacts.require('SafeStakeRewardsPool.sol'),
  safeStakeClaimDAO:                           artifacts.require('SafeStakeClaimDAO.sol'),
  // Node
  safeStakeNodeDeposit:                        artifacts.require('SafeStakeNodeDeposit.sol'),
  safeStakeNodeManager:                        artifacts.require('SafeStakeNodeManager.sol'),
  safeStakeNodeStaking:                        artifacts.require('SafeStakeNodeStaking.sol'),
  // DAOs
  safeStakeDAOProposal:                        artifacts.require('SafeStakeDAOProposal.sol'),
  safeStakeDAONodeTrusted:                     artifacts.require('SafeStakeDAONodeTrusted.sol'),
  safeStakeDAONodeTrustedProposals:            artifacts.require('SafeStakeDAONodeTrustedProposals.sol'),
  safeStakeDAONodeTrustedActions:              artifacts.require('SafeStakeDAONodeTrustedActions.sol'),
  safeStakeDAONodeTrustedUpgrade:              artifacts.require('SafeStakeDAONodeTrustedUpgrade.sol'),
  safeStakeDAONodeTrustedSettingsMembers:      artifacts.require('SafeStakeDAONodeTrustedSettingsMembers.sol'),
  safeStakeDAONodeTrustedSettingsProposals:    artifacts.require('SafeStakeDAONodeTrustedSettingsProposals.sol'),
  safeStakeDAONodeTrustedSettingsMinipool:     artifacts.require('SafeStakeDAONodeTrustedSettingsMinipool.sol'),
  safeStakeDAOProtocol:                        artifacts.require('SafeStakeDAOProtocol.sol'),
  safeStakeDAOProtocolProposals:               artifacts.require('SafeStakeDAOProtocolProposals.sol'),
  safeStakeDAOProtocolActions:                 artifacts.require('SafeStakeDAOProtocolActions.sol'),
  safeStakeDAOProtocolSettingsInflation:       artifacts.require('SafeStakeDAOProtocolSettingsInflation.sol'),
  safeStakeDAOProtocolSettingsRewards:         artifacts.require('SafeStakeDAOProtocolSettingsRewards.sol'),
  safeStakeDAOProtocolSettingsAuction:         artifacts.require('SafeStakeDAOProtocolSettingsAuction.sol'),
  safeStakeDAOProtocolSettingsNode:            artifacts.require('SafeStakeDAOProtocolSettingsNode.sol'),
  safeStakeDAOProtocolSettingsNetwork:         artifacts.require('SafeStakeDAOProtocolSettingsNetwork.sol'),
  safeStakeDAOProtocolSettingsDeposit:         artifacts.require('SafeStakeDAOProtocolSettingsDeposit.sol'),
  safeStakeDAOProtocolSettingsMinipool:        artifacts.require('SafeStakeDAOProtocolSettingsMinipool.sol'),
  // Tokens
  safeStakeTokenRPLFixedSupply:                artifacts.require('SafeStakeTokenDummyRPL.sol'),
  safeStakeTokenRETH:                          artifacts.require('SafeStakeTokenRETH.sol'),
  safeStakeTokenRPL:                           artifacts.require('SafeStakeTokenRPL.sol'),
  // v1.1
  safeStakeMerkleDistributorMainnet:           artifacts.require('SafeStakeMerkleDistributorMainnet.sol'),
  safeStakeDAONodeTrustedSettingsRewards:      artifacts.require('SafeStakeDAONodeTrustedSettingsRewards.sol'),
  safeStakeSmoothingPool:                      artifacts.require('SafeStakeSmoothingPool.sol'),
  safeStakeNodeDistributorFactory:             artifacts.require('SafeStakeNodeDistributorFactory.sol'),
  safeStakeNodeDistributorDelegate:            artifacts.require('SafeStakeNodeDistributorDelegate.sol'),
  safeStakeMinipoolFactory:                    artifacts.require('SafeStakeMinipoolFactory.sol'),
  // Utils
  addressQueueStorage:                      artifacts.require('AddressQueueStorage.sol'),
  addressSetStorage:                        artifacts.require('AddressSetStorage.sol'),
};

// Development helper contracts
const revertOnTransfer = artifacts.require('RevertOnTransfer.sol');

// Instance contract ABIs
const abis = {
  // Minipool
  safeStakeMinipool:                           [artifacts.require('SafeStakeMinipoolDelegate.sol'), artifacts.require('SafeStakeMinipool.sol')],
};


/*** Deployment **********************/


// Deploy SafeStake Pool
module.exports = async (deployer, network) => {

  // Truffle add '-fork' for some reason when deploying to actual testnets
  network = network.replace("-fork", "");

  // Set our web3 provider
  console.log(`Web3 1.0 provider using network: `+network);
  const provider = network.hasProvider ? config.networks[network].provider(): `http://${config.networks[network].host}:${config.networks[network].port}`;
  let $web3 = new config.web3(provider);
  console.log('\n');

  // // Accounts


  // Live deployment
  if ( network == 'live' ) {
    // Casper live contract address
    let casperDepositAddress = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
    const casperDepositABI = loadABI('./contracts/contract/casper/compiled/Deposit.abi');
    contracts.casperDeposit = {
          address: casperDepositAddress,
              abi: casperDepositABI,
      precompiled: true
    };
    // Add our live RPL token address in place
    contracts.safeStakeTokenRPLFixedSupply.address = '0xb4efd85c19999d84251304bda99e90b92300bd93';
  }

  // Goerli test network
  else if (network == 'goerli') {

    // Casper deposit contract details
    const casperDepositAddress = '0xff50ed3d0ec03ac01d4c79aad74928bff48a7b2b';       // Prater
    const casperDepositABI = loadABI('./contracts/contract/casper/compiled/Deposit.abi');
    contracts.casperDeposit = {
          address: casperDepositAddress,
              abi: casperDepositABI,
      precompiled: true
    };

  }

  // Test network deployment
  else {
    let accounts = await $web3.eth.getAccounts(function (error, result) {
      if (error != null) {
        console.log(error);
        console.log("Error retrieving accounts.'");
      }
      return result;
    });

    console.log(accounts);

    // Precompiled - Casper Deposit Contract
    const casperDepositABI = loadABI('./contracts/contract/casper/compiled/Deposit.abi');
    const casperDeposit = new $web3.eth.Contract(casperDepositABI, null, {
        from: accounts[0],
        gasPrice: '20000000000' // 20 gwei
    });

    // Create the contract now
    const casperDepositContract = await casperDeposit.deploy(
      // Casper deployment
      {
        data: config.fs.readFileSync('./contracts/contract/casper/compiled/Deposit.bin').toString()
      }).send({
          from: accounts[0],
          gas: 8000000,
          gasPrice: '20000000000'
      });

    // Set the Casper deposit address
    let casperDepositAddress = casperDepositContract._address;

    // Store it in storage
    contracts.casperDeposit = {
          address: casperDepositAddress,
              abi: casperDepositABI,
      precompiled: true
    };
  }


  // Deploy safeStakeStorage first - has to be done in this order so that the following contracts already know the storage address

  let deployBlockFunc = new Promise(async (s,r)=>{
    await deployer.deploy(safeStakeStorage).then(async(instance)=> {
        const rsTx = await web3.eth.getTransactionReceipt(instance.transactionHash);
        s(rsTx.blockNumber);
    });
  })
  let deployBlock = await deployBlockFunc;
  if (!deployBlock){
    console.log("wtf");
  }

  // Update the storage with the new addresses
  let safeStakeStorageInstance = await safeStakeStorage.deployed();
  // Deploy other contracts - have to be inside an async loop
  const deployContracts = async function() {
    for (let contract in contracts) {
      // Only deploy if it hasn't been deployed already like a precompiled
      if(!contracts[contract].hasOwnProperty('precompiled')) {
        switch (contract) {

          // New RPL contract - pass storage address & existing RPL contract address
          case 'safeStakeTokenRPL':
            await deployer.deploy(contracts[contract], safeStakeStorage.address, contracts.safeStakeTokenRPLFixedSupply.address);
          break;

          // Contracts with no constructor args
          case 'safeStakeMinipoolDelegate':
          case 'safeStakeNodeDistributorDelegate':
            await deployer.deploy(contracts[contract]);
          break;

          // All other contracts - pass storage address
          default:
            await deployer.deploy(contracts[contract], safeStakeStorage.address);
          break;

        }
      }
    }
  };
  // Run it
  await deployContracts();

  // Register all other contracts with storage and store their abi
  const addContracts = async function() {
    // Log SafeStakeStorage
    console.log('\x1b[31m%s\x1b[0m:', '   Set Storage Address');
    console.log('     '+safeStakeStorage.address);
    // Add SafeStake Storage to deployed contracts
    contracts.safeStakeStorage = artifacts.require('SafeStakeStorage.sol');
    // Now process the rest
    for (let contract in contracts) {
      if(contracts.hasOwnProperty(contract)) {c++
        switch (contract) {
          default:
          // Log it
            console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ' + contract + ' Address');
            console.log('     ' + contracts[contract].address);
            // Register the contract address as part of the network
            await safeStakeStorageInstance.setBool(
              $web3.utils.soliditySha3('contract.exists', contracts[contract].address),
              true
            );
            // Register the contract's name by address
            await safeStakeStorageInstance.setString(
              $web3.utils.soliditySha3('contract.name', contracts[contract].address),
              contract
            );
            // Register the contract's address by name
            await safeStakeStorageInstance.setAddress(
              $web3.utils.soliditySha3('contract.address', contract),
              contracts[contract].address
            );
            // Compress and store the ABI by name
            await safeStakeStorageInstance.setString(
              $web3.utils.soliditySha3('contract.abi', contract),
              compressABI(contracts[contract].abi)
            );
            break;
        }
      }
    }
  };

  // Register ABI-only contracts
  const addABIs = async function() {
    for (let contract in abis) {
      if(abis.hasOwnProperty(contract)) {
        console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ABI');
        console.log('     '+contract);
        if(Array.isArray(abis[contract])) {
          // Merge ABIs from multiple artifacts
          let combinedAbi = [];
          for (const artifact of abis[contract]) {
            combinedAbi = combinedAbi.concat(artifact.abi);
          }
          // Compress and store the ABI
          await safeStakeStorageInstance.setString(
            $web3.utils.soliditySha3('contract.abi', contract),
            compressABI(combinedAbi)
          );
        } else {
          // Compress and store the ABI
          await safeStakeStorageInstance.setString(
            $web3.utils.soliditySha3('contract.abi', contract),
            compressABI(abis[contract].abi)
          );
        }
      }
    }
  };

  // Run it
  console.log('\x1b[34m%s\x1b[0m', '  Deploy Contracts');
  console.log('\x1b[34m%s\x1b[0m', '  ******************************************');
  await addContracts();
  console.log('\n');
  console.log('\x1b[34m%s\x1b[0m', '  Set ABI Only Storage');
  console.log('\x1b[34m%s\x1b[0m', '  ******************************************');
  await addABIs();

  // Store deployed block
  console.log('\n');
  console.log('Setting deploy.block to ' + deployBlock);
  await safeStakeStorageInstance.setUint(
    $web3.utils.soliditySha3('deploy.block'),
    deployBlock
  );

  // Disable direct access to storage now
  await safeStakeStorageInstance.setDeployedStatus();
  if(await safeStakeStorageInstance.getDeployedStatus() != true) throw 'Storage Access Not Locked Down!!';

  // Log it
  console.log('\n');
  console.log('\x1b[32m%s\x1b[0m', '  Storage Direct Access For Owner Removed... Lets begin! :)');
  console.log('\n');

  // Deploy development help contracts
  if (network !== 'live' && network !== 'goerli') {
    await deployer.deploy(revertOnTransfer);
  }
};