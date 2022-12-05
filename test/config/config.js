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
  ]
}