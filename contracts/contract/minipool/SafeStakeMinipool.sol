pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "./SafeStakeMinipoolStorageLayout.sol";
import "../../interface/SafeStakeStorageInterface.sol";
import "../../types/MinipoolDeposit.sol";
import "../../types/MinipoolStatus.sol";

// An individual minipool in the SafeStake Pool network

contract SafeStakeMinipool is SafeStakeMinipoolStorageLayout {

    // Events
    event EtherReceived(address indexed from, uint256 amount, uint256 time);
    event DelegateUpgraded(address oldDelegate, address newDelegate, uint256 time);
    event DelegateRolledBack(address oldDelegate, address newDelegate, uint256 time);

    // Modifiers

    // Only allow access from the owning node address
    modifier onlyMinipoolOwner() {
        // Only the node operator can upgrade
        address withdrawalAddress = safeStakeStorage.getNodeWithdrawalAddress(nodeAddress);
        require(msg.sender == nodeAddress || msg.sender == withdrawalAddress, "Only the node operator can access this method");
        _;
    }

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress, address _nodeAddress, MinipoolDeposit _depositType) {
        // Initialise SafeStakeStorage
        require(address(_safeStakeStorageAddress) != address(0x0), "Invalid storage address");
        safeStakeStorage = SafeStakeStorageInterface(_safeStakeStorageAddress);
        // Set storage state to uninitialised
        storageState = StorageState.Uninitialised;
        // Set the current delegate
        address delegateAddress = getContractAddress("safeStakeMinipoolDelegate");
        safeStakeMinipoolDelegate = delegateAddress;
        // Check for contract existence
        require(contractExists(delegateAddress), "Delegate contract does not exist");
        // Call initialise on delegate
        (bool success, bytes memory data) = delegateAddress.delegatecall(abi.encodeWithSignature('initialise(address,uint8)', _nodeAddress, uint8(_depositType)));
        if (!success) { revert(getRevertMessage(data)); }
    }

    // Receive an ETH deposit
    receive() external payable {
        // Emit ether received event
        emit EtherReceived(msg.sender, msg.value, block.timestamp);
    }

    // Upgrade this minipool to the latest network delegate contract
    function delegateUpgrade() external onlyMinipoolOwner {
        // Set previous address
        safeStakeMinipoolDelegatePrev = safeStakeMinipoolDelegate;
        // Set new delegate
        safeStakeMinipoolDelegate = getContractAddress("safeStakeMinipoolDelegate");
        // Verify
        require(safeStakeMinipoolDelegate != safeStakeMinipoolDelegatePrev, "New delegate is the same as the existing one");
        // Log event
        emit DelegateUpgraded(safeStakeMinipoolDelegatePrev, safeStakeMinipoolDelegate, block.timestamp);
    }

    // Rollback to previous delegate contract
    function delegateRollback() external onlyMinipoolOwner {
        // Make sure they have upgraded before
        require(safeStakeMinipoolDelegatePrev != address(0x0), "Previous delegate contract is not set");
        // Store original
        address originalDelegate = safeStakeMinipoolDelegate;
        // Update delegate to previous and zero out previous
        safeStakeMinipoolDelegate = safeStakeMinipoolDelegatePrev;
        safeStakeMinipoolDelegatePrev = address(0x0);
        // Log event
        emit DelegateRolledBack(originalDelegate, safeStakeMinipoolDelegate, block.timestamp);
    }

    // If set to true, will automatically use the latest delegate contract
    function setUseLatestDelegate(bool _setting) external onlyMinipoolOwner {
        useLatestDelegate = _setting;
    }

    // Getter for useLatestDelegate setting
    function getUseLatestDelegate() external view returns (bool) {
        return useLatestDelegate;
    }

    // Returns the address of the minipool's stored delegate
    function getDelegate() external view returns (address) {
        return safeStakeMinipoolDelegate;
    }

    // Returns the address of the minipool's previous delegate (or address(0) if not set)
    function getPreviousDelegate() external view returns (address) {
        return safeStakeMinipoolDelegatePrev;
    }

    // Returns the delegate which will be used when calling this minipool taking into account useLatestDelegate setting
    function getEffectiveDelegate() external view returns (address) {
        return useLatestDelegate ? getContractAddress("safeStakeMinipoolDelegate") : safeStakeMinipoolDelegate;
    }

    // Delegate all other calls to minipool delegate contract
    fallback(bytes calldata _input) external payable returns (bytes memory) {
        // If useLatestDelegate is set, use the latest delegate contract
        address delegateContract = useLatestDelegate ? getContractAddress("safeStakeMinipoolDelegate") : safeStakeMinipoolDelegate;
        // Check for contract existence
        require(contractExists(delegateContract), "Delegate contract does not exist");
        // Execute delegatecall
        (bool success, bytes memory data) = delegateContract.delegatecall(_input);
        if (!success) { revert(getRevertMessage(data)); }
        return data;
    }

    // Get the address of a SafeStake Pool network contract
    function getContractAddress(string memory _contractName) private view returns (address) {
        address contractAddress = safeStakeStorage.getAddress(keccak256(abi.encodePacked("contract.address", _contractName)));
        require(contractAddress != address(0x0), "Contract not found");
        return contractAddress;
    }

    // Get a revert message from delegatecall return data
    function getRevertMessage(bytes memory _returnData) private pure returns (string memory) {
        if (_returnData.length < 68) { return "Transaction reverted silently"; }
        assembly {
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string));
    }

    // Returns true if contract exists at _contractAddress (if called during that contract's construction it will return a false negative)
    function contractExists(address _contractAddress) private view returns (bool) {
        uint32 codeSize;
        assembly {
            codeSize := extcodesize(_contractAddress)
        }
        return codeSize > 0;
    }
}
