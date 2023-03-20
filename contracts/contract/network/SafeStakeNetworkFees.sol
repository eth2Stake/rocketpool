pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";

import "../SafeStakeBase.sol";
import "../../interface/deposit/SafeStakeDepositPoolInterface.sol";
import "../../interface/minipool/SafeStakeMinipoolQueueInterface.sol";
import "../../interface/network/SafeStakeNetworkFeesInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";

// Network node demand and commission rate

contract SafeStakeNetworkFees is SafeStakeBase, SafeStakeNetworkFeesInterface {

    // Libs
    using SafeMath for uint;
    using SafeCast for uint;

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        version = 1;
    }

    // Get the current RP network node demand in ETH
    // Node demand is equal to deposit pool balance minus available minipool capacity
    function getNodeDemand() override public view returns (int256) {
        // Load contracts
        SafeStakeDepositPoolInterface safeStakeDepositPool = SafeStakeDepositPoolInterface(getContractAddress("safeStakeDepositPool"));
        SafeStakeMinipoolQueueInterface safeStakeMinipoolQueue = SafeStakeMinipoolQueueInterface(getContractAddress("safeStakeMinipoolQueue"));
        // Calculate & return
        int256 depositPoolBalance = safeStakeDepositPool.getBalance().toInt256();
        int256 minipoolCapacity = safeStakeMinipoolQueue.getEffectiveCapacity().toInt256();
        int256 demand = depositPoolBalance - minipoolCapacity;
        require(demand <= depositPoolBalance);
        return demand;
    }

    // Get the current RP network node fee as a fraction of 1 ETH
    function getNodeFee() override external view returns (uint256) {
        return getNodeFeeByDemand(getNodeDemand());
    }

    // Get the RP network node fee for a node demand value
    function getNodeFeeByDemand(int256 _nodeDemand) override public view returns (uint256) {
        // Calculation base values
        uint256 demandDivisor = 1000000000000;
        // Get settings
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        uint256 minFee = safeStakeDAOProtocolSettingsNetwork.getMinimumNodeFee();
        uint256 targetFee = safeStakeDAOProtocolSettingsNetwork.getTargetNodeFee();
        uint256 maxFee = safeStakeDAOProtocolSettingsNetwork.getMaximumNodeFee();
        uint256 demandRange = safeStakeDAOProtocolSettingsNetwork.getNodeFeeDemandRange();
        // Normalize node demand
        uint256 nNodeDemand;
        bool nNodeDemandSign;
        if (_nodeDemand < 0) {
            nNodeDemand = uint256(-_nodeDemand);
            nNodeDemandSign = false;
        } else {
            nNodeDemand = uint256(_nodeDemand);
            nNodeDemandSign = true;
        }
        nNodeDemand = nNodeDemand.mul(calcBase).div(demandRange);
        // Check range bounds
        if (nNodeDemand == 0) { return targetFee; }
        if (nNodeDemand >= calcBase) {
            if (nNodeDemandSign) { return maxFee; }
            return minFee;
        }
        // Get fee interpolation factor
        uint256 t = nNodeDemand.div(demandDivisor) ** 3;
        // Interpolate between min / target / max fee
        if (nNodeDemandSign) { return targetFee.add(maxFee.sub(targetFee).mul(t).div(calcBase)); }
        return minFee.add(targetFee.sub(minFee).mul(calcBase.sub(t)).div(calcBase));
    }

}
