pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "../SafeStakeBase.sol";
import "./SafeStakeNodeDistributor.sol";
import "./SafeStakeNodeDistributorStorageLayout.sol";
import "../../interface/node/SafeStakeNodeDistributorFactoryInterface.sol";

contract SafeStakeNodeDistributorFactory is SafeStakeBase, SafeStakeNodeDistributorFactoryInterface {
    // Events
    event ProxyCreated(address _address);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 1;
    }

    function getProxyBytecode() override public pure returns (bytes memory) {
        return type(SafeStakeNodeDistributor).creationCode;
    }

    // Calculates the predetermined distributor contract address from given node address
    function getProxyAddress(address _nodeAddress) override external view returns(address) {
        bytes memory contractCode = getProxyBytecode();
        bytes memory initCode = abi.encodePacked(contractCode, abi.encode(_nodeAddress, safeStakeStorage));

        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), uint256(0), keccak256(initCode)));

        return address(uint160(uint(hash)));
    }

    // Uses CREATE2 to deploy a SafeStakeNodeDistributor at predetermined address
    function createProxy(address _nodeAddress) override external onlyLatestContract("safeStakeNodeManager", msg.sender) {
        // Salt is not required as the initCode is already unique per node address (node address is constructor argument)
        SafeStakeNodeDistributor dist = new SafeStakeNodeDistributor{salt: ''}(_nodeAddress, address(safeStakeStorage));
        emit ProxyCreated(address(dist));
    }
}
