export const config = {
  CONTRACT_ADDRESS: "D833215cBcc3f914bD1C9ece3EE7BF8B14f841bb",
  ABI: [
    {
      "inputs": [],
      "name": "AccountAlreadyEnabled",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ApprovalNotWithinTimeframe",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BelowMinimumBlockPeriod",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BurnRatePositive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CallerNotInitializerOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CallerNotOperatorOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CallerNotValidatorOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExceedManagingOperatorsPerAccountLimit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FeeExceedsIncreaseLimit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FeeTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InitializerNotExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NegativeBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoEnoughParaStateDaoOperators",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoPendingFeeChangeRequest",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnoughBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OperatorWithPublicKeyNotExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ValidatorWithPublicKeyNotExist",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        }
      ],
      "name": "AccountDisable",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        }
      ],
      "name": "AccountEnable",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "senderAddress",
          "type": "address"
        }
      ],
      "name": "FundsDeposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        }
      ],
      "name": "FundsWithdrawal",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "validatorPublicKey",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "minipoolAddress",
          "type": "address"
        }
      ],
      "name": "InitializerMiniPoolCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        }
      ],
      "name": "InitializerMiniPoolReady",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint32[]",
          "name": "operatorIds",
          "type": "uint32[]"
        }
      ],
      "name": "InitializerRegistration",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "LiquidationThresholdPeriodUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "MinimumBlocksBeforeLiquidationUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "NetworkFeeUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "NetworkFeesWithdrawal",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "OperatorMaxFeeIncreaseUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint32",
          "name": "id",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        }
      ],
      "name": "OperatorRegistration",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "operatorId",
          "type": "uint32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        }
      ],
      "name": "OperatorRemoval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "operatorId",
          "type": "uint32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        }
      ],
      "name": "OperatorScoreUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "RegisteredOperatorsPerAccountLimitUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "uint32[]",
          "name": "operatorIds",
          "type": "uint32[]"
        },
        {
          "indexed": false,
          "internalType": "bytes[]",
          "name": "sharesPublicKeys",
          "type": "bytes[]"
        },
        {
          "indexed": false,
          "internalType": "bytes[]",
          "name": "encryptedKeys",
          "type": "bytes[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paidBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "ValidatorRegistration",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "ownerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        }
      ],
      "name": "ValidatorRemoval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "ValidatorsPerOperatorLimitUpdate",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ISafeStakeRegistry",
          "name": "registryAddress_",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "token_",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "minimumBlocksBeforeLiquidation_",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "operatorFee",
          "type": "uint64"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        }
      ],
      "name": "registerOperator",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "operatorId",
          "type": "uint32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "operatorId",
          "type": "uint32"
        }
      ],
      "name": "removeOperator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        },
        {
          "internalType": "uint32[]",
          "name": "operatorIds",
          "type": "uint32[]"
        },
        {
          "internalType": "bytes[]",
          "name": "sharesPublicKeys",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes[]",
          "name": "sharesEncrypted",
          "type": "bytes[]"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "registerValidator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32[]",
          "name": "operatorIds",
          "type": "uint32[]"
        }
      ],
      "name": "registerInitializer",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        },
        {
          "internalType": "bytes",
          "name": "validatorPublicKey",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "miniPoolAddress",
          "type": "address"
        }
      ],
      "name": "initializerPreStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        }
      ],
      "name": "initializerMiniPoolReady",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "initializerId",
          "type": "uint32"
        }
      ],
      "name": "initializerStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "publicKey",
          "type": "bytes"
        }
      ],
      "name": "removeValidator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "fee",
          "type": "uint256"
        }
      ],
      "name": "updateNetworkFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawNetworkEarnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "version",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "operatorId",
          "type": "uint32"
        }
      ],
      "name": "certifyOperatorFromDao",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  bytecode: "0x608060405234801561001057600080fd5b5061578080620000216000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80638da5cb5b11610097578063e40cb19d11610066578063e40cb19d1461026f578063f2fde38b1461028b578063f362dfd9146102a7578063ff131354146102c357610100565b80638da5cb5b146101fd5780639b4400dd1461021b578063b2f569c514610237578063d22317411461025357610100565b806364bf3eef116100d357806364bf3eef14610177578063715018a6146101935780637fa93ede1461019d57806385f79d61146101cd57610100565b80631f1f9fd5146101055780632e1d2f0514610121578063459e8b411461013d57806354fd4d5014610159575b600080fd5b61011f600480360381019061011a91906140d9565b6102df565b005b61013b60048036038101906101369190614142565b610400565b005b61015760048036038101906101529190614142565b610595565b005b6101616106a1565b60405161016e919061417e565b60405180910390f35b610191600480360381019061018c9190614142565b6106ab565b005b61019b61077b565b005b6101b760048036038101906101b291906141fe565b610803565b6040516101c4919061417e565b60405180910390f35b6101e760048036038101906101e291906142f7565b61092c565b6040516101f4919061417e565b60405180910390f35b610205610b38565b60405161021291906143b9565b60405180910390f35b61023560048036038101906102309190614490565b610b62565b005b610251600480360381019061024c91906144f7565b610bfe565b005b61026d600480360381019061026891906140d9565b610c79565b005b6102896004803603810190610284919061459a565b610e82565b005b6102a560048036038101906102a091906146c2565b610eb0565b005b6102c160048036038101906102bc9190614142565b610fa7565b005b6102dd60048036038101906102d891906146ef565b611040565b005b6102e761111f565b73ffffffffffffffffffffffffffffffffffffffff16610305610b38565b73ffffffffffffffffffffffffffffffffffffffff161461035b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610352906147c0565b60405180910390fd5b7fb12de2022a8c992455195d1cdfe49c528c96a325adc99e12b6eab59d56654ea26103a5606760009054906101000a900467ffffffffffffffff1667ffffffffffffffff16611127565b826040516103b49291906147ef565b60405180910390a16103c4611153565b6103cc61118c565b6103d5816111c5565b606760006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555050565b8061040a81611241565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663e7b21748846040518263ffffffff1660e01b8152600401610467919061417e565b602060405180830381865afa158015610484573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a8919061482d565b90506104b58360006113f1565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16632e1d2f05846040518263ffffffff1660e01b8152600401610510919061417e565b600060405180830381600087803b15801561052a57600080fd5b505af115801561053e573d6000803e3d6000fd5b505050508073ffffffffffffffffffffffffffffffffffffffff167f10b90e3d042178ee9b3e99a849224b4bf4145b9855274073c0c6bca9c5113b7b84604051610588919061417e565b60405180910390a2505050565b61059d61111f565b73ffffffffffffffffffffffffffffffffffffffff166105bb610b38565b73ffffffffffffffffffffffffffffffffffffffff1614610611576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610608906147c0565b60405180910390fd5b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663459e8b41826040518263ffffffff1660e01b815260040161066c919061417e565b600060405180830381600087803b15801561068657600080fd5b505af115801561069a573d6000803e3d6000fd5b5050505050565b6000614e20905090565b6106b4816114bb565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663e3b0715e826040518263ffffffff1660e01b815260040161070f919061417e565b600060405180830381600087803b15801561072957600080fd5b505af115801561073d573d6000803e3d6000fd5b505050507fa7a1f49e9189b6d804b1d64265af8d15d337dd88b38a8e4e06a31931b726f7f581604051610770919061417e565b60405180910390a150565b61078361111f565b73ffffffffffffffffffffffffffffffffffffffff166107a1610b38565b73ffffffffffffffffffffffffffffffffffffffff16146107f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107ee906147c0565b60405180910390fd5b610801600061162a565b565b600061080f83836116f0565b610845576040517fb7a5938000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630906cbc23385856040518463ffffffff1660e01b81526004016108a49392919061491d565b6020604051808303816000875af11580156108c3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108e79190614964565b90507f4f4c981e441ec7803ad8fd83e89f9b4cc199f7eebb543b8bda1b629260b510c08133858560405161091e9493929190614991565b60405180910390a192915050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631940d38786863387876040518663ffffffff1660e01b8152600401610991959493929190614a5c565b6020604051808303816000875af11580156109b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109d49190614964565b90506040518060a00160405280438152602001600067ffffffffffffffff168152602001600067ffffffffffffffff168152602001438152602001600063ffffffff16815250606c60008363ffffffff1663ffffffff1681526020019081526020016000206000820151816000015560208201518160010160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060408201518160010160086101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055506060820151816002015560808201518160030160006101000a81548163ffffffff021916908363ffffffff1602179055509050503373ffffffffffffffffffffffffffffffffffffffff168163ffffffff167fa837adf7db87879179d994c48f4275ae84c6ea7ba2ff625b1e121b5a6f42317d87878787604051610b289493929190614aa5565b60405180910390a3949350505050565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000610b6e6001611798565b90508015610b92576001600060016101000a81548160ff0219169083151502179055505b610b9e85858585611888565b8015610bf75760008060016101000a81548160ff0219169083151502179055507f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024986001604051610bee9190614b32565b60405180910390a15b5050505050565b8181610c0a828261192c565b610c12611153565b610c1b33611adf565b610c693385858080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050611bc3565b610c7233611d86565b5050505050565b610c8161111f565b73ffffffffffffffffffffffffffffffffffffffff16610c9f610b38565b73ffffffffffffffffffffffffffffffffffffffff1614610cf5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cec906147c0565b60405180910390fd5b610cfd611ec6565b67ffffffffffffffff16610d10826111c5565b67ffffffffffffffff161115610d52576040517fad3a8b9e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610d5b816111c5565b606b60008282829054906101000a900467ffffffffffffffff16610d7f9190614b7c565b92506101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b8152600401610e02929190614bb8565b6020604051808303816000875af1158015610e21573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e459190614c19565b507f5564de4b05294182a45c60836e9c0ba86d5c351cf1c0db79e4fe5dd04786de1a8133604051610e77929190614c46565b60405180910390a150565b610e8a611153565b610e9333611adf565b610ea5338a8a8a8a8a8a8a8a8a611ef6565b505050505050505050565b610eb861111f565b73ffffffffffffffffffffffffffffffffffffffff16610ed6610b38565b73ffffffffffffffffffffffffffffffffffffffff1614610f2c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f23906147c0565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610f9b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9290614ce1565b60405180910390fd5b610fa48161162a565b50565b610fb0816114bb565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663f362dfd9826040518263ffffffff1660e01b815260040161100b919061417e565b600060405180830381600087803b15801561102557600080fd5b505af1158015611039573d6000803e3d6000fd5b5050505050565b611049846114bb565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d85edef2858585856040518563ffffffff1660e01b81526004016110aa9493929190614d01565b600060405180830381600087803b1580156110c457600080fd5b505af11580156110d8573d6000803e3d6000fd5b505050507f6f65862ac449fcf43e1ddb6cf87fc8eaadc97be16c1a9328ea091c074baed7d0848484846040516111119493929190614d01565b60405180910390a150505050565b600033905090565b60006298968067ffffffffffffffff168267ffffffffffffffff1661114c9190614d41565b9050919050565b61115b6121df565b606960006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555043606a81905550565b6111946122f0565b606760086101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555043606881905550565b6000806298968067ffffffffffffffff16836111e19190614db2565b14611221576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161121890614e55565b60405180910390fd5b6298968067ffffffffffffffff168261123a9190614e75565b9050919050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663e7b21748836040518263ffffffff1660e01b815260040161129e919061417e565b602060405180830381865afa1580156112bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112df919061482d565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603611347576040517fd5528c8600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141580156113b65750611386610b38565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b156113ed576040517fec4de4c900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5050565b6113fa82612347565b43606c60008463ffffffff1663ffffffff1681526020019081526020016000206002018190555061142a8261239b565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166341d2c0cd826040518263ffffffff1660e01b81526004016114859190614eb5565b600060405180830381600087803b15801561149f57600080fd5b505af11580156114b3573d6000803e3d6000fd5b505050505050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16638c353138836040518263ffffffff1660e01b8152600401611518919061417e565b602060405180830381865afa158015611535573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611559919061482d565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036115c1576040517fa9d3e6de00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611626576040517f3c7d82c300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5050565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663faa6455284846040518363ffffffff1660e01b815260040161174f929190614ed0565b602060405180830381865afa15801561176c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117909190614c19565b905092915050565b60008060019054906101000a900460ff161561180f5760018260ff161480156117c757506117c5306123fe565b155b611806576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117fd90614f66565b60405180910390fd5b60009050611883565b8160ff1660008054906101000a900460ff1660ff1610611864576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161185b90614f66565b60405180910390fd5b816000806101000a81548160ff021916908360ff160217905550600190505b919050565b60006118946001611798565b905080156118b8576001600060016101000a81548160ff0219169083151502179055505b6118c0612421565b6118cc85858585612482565b80156119255760008060016101000a81548160ff0219169083151502179055507f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498600160405161191c9190614b32565b60405180910390a15b5050505050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663c87b303884846040518363ffffffff1660e01b815260040161198b929190614f86565b602060405180830381865afa1580156119a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119cc919061482d565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603611a34576040517f8791c3b400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614158015611aa35750611a73610b38565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b15611ada576040517f11ecf9f200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050565b611ae8816125ef565b606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160186101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550611b586122f0565b606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555050565b611bcd8282612725565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b2f569c5826040518263ffffffff1660e01b8152600401611c289190615018565b600060405180830381600087803b158015611c4257600080fd5b505af1158015611c56573d6000803e3d6000fd5b50505050606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600c9054906101000a900460ff16611d2b57606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600881819054906101000a900463ffffffff16611d0c9061503a565b91906101000a81548163ffffffff021916908363ffffffff1602179055505b611d34826128dd565b8173ffffffffffffffffffffffffffffffffffffffff167f671ada3835502b9498e4a3116c344293ec3a4ef43f90bb42283d7d66a3f772b282604051611d7a9190615018565b60405180910390a25050565b600080611d92836129be565b606d60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160009054906101000a900467ffffffffffffffff16611df39190614b7c565b90506000611e0084612ace565b606d60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160089054906101000a900467ffffffffffffffff16611e619190614b7c565b90508067ffffffffffffffff168267ffffffffffffffff161015611eb1576040517f5e13ed3100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8082611ebd9190615063565b92505050919050565b6000606b60009054906101000a900467ffffffffffffffff16611ee76121df565b611ef19190615063565b905090565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639b4ddb5d8b8b8b8b8b8b8b8b8b6040518a63ffffffff1660e01b8152600401611f6199989796959493929190615203565b600060405180830381600087803b158015611f7b57600080fd5b505af1158015611f8f573d6000803e3d6000fd5b505050506000606d60008c73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905043816002018190555080600101600c9054906101000a900460ff166120345780600101600881819054906101000a900463ffffffff166120159061527a565b91906101000a81548163ffffffff021916908363ffffffff1602179055505b60005b888890508163ffffffff16101561211257600089898363ffffffff16818110612063576120626152a6565b5b90506020020160208101906120789190614142565b90506120838161239b565b82600101600c9054906101000a900460ff166120f657606c60008263ffffffff1663ffffffff168152602001908152602001600020600301600081819054906101000a900463ffffffff166120d79061527a565b91906101000a81548163ffffffff021916908363ffffffff1602179055505b6121008d82612d1c565b508061210b9061527a565b9050612037565b506000821115612127576121263383612d2c565b5b6121308b612ecb565b15612167576040517fad3a8b9e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6121708b6128dd565b8a73ffffffffffffffffffffffffffffffffffffffff167f610eb3c1fafe229af536e91b7e00486902d54d54d8d3f0de283a467ac8f985bf8b8b8b8b8b8b8b8b8a600201546040516121ca999897969594939291906152d5565b60405180910390a25050505050505050505050565b600080606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16632340e8d36040518163ffffffff1660e01b8152600401602060405180830381865afa15801561224f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122739190614964565b63ffffffff16606760009054906101000a900467ffffffffffffffff1667ffffffffffffffff16606a54436122a8919061534c565b6122b29190614d41565b6122bc9190614d41565b606960009054906101000a900467ffffffffffffffff1667ffffffffffffffff166122e79190615380565b90508091505090565b6000606760009054906101000a900467ffffffffffffffff1660685443612317919061534c565b61232191906153b4565b606760089054906101000a900467ffffffffffffffff166123429190614b7c565b905090565b61235081612f36565b606c60008363ffffffff1663ffffffff16815260200190815260200160002060010160086101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555050565b6000606c60008363ffffffff1663ffffffff16815260200190815260200160002090506123c782613049565b8160010160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055504381600001819055505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600060019054906101000a900460ff16612470576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161246790615463565b60405180910390fd5b61248061247b61111f565b61162a565b565b600060019054906101000a900460ff166124d1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016124c890615463565b60405180910390fd5b83606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061255c826130d4565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663eb92db27826040518263ffffffff1660e01b81526004016125b79190614eb5565b600060405180830381600087803b1580156125d157600080fd5b505af11580156125e5573d6000803e3d6000fd5b5050505050505050565b6000606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160089054906101000a900463ffffffff1663ffffffff16606d60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900467ffffffffffffffff166126a96122f0565b6126b39190615063565b6126bd91906153b4565b606d60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160189054906101000a900467ffffffffffffffff1661271e9190614b7c565b9050919050565b6000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663053e8349836040518263ffffffff1660e01b81526004016127829190615018565b600060405180830381865afa15801561279f573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906127c891906155c1565b905060005b81518163ffffffff1610156128d7576000828263ffffffff16815181106127f7576127f66152a6565b5b6020026020010151905061280a8161239b565b606d60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600c9054906101000a900460ff166128bb57606c60008263ffffffff1663ffffffff168152602001908152602001600020600301600081819054906101000a900463ffffffff1661289c9061503a565b91906101000a81548163ffffffff021916908363ffffffff1602179055505b6128c5858261314d565b50806128d09061527a565b90506127cd565b50505050565b60006128e88261315d565b67ffffffffffffffff16036129435743606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600201819055506129bb565b61294c8161315d565b61295582611d86565b61295f919061560a565b67ffffffffffffffff16436129749190615380565b606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600201819055505b50565b600080600090506000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630dc1eeff856040518263ffffffff1660e01b8152600401612a2291906143b9565b600060405180830381865afa158015612a3f573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190612a6891906155c1565b905060005b81518163ffffffff161015612ac357612aa5828263ffffffff1681518110612a9857612a976152a6565b5b6020026020010151613049565b83612ab09190614b7c565b925080612abc9061527a565b9050612a6d565b508192505050919050565b600080612ada836125ef565b606d60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160109054906101000a900467ffffffffffffffff16612b3b9190614b7c565b905060005b606f60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490508163ffffffff161015612d12576000606e60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000606f60008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208463ffffffff1681548110612c2a57612c296152a6565b5b90600052602060002090600891828204019190066004029054906101000a900463ffffffff1663ffffffff1663ffffffff1681526020019081526020016000209050612cf38186606f60008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208563ffffffff1681548110612cc857612cc76152a6565b5b90600052602060002090600891828204019190066004029054906101000a900463ffffffff16613490565b83612cfe9190614b7c565b92505080612d0b9061527a565b9050612b40565b5080915050919050565b612d288282600161356b565b5050565b606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401612d8b9392919061563b565b6020604051808303816000875af1158015612daa573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612dce9190614c19565b50612dd8816111c5565b606d60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160008282829054906101000a900467ffffffffffffffff16612e3c9190614b7c565b92506101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fb91f78378ad1ce7b5c12301896eac25f50d4603d0301406595e6fdfa6ffd641983604051612ebf9190615672565b60405180910390a35050565b6000606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600c9054906101000a900460ff16158015612f2f5750612f2e82613dd9565b5b9050919050565b6000606c60008363ffffffff1663ffffffff1681526020019081526020016000206002015443612f66919061534c565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663286966086040518163ffffffff1660e01b8152600401602060405180830381865afa158015612fd3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612ff791906156a2565b61300191906153b4565b606c60008463ffffffff1663ffffffff16815260200190815260200160002060010160089054906101000a900467ffffffffffffffff166130429190614b7c565b9050919050565b600061305482613e2a565b606c60008463ffffffff1663ffffffff1681526020019081526020016000206000015443613082919061534c565b61308c91906153b4565b606c60008463ffffffff1663ffffffff16815260200190815260200160002060010160009054906101000a900467ffffffffffffffff166130cd9190614b7c565b9050919050565b80606660146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055507f0ba69538f9785fc112824ff736c1e58ccf880282e09e53d7eef96598e282d3fa606660149054906101000a900467ffffffffffffffff166040516131429190615700565b60405180910390a150565b6131598282600061356b565b5050565b6000606d60008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600c9054906101000a900460ff16156131bd576000905061348b565b60005b606f60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490508163ffffffff1610156132b45761329683606f60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208363ffffffff168154811061326b5761326a6152a6565b5b90600052602060002090600891828204019190066004029054906101000a900463ffffffff16613f07565b826132a19190614b7c565b9150806132ad9061527a565b90506131c0565b50606760009054906101000a900467ffffffffffffffff16606d60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160089054906101000a900463ffffffff1663ffffffff1661332f91906153b4565b8161333a9190614b7c565b90506000606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630dc1eeff846040518263ffffffff1660e01b815260040161339991906143b9565b600060405180830381865afa1580156133b6573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906133df91906155c1565b905060005b81518163ffffffff1610156134885761341c828263ffffffff168151811061340f5761340e6152a6565b5b6020026020010151613e2a565b67ffffffffffffffff168367ffffffffffffffff16116134415760009250505061348b565b61346a828263ffffffff168151811061345d5761345c6152a6565b5b6020026020010151613e2a565b836134759190615063565b9250806134819061527a565b90506133e4565b50505b919050565b6000606d60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600c9054906101000a900460ff1661353c578360000160109054906101000a900463ffffffff1663ffffffff168460000160009054906101000a900467ffffffffffffffff1661352384612f36565b61352d9190615063565b61353791906153b4565b61353f565b60005b8460000160089054906101000a900467ffffffffffffffff166135629190614b7c565b90509392505050565b6000606e60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008463ffffffff1663ffffffff16815260200190815260200160002090508060000160189054906101000a900460ff1615613b05576135ed818585614022565b81156136365780600001601081819054906101000a900463ffffffff166136139061527a565b91906101000a81548163ffffffff021916908363ffffffff160217905550613b00565b600081600001601081819054906101000a900463ffffffff166136589061503a565b91906101000a81548163ffffffff021916908363ffffffff160217905563ffffffff1603613aff578060000160089054906101000a900467ffffffffffffffff16606d60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160108282829054906101000a900467ffffffffffffffff166136fd9190614b7c565b92506101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550606f60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001606f60008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506137b1919061534c565b815481106137c2576137c16152a6565b5b90600052602060002090600891828204019190066004029054906101000a900463ffffffff16606f60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208260000160149054906101000a900463ffffffff1663ffffffff1681548110613853576138526152a6565b5b90600052602060002090600891828204019190066004026101000a81548163ffffffff021916908363ffffffff1602179055508060000160149054906101000a900463ffffffff16606e60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000606f60008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208460000160149054906101000a900463ffffffff1663ffffffff1681548110613947576139466152a6565b5b90600052602060002090600891828204019190066004029054906101000a900463ffffffff1663ffffffff1663ffffffff16815260200190815260200160002060000160146101000a81548163ffffffff021916908363ffffffff160217905550606f60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054806139f7576139f661571b565b5b60019003818190600052602060002090600891828204019190066004026101000a81549063ffffffff02191690559055606e60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008463ffffffff1663ffffffff168152602001908152602001600020600080820160006101000a81549067ffffffffffffffff02191690556000820160086101000a81549067ffffffffffffffff02191690556000820160106101000a81549063ffffffff02191690556000820160146101000a81549063ffffffff02191690556000820160186101000a81549060ff021916905550505b5b613dd3565b603261ffff16606f60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490501115613b86576040517f9722180300000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6040518060a00160405280613b9a85612f36565b67ffffffffffffffff168152602001600067ffffffffffffffff168152602001600163ffffffff168152602001606f60008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054905063ffffffff16815260200160011515815250606e60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008563ffffffff1663ffffffff16815260200190815260200160002060008201518160000160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060208201518160000160086101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060408201518160000160106101000a81548163ffffffff021916908363ffffffff16021790555060608201518160000160146101000a81548163ffffffff021916908363ffffffff16021790555060808201518160000160186101000a81548160ff021916908315150217905550905050606f60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208390806001815401808255809150506001900390600052602060002090600891828204019190066004029091909190916101000a81548163ffffffff021916908363ffffffff1602179055505b50505050565b6000613de48261315d565b606660149054906101000a900467ffffffffffffffff16613e0591906153b4565b67ffffffffffffffff16613e1883611d86565b67ffffffffffffffff16109050919050565b6000606c60008363ffffffff1663ffffffff16815260200190815260200160002060030160009054906101000a900463ffffffff1663ffffffff16606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663286966086040518163ffffffff1660e01b8152600401602060405180830381865afa158015613ed2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613ef691906156a2565b613f0091906153b4565b9050919050565b6000606e60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008363ffffffff1663ffffffff16815260200190815260200160002060000160109054906101000a900463ffffffff1663ffffffff16606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663286966086040518163ffffffff1660e01b8152600401602060405180830381865afa158015613fec573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061401091906156a2565b61401a91906153b4565b905092915050565b61402d838383613490565b8360000160086101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555061406081612f36565b8360000160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550505050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6140b6816140a3565b81146140c157600080fd5b50565b6000813590506140d3816140ad565b92915050565b6000602082840312156140ef576140ee614099565b5b60006140fd848285016140c4565b91505092915050565b600063ffffffff82169050919050565b61411f81614106565b811461412a57600080fd5b50565b60008135905061413c81614116565b92915050565b60006020828403121561415857614157614099565b5b60006141668482850161412d565b91505092915050565b61417881614106565b82525050565b6000602082019050614193600083018461416f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126141be576141bd614199565b5b8235905067ffffffffffffffff8111156141db576141da61419e565b5b6020830191508360208202830111156141f7576141f66141a3565b5b9250929050565b6000806020838503121561421557614214614099565b5b600083013567ffffffffffffffff8111156142335761423261409e565b5b61423f858286016141a8565b92509250509250929050565b60008083601f84011261426157614260614199565b5b8235905067ffffffffffffffff81111561427e5761427d61419e565b5b60208301915083600182028301111561429a576142996141a3565b5b9250929050565b60008083601f8401126142b7576142b6614199565b5b8235905067ffffffffffffffff8111156142d4576142d361419e565b5b6020830191508360018202830111156142f0576142ef6141a3565b5b9250929050565b6000806000806040858703121561431157614310614099565b5b600085013567ffffffffffffffff81111561432f5761432e61409e565b5b61433b8782880161424b565b9450945050602085013567ffffffffffffffff81111561435e5761435d61409e565b5b61436a878288016142a1565b925092505092959194509250565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006143a382614378565b9050919050565b6143b381614398565b82525050565b60006020820190506143ce60008301846143aa565b92915050565b60006143df82614398565b9050919050565b6143ef816143d4565b81146143fa57600080fd5b50565b60008135905061440c816143e6565b92915050565b600061441d82614398565b9050919050565b61442d81614412565b811461443857600080fd5b50565b60008135905061444a81614424565b92915050565b600067ffffffffffffffff82169050919050565b61446d81614450565b811461447857600080fd5b50565b60008135905061448a81614464565b92915050565b600080600080608085870312156144aa576144a9614099565b5b60006144b8878288016143fd565b94505060206144c98782880161443b565b93505060406144da8782880161447b565b92505060606144eb8782880161447b565b91505092959194509250565b6000806020838503121561450e5761450d614099565b5b600083013567ffffffffffffffff81111561452c5761452b61409e565b5b614538858286016142a1565b92509250509250929050565b60008083601f84011261455a57614559614199565b5b8235905067ffffffffffffffff8111156145775761457661419e565b5b602083019150836020820283011115614593576145926141a3565b5b9250929050565b600080600080600080600080600060a08a8c0312156145bc576145bb614099565b5b60008a013567ffffffffffffffff8111156145da576145d961409e565b5b6145e68c828d016142a1565b995099505060208a013567ffffffffffffffff8111156146095761460861409e565b5b6146158c828d016141a8565b975097505060408a013567ffffffffffffffff8111156146385761463761409e565b5b6146448c828d01614544565b955095505060608a013567ffffffffffffffff8111156146675761466661409e565b5b6146738c828d01614544565b935093505060806146868c828d016140c4565b9150509295985092959850929598565b61469f81614398565b81146146aa57600080fd5b50565b6000813590506146bc81614696565b92915050565b6000602082840312156146d8576146d7614099565b5b60006146e6848285016146ad565b91505092915050565b6000806000806060858703121561470957614708614099565b5b60006147178782880161412d565b945050602085013567ffffffffffffffff8111156147385761473761409e565b5b614744878288016142a1565b93509350506040614757878288016146ad565b91505092959194509250565b600082825260208201905092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b60006147aa602083614763565b91506147b582614774565b602082019050919050565b600060208201905081810360008301526147d98161479d565b9050919050565b6147e9816140a3565b82525050565b600060408201905061480460008301856147e0565b61481160208301846147e0565b9392505050565b60008151905061482781614696565b92915050565b60006020828403121561484357614842614099565b5b600061485184828501614818565b91505092915050565b600082825260208201905092915050565b6000819050919050565b61487e81614106565b82525050565b60006148908383614875565b60208301905092915050565b60006148ab602084018461412d565b905092915050565b6000602082019050919050565b60006148cc838561485a565b93506148d78261486b565b8060005b85811015614910576148ed828461489c565b6148f78882614884565b9750614902836148b3565b9250506001810190506148db565b5085925050509392505050565b600060408201905061493260008301866143aa565b81810360208301526149458184866148c0565b9050949350505050565b60008151905061495e81614116565b92915050565b60006020828403121561497a57614979614099565b5b60006149888482850161494f565b91505092915050565b60006060820190506149a6600083018761416f565b6149b360208301866143aa565b81810360408301526149c68184866148c0565b905095945050505050565b82818337600083830152505050565b6000601f19601f8301169050919050565b60006149fd8385614763565b9350614a0a8385846149d1565b614a13836149e0565b840190509392505050565b600082825260208201905092915050565b6000614a3b8385614a1e565b9350614a488385846149d1565b614a51836149e0565b840190509392505050565b60006060820190508181036000830152614a778187896149f1565b9050614a8660208301866143aa565b8181036040830152614a99818486614a2f565b90509695505050505050565b60006040820190508181036000830152614ac08186886149f1565b90508181036020830152614ad5818486614a2f565b905095945050505050565b6000819050919050565b600060ff82169050919050565b6000819050919050565b6000614b1c614b17614b1284614ae0565b614af7565b614aea565b9050919050565b614b2c81614b01565b82525050565b6000602082019050614b476000830184614b23565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000614b8782614450565b9150614b9283614450565b9250828201905067ffffffffffffffff811115614bb257614bb1614b4d565b5b92915050565b6000604082019050614bcd60008301856143aa565b614bda60208301846147e0565b9392505050565b60008115159050919050565b614bf681614be1565b8114614c0157600080fd5b50565b600081519050614c1381614bed565b92915050565b600060208284031215614c2f57614c2e614099565b5b6000614c3d84828501614c04565b91505092915050565b6000604082019050614c5b60008301856147e0565b614c6860208301846143aa565b9392505050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000614ccb602683614763565b9150614cd682614c6f565b604082019050919050565b60006020820190508181036000830152614cfa81614cbe565b9050919050565b6000606082019050614d16600083018761416f565b8181036020830152614d29818587614a2f565b9050614d3860408301846143aa565b95945050505050565b6000614d4c826140a3565b9150614d57836140a3565b9250828202614d65816140a3565b91508282048414831517614d7c57614d7b614b4d565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000614dbd826140a3565b9150614dc8836140a3565b925082614dd857614dd7614d83565b5b828206905092915050565b7f507265636973696f6e206973206f76657220746865206d6178696d756d20646560008201527f66696e6564000000000000000000000000000000000000000000000000000000602082015250565b6000614e3f602583614763565b9150614e4a82614de3565b604082019050919050565b60006020820190508181036000830152614e6e81614e32565b9050919050565b6000614e80826140a3565b9150614e8b836140a3565b925082614e9b57614e9a614d83565b5b828204905092915050565b614eaf81614450565b82525050565b6000602082019050614eca6000830184614ea6565b92915050565b60006020820190508181036000830152614eeb8184866148c0565b90509392505050565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b6000614f50602e83614763565b9150614f5b82614ef4565b604082019050919050565b60006020820190508181036000830152614f7f81614f43565b9050919050565b60006020820190508181036000830152614fa1818486614a2f565b90509392505050565b600081519050919050565b60005b83811015614fd3578082015181840152602081019050614fb8565b60008484015250505050565b6000614fea82614faa565b614ff48185614a1e565b9350615004818560208601614fb5565b61500d816149e0565b840191505092915050565b600060208201905081810360008301526150328184614fdf565b905092915050565b600061504582614106565b91506000820361505857615057614b4d565b5b600182039050919050565b600061506e82614450565b915061507983614450565b9250828203905067ffffffffffffffff81111561509957615098614b4d565b5b92915050565b600082825260208201905092915050565b6000819050919050565b600082825260208201905092915050565b60006150d783856150ba565b93506150e48385846149d1565b6150ed836149e0565b840190509392505050565b60006151058484846150cb565b90509392505050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261513a57615139615118565b5b83810192508235915060208301925067ffffffffffffffff8211156151625761516161510e565b5b60018202360383131561517857615177615113565b5b509250929050565b6000602082019050919050565b6000615199838561509f565b9350836020840285016151ab846150b0565b8060005b878110156151f15784840389526151c6828461511d565b6151d18682846150f8565b95506151dc84615180565b935060208b019a5050506001810190506151af565b50829750879450505050509392505050565b600060a082019050615218600083018c6143aa565b818103602083015261522b818a8c614a2f565b9050818103604083015261524081888a6148c0565b9050818103606083015261525581868861518d565b9050818103608083015261526a81848661518d565b90509a9950505050505050505050565b600061528582614106565b915063ffffffff820361529b5761529a614b4d565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600060a08201905081810360008301526152f0818b8d614a2f565b9050818103602083015261530581898b6148c0565b9050818103604083015261531a81878961518d565b9050818103606083015261532f81858761518d565b905061533e60808301846147e0565b9a9950505050505050505050565b6000615357826140a3565b9150615362836140a3565b925082820390508181111561537a57615379614b4d565b5b92915050565b600061538b826140a3565b9150615396836140a3565b92508282019050808211156153ae576153ad614b4d565b5b92915050565b60006153bf82614450565b91506153ca83614450565b92508282026153d881614450565b91508082146153ea576153e9614b4d565b5b5092915050565b7f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960008201527f6e697469616c697a696e67000000000000000000000000000000000000000000602082015250565b600061544d602b83614763565b9150615458826153f1565b604082019050919050565b6000602082019050818103600083015261547c81615440565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6154bb826149e0565b810181811067ffffffffffffffff821117156154da576154d9615483565b5b80604052505050565b60006154ed61408f565b90506154f982826154b2565b919050565b600067ffffffffffffffff82111561551957615518615483565b5b602082029050602081019050919050565b600061553d615538846154fe565b6154e3565b905080838252602082019050602084028301858111156155605761555f6141a3565b5b835b818110156155895780615575888261494f565b845260208401935050602081019050615562565b5050509392505050565b600082601f8301126155a8576155a7614199565b5b81516155b884826020860161552a565b91505092915050565b6000602082840312156155d7576155d6614099565b5b600082015167ffffffffffffffff8111156155f5576155f461409e565b5b61560184828501615593565b91505092915050565b600061561582614450565b915061562083614450565b9250826156305761562f614d83565b5b828204905092915050565b600060608201905061565060008301866143aa565b61565d60208301856143aa565b61566a60408301846147e0565b949350505050565b600060208201905061568760008301846147e0565b92915050565b60008151905061569c81614464565b92915050565b6000602082840312156156b8576156b7614099565b5b60006156c68482850161568d565b91505092915050565b60006156ea6156e56156e084614450565b614af7565b6140a3565b9050919050565b6156fa816156cf565b82525050565b600060208201905061571560008301846156f1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fdfea26469706673582212203e66b1e4b0fa7eb35c1baefbd28e4ea1cd1ee8ca340437aedb0bead79caa69e964736f6c63430008110033"
}