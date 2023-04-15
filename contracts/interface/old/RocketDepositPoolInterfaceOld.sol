pragma solidity >0.5.0 <0.9.0;

// SPDX-License-Identifier: GPL-3.0-only

interface RocketDepositPoolInterfaceOld {
    function getBalance() external view returns (uint256);
    function getExcessBalance() external view returns (uint256);
    function deposit() external payable;
    function recycleDissolvedDeposit() external payable;
    function recycleExcessCollateral() external payable;
    function assignDeposits() external;
    function withdrawExcessBalance(uint256 _amount) external;
}