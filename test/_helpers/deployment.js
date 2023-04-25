/*** Dependencies ********************/
const deploy_log = "deploy.log";
const readline = require("readline")


const hre = require('hardhat');
const pako = require('pako');
const fs = require('fs');
const Web3 = require('web3');


async function readLogFile() {
    return new Promise(async (r, j) => {
        try {
            const readInterface = readline.createInterface({
                input: fs.createReadStream(deploy_log),
                crlfDelay: Infinity
            });
            const deployed_contracts = {};
            for await (const line of readInterface) {
                const contract = JSON.parse(line);
                deployed_contracts[contract.name] = { ...deployed_contracts[contract.name], ...contract };
            }
            readInterface.close();
            r(deployed_contracts);
        } catch (e) {
            r({})
        }

    })

}


/*** Utility Methods *****************/


// Compress / decompress ABIs
function compressABI(abi) {
    return Buffer.from(pako.deflate(JSON.stringify(abi))).toString('base64');
}
function decompressABI(abi) {
    return JSON.parse(pako.inflate(Buffer.from(abi, 'base64'), { to: 'string' }));
}

// Load ABI files and parse
function loadABI(abiFilePath) {
    return JSON.parse(fs.readFileSync(abiFilePath));
}


/*** Contracts ***********************/


// Storage
const rocketStorage = artifacts.require('RocketStorage.sol');

// Network contracts
const contracts = {
    // Vault
    rocketVault: artifacts.require('RocketVault.sol'),
    // Tokens
    rocketTokenRETH: artifacts.require('RocketTokenRETH.sol'),
    // Deposit
    // Minipool
    rocketMinipoolStatus: artifacts.require('RocketMinipoolStatus.sol'),
    rocketMinipoolPenalty: artifacts.require('RocketMinipoolPenalty.sol'),
    // Network
    rocketNetworkPenalties: artifacts.require('RocketNetworkPenalties.sol'),
    // Node
    // DAOs
    rocketDAOProposal: artifacts.require('RocketDAOProposal.sol'),
    rocketDAONodeTrusted: artifacts.require('RocketDAONodeTrusted.sol'),
    rocketDAONodeTrustedProposals: artifacts.require('RocketDAONodeTrustedProposals.sol'),
    rocketDAONodeTrustedActions: artifacts.require('RocketDAONodeTrustedActions.sol'),
    rocketDAONodeTrustedUpgrade: artifacts.require('RocketDAONodeTrustedUpgrade.sol'),
    rocketDAONodeTrustedSettingsMembers: artifacts.require('RocketDAONodeTrustedSettingsMembers.sol'),
    rocketDAONodeTrustedSettingsProposals: artifacts.require('RocketDAONodeTrustedSettingsProposals.sol'),
    rocketDAOProtocol: artifacts.require('RocketDAOProtocol.sol'),
    rocketDAOProtocolProposals: artifacts.require('RocketDAOProtocolProposals.sol'),
    rocketDAOProtocolActions: artifacts.require('RocketDAOProtocolActions.sol'),
    rocketDAOProtocolSettingsNetwork: artifacts.require('RocketDAOProtocolSettingsNetwork.sol'),
    // v1.1
    rocketNodeDistributorFactory: artifacts.require('RocketNodeDistributorFactory.sol'),
    // v1.2
    rocketNodeDeposit: artifacts.require('RocketNodeDeposit.sol'),
    rocketMinipoolDelegate: artifacts.require('RocketMinipoolDelegate.sol'),
    rocketDAOProtocolSettingsMinipool: artifacts.require('RocketDAOProtocolSettingsMinipool.sol'),
    rocketMinipoolQueue: artifacts.require('RocketMinipoolQueue.sol'),
    rocketDepositPool: artifacts.require('RocketDepositPool.sol'),
    rocketDAOProtocolSettingsDeposit: artifacts.require('RocketDAOProtocolSettingsDeposit.sol'),
    rocketMinipoolManager: artifacts.require('RocketMinipoolManager.sol'),
    rocketNodeDistributorDelegate: artifacts.require('RocketNodeDistributorDelegate.sol'),
    rocketMinipoolFactory: artifacts.require('RocketMinipoolFactory.sol'),
    rocketNetworkFees: artifacts.require('RocketNetworkFees.sol'),
    rocketMinipoolBase: artifacts.require('RocketMinipoolBase.sol'),
    rocketDAONodeTrustedSettingsMinipool: artifacts.require('RocketDAONodeTrustedSettingsMinipool.sol'),
    rocketNodeManager: artifacts.require('RocketNodeManager.sol'),
    rocketDAOProtocolSettingsNode: artifacts.require('RocketDAOProtocolSettingsNode.sol'),
    rocketMinipoolBondReducer: artifacts.require('RocketMinipoolBondReducer.sol'),
    rocketNetworkBalances: artifacts.require('RocketNetworkBalances.sol'),
    // Utils
    addressQueueStorage: artifacts.require('AddressQueueStorage.sol'),
    addressSetStorage: artifacts.require('AddressSetStorage.sol'),
};

