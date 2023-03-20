pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "../../SafeStakeBase.sol";
import "../../../interface/SafeStakeVaultInterface.sol";
import "../../../interface/dao/protocol/SafeStakeDAOProtocolActionsInterface.sol";


import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// The SafeStake Pool Network DAO Actions - This is a placeholder for the network DAO to come
contract SafeStakeDAOProtocolActions is SafeStakeBase, SafeStakeDAOProtocolActionsInterface { 

    using SafeMath for uint;

    // The namespace for any data stored in the network DAO (do not change)
    string constant daoNameSpace = "dao.protocol.";


    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        // Version
        version = 1;
    }


    /*** Action Methods ************************/

   
}
