pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "../SafeStakeBase.sol";
import "../../interface/SafeStakeVaultInterface.sol";
import "../../interface/rewards/SafeStakeRewardsPoolInterface.sol";
import "../../interface/rewards/claims/SafeStakeClaimDAOInterface.sol";


// RPL Rewards claiming by the DAO
contract SafeStakeClaimDAO is SafeStakeBase, SafeStakeClaimDAOInterface {

    // Events
    event RPLTokensSentByDAOProtocol(string invoiceID, address indexed from, address indexed to, uint256 amount, uint256 time);

    // Construct
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) {
        // Version
        version = 2;
    }

    // Spend the network DAOs RPL rewards
    function spend(string memory _invoiceID, address _recipientAddress, uint256 _amount) override external onlyLatestContract("safeStakeDAOProtocolProposals", msg.sender) {
        // Load contracts
        SafeStakeVaultInterface safeStakeVault = SafeStakeVaultInterface(getContractAddress("safeStakeVault"));
        // Addresses
        IERC20 rplToken = IERC20(getContractAddress("safeStakeTokenRPL"));
        // Some initial checks
        require(_amount > 0 && _amount <= safeStakeVault.balanceOfToken("safeStakeClaimDAO", rplToken), "You cannot send 0 RPL or more than the DAO has in its account");
        // Send now
        safeStakeVault.withdrawToken(_recipientAddress, rplToken, _amount);
        // Log it
        emit RPLTokensSentByDAOProtocol(_invoiceID, address(this), _recipientAddress, _amount, block.timestamp);
    }
  

}
