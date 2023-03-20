pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./SafeStakeNodeDistributorStorageLayout.sol";
import "../../interface/SafeStakeStorageInterface.sol";
import "../../interface/node/SafeStakeNodeManagerInterface.sol";
import "../../interface/node/SafeStakeNodeDistributorInterface.sol";

contract SafeStakeNodeDistributorDelegate is SafeStakeNodeDistributorStorageLayout, SafeStakeNodeDistributorInterface {
    // Import libraries
    using SafeMath for uint256;

    // Events
    event FeesDistributed(address _nodeAddress, uint256 _userAmount, uint256 _nodeAmount, uint256 _time);

    // Constants
    uint8 public constant version = 1;
    uint256 constant calcBase = 1 ether;

    // Precomputed constants
    bytes32 immutable safeStakeNodeManagerKey;
    bytes32 immutable safeStakeTokenRETHKey;

    constructor() {
        // Precompute storage keys
        safeStakeNodeManagerKey = keccak256(abi.encodePacked("contract.address", "safeStakeNodeManager"));
        safeStakeTokenRETHKey = keccak256(abi.encodePacked("contract.address", "safeStakeTokenRETH"));
        // These values must be set by proxy contract as this contract should only be delegatecalled
        safeStakeStorage = SafeStakeStorageInterface(address(0));
        nodeAddress = address(0);
    }

    function distribute() override external {
        // Get contracts
        SafeStakeNodeManagerInterface safeStakeNodeManager = SafeStakeNodeManagerInterface(safeStakeStorage.getAddress(safeStakeNodeManagerKey));
        address safeStakeTokenRETH = safeStakeStorage.getAddress(safeStakeTokenRETHKey);
        // Get withdrawal address and the node's average node fee
        address withdrawalAddress = safeStakeStorage.getNodeWithdrawalAddress(nodeAddress);
        uint256 averageNodeFee = safeStakeNodeManager.getAverageNodeFee(nodeAddress);
        // Calculate what portion of the balance is the node's
        uint256 halfBalance = address(this).balance.div(2);
        uint256 nodeShare = halfBalance.add(halfBalance.mul(averageNodeFee).div(calcBase));
        uint256 userShare = address(this).balance.sub(nodeShare);
        // Transfer user share
        payable(safeStakeTokenRETH).transfer(userShare);
        // Transfer node share
        (bool success,) = withdrawalAddress.call{value : address(this).balance}("");
        require(success);
        // Emit event
        emit FeesDistributed(nodeAddress, userShare, nodeShare, block.timestamp);
    }
}