// Development helper contracts
const revertOnTransfer = artifacts.require('RevertOnTransfer.sol');
const rocketNodeDepositLEB4 = artifacts.require('RocketNodeDepositLEB4.sol');

// Instance contract ABIs
const abis = {
    // Minipool
    rocketMinipool: [artifacts.require('RocketMinipoolDelegateOld.sol'), artifacts.require('RocketMinipoolOld.sol')],
};

// Construct ABI for rocketMinipool
const rocketMinipoolAbi = []
    .concat(artifacts.require('RocketMinipoolDelegate.sol').abi)
    .concat(artifacts.require('RocketMinipoolBase.sol').abi)
    .filter(i => i.type !== 'fallback' && i.type !== 'receive');

rocketMinipoolAbi.push({ stateMutability: 'payable', type: 'fallback' });
rocketMinipoolAbi.push({ stateMutability: 'payable', type: 'receive' });

/*** Deployment **********************/


// Deploy Rocket Pool
export async function deployRocketPool() {

    let deployed_contracts = {};
    await readLogFile().then(res => {
        deployed_contracts = res;
    })
    // Compress / decompress ABIs
    const writeInterface = fs.createWriteStream(deploy_log, { flags: 'a' }); // 使用追加模式
    // Set our web3 provider
    const network = hre.network;
    let $web3 = new Web3(network.provider);

    // Accounts
    let accounts = await $web3.eth.getAccounts(function (error, result) {
        if (error != null) {
            console.log(error);
            console.log("Error retrieving accounts.'");
        }
        return result;
    });

    console.log(`Using network: ${network.name}`);
    console.log(`Deploying from: ${accounts[0]}`)
    console.log('\n');

    const casperDepositABI = loadABI('./contracts/contract/casper/compiled/Deposit.abi');

    // Live deployment
    if (network.name === 'live') {
        // Casper live contract address
        let casperDepositAddress = '0x00000000219ab540356cBB839Cbe05303d7705Fa';
        contracts.casperDeposit = {
            address: casperDepositAddress,
            abi: casperDepositABI,
            precompiled: true
        };
    }

    // Goerli test network
    else if (network.name === 'goerli') {
        // Casper deposit contract details
        const casperDepositAddress = '0xff50ed3d0ec03ac01d4c79aad74928bff48a7b2b';       // Prater
        contracts.casperDeposit = {
            address: casperDepositAddress,
            abi: casperDepositABI,
            precompiled: true
        };
    }

    // Test network deployment
    else {
        // Precompiled - Casper Deposit Contract
        const casperDeposit = new $web3.eth.Contract(casperDepositABI, null, {
            from: accounts[0],
            gasPrice: '20000000000' // 20 gwei
        });

        // Create the contract now
        const casperDepositContract = await casperDeposit.deploy(
            // Casper deployment
            {
                data: fs.readFileSync('./contracts/contract/casper/compiled/Deposit.bin').toString()
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

    // Deploy rocketStorage first - has to be done in this order so that the following contracts already know the storage address
    let rocketStorageInstance;
    let deployBlock;
    if (deployed_contracts.hasOwnProperty('rocketStorage')) {
        rocketStorageInstance = await rocketStorage.at(deployed_contracts["rocketStorage"].address);
        rocketStorage.setAsDeployed(rocketStorageInstance);
        deployBlock = deployed_contracts["rocketStorage"].blockNumber;
    } else {
        const rs = await rocketStorage.new();
        rocketStorage.setAsDeployed(rs);
        const rsTx = await $web3.eth.getTransactionReceipt(rs.transactionHash);
        deployBlock = rsTx.blockNumber;
        // Update the storage with the new addresses
        rocketStorageInstance = await rocketStorage.deployed();
        writeInterface.write(JSON.stringify({ name: "rocketStorage", address: rocketStorageInstance.address, blockNumber: deployBlock }) + '\n');
    }

    // Deploy other contracts - have to be inside an async loop
    const deployContracts = async function () {
        for (let contract in contracts) {
            // Only deploy if it hasn't been deployed already like a precompiled
            let instance
            if (!contracts[contract].hasOwnProperty('precompiled')) {
                if (deployed_contracts.hasOwnProperty(contract)) {
                    instance = await contracts[contract].at(deployed_contracts[contract].address);
                    contracts[contract].setAsDeployed(instance);
                    continue;
                }
                switch (contract) {
                    // Contracts with no constructor args
                    case 'rocketMinipoolDelegate':
                    case 'rocketNodeDistributorDelegate':
                    case 'rocketMinipoolBase':
                        instance = await contracts[contract].new();
                        contracts[contract].setAsDeployed(instance);
                        break;

                    // All other contracts - pass storage address
                    default:
                        instance = await contracts[contract].new(rocketStorageInstance.address);
                        contracts[contract].setAsDeployed(instance);
                        // Slight hack to allow gas optimisation using immutable addresses for non-upgradable contracts
                        if (contract === 'rocketVault' || contract === 'rocketTokenRETH') {
                            await rocketStorageInstance.setAddress(
                                $web3.utils.soliditySha3('contract.address', contract),
                                (await contracts[contract].deployed()).address
                            );
                        }
                        break;

                }
                console.log("deploy contract: " + contract);
                await new Promise(async (r) => {
                    writeInterface.write(JSON.stringify({ name: contract, address: (await contracts[contract].deployed()).address }) + '\n', () => {
                        r();
                    });
                })

            }
        }
    };
    // Run it
    await deployContracts();

    // Register all other contracts with storage and store their abi
    const addContracts = async function () {
        // Log RocketStorage
        console.log('\x1b[31m%s\x1b[0m:', '   Set Storage Address');
        console.log('     ' + (await rocketStorage.deployed()).address);
        // Add Rocket Storage to deployed contracts
        contracts.rocketStorage = artifacts.require('RocketStorage.sol');
        // Now process the rest
        for (let contract in contracts) {
            if (contracts.hasOwnProperty(contract)) {
                if (deployed_contracts.hasOwnProperty(contract) && deployed_contracts[contract].hasAdd === true) {
                    continue;
                }
                switch (contract) {
                    // Ignore contracts that will be upgraded later
                    case 'rocketMinipoolBase':
                        break;

                    default:
                        const address = contract === 'casperDeposit' ? contracts[contract].address : (await contracts[contract].deployed()).address;

                        // Log it
                        console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ' + contract + ' Address');
                        console.log('     ' + address);
                        // Register the contract address as part of the network
                        await rocketStorageInstance.setBool(
                            $web3.utils.soliditySha3('contract.exists', address),
                            true
                        );
                        // Register the contract's name by address
                        await rocketStorageInstance.setString(
                            $web3.utils.soliditySha3('contract.name', address),
                            contract
                        );
                        // Register the contract's address by name (rocketVault and rocketTokenRETH addresses already stored)
                        if (!(contract === 'rocketVault' || contract === 'rocketTokenRETH')) {
                            await rocketStorageInstance.setAddress(
                                $web3.utils.soliditySha3('contract.address', contract),
                                address
                            );
                        }
                        // Compress and store the ABI by name
                        await rocketStorageInstance.setString(
                            $web3.utils.soliditySha3('contract.abi', contract),
                            compressABI(contracts[contract].abi)
                        );
                        break;
                }
                await new Promise(async (r) => {
                    writeInterface.write(JSON.stringify({ name: contract, hasAdd: true }) + '\n', () => {
                        r();
                    });
                })

            }
        }
    };

    // Register ABI-only contracts
    const addABIs = async function () {
        for (let contract in abis) {
            if (abis.hasOwnProperty(contract)) {
                console.log('\x1b[31m%s\x1b[0m:', '   Set Storage ABI');
                console.log('     ' + contract);
                if (Array.isArray(abis[contract])) {
                    // Merge ABIs from multiple artifacts
                    let combinedAbi = [];
                    for (const artifact of abis[contract]) {
                        combinedAbi = combinedAbi.concat(artifact.abi);
                    }
                    // Compress and store the ABI
                    await rocketStorageInstance.setString(
                        $web3.utils.soliditySha3('contract.abi', contract),
                        compressABI(combinedAbi)
                    );
                } else {
                    // Compress and store the ABI
                    await rocketStorageInstance.setString(
                        $web3.utils.soliditySha3('contract.abi', contract),
                        compressABI(abis[contract].abi)
                    );
                }
            }
        }
    };

    const capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // Verify all contracts in etherscan
    const verifyContracts = async function () {
        for (let contract in contracts) {
            if (contracts.hasOwnProperty(contract)) {
                if (deployed_contracts.hasOwnProperty(contract) && deployed_contracts[contract].hasVerify === true) {
                    continue;
                }
                const address = contract === 'casperDeposit' ? contracts[contract].address : (await contracts[contract].deployed()).address;
                switch (contract) {
                    // Ignore contracts that will be upgraded later
                    case 'casperDeposit':
                        break;
                    case 'rocketMinipoolBase':
                    case 'rocketMinipoolDelegate':
                    case 'rocketNodeDistributorDelegate':
                        await hre.run("verify:verify", {
                            address: address,
                            constructorArguments: [],
                        })
                        break;

                    default:
                        console.log('\x1b[31m%s\x1b[0m:', '   Verify ' + contract + ' Contract');
                        console.log('     ' + address);
                        // Verify the contract
                        console.log((await artifacts.readArtifactSync(capitalizeFirstLetter(contract))).sourceName)
                        await hre.run("verify:verify", {
                            address: address,
                            contract:(await artifacts.readArtifactSync(capitalizeFirstLetter(contract))).sourceName + ":" + capitalizeFirstLetter(contract),
                            constructorArguments: contract === 'rocketStorage' ? [] : [rocketStorageInstance.address],
                        })

                        break;
                }
                await new Promise(async (r) => {
                    writeInterface.write(JSON.stringify({ name: contract, hasVerify: true }) + '\n', () => {
                        r();
                    });
                })
            }
        }
    };

    await verifyContracts();

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
    await rocketStorageInstance.setUint(
        $web3.utils.soliditySha3('deploy.block'),
        deployBlock
    );

    // Disable direct access to storage now
    await rocketStorageInstance.setDeployedStatus();
    if (await rocketStorageInstance.getDeployedStatus() !== true) throw 'Storage Access Not Locked Down!!';

    // Log it
    console.log('\n');
    console.log('\x1b[32m%s\x1b[0m', '  Storage Direct Access For Owner Removed... Lets begin! :)');
    console.log('\n');
    writeInterface.end();
    writeInterface.close();
};
