pragma solidity 0.7.6;

// SPDX-License-Identifier: GPL-3.0-only

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../SafeStakeBase.sol";
import "../../interface/deposit/SafeStakeDepositPoolInterface.sol";
import "../../interface/network/SafeStakeNetworkBalancesInterface.sol";
import "../../interface/token/SafeStakeTokenSFETHInterface.sol";
import "../../interface/dao/protocol/settings/SafeStakeDAOProtocolSettingsNetworkInterface.sol";

// sfETH is a tokenised stake in the SafeStake Pool network
// sfETH is backed by ETH (subject to liquidity) at a variable exchange rate

contract SafeStakeTokenSFETH is SafeStakeBase, ERC20, SafeStakeTokenSFETHInterface {

    // Libs
    using SafeMath for uint;

    // Events
    event EtherDeposited(address indexed from, uint256 amount, uint256 time);
    event TokensMinted(address indexed to, uint256 amount, uint256 ethAmount, uint256 time);
    event TokensBurned(address indexed from, uint256 amount, uint256 ethAmount, uint256 time);

    // Construct with our token details
    constructor(SafeStakeStorageInterface _safeStakeStorageAddress) SafeStakeBase(_safeStakeStorageAddress) ERC20("SafeStake Pool ETH", "sfETH") {
        // Version
        version = 1;
    }

    // Receive an ETH deposit from a minipool or generous individual
    receive() external payable {
        // Emit ether deposited event
        emit EtherDeposited(msg.sender, msg.value, block.timestamp);
    }

    // Calculate the amount of ETH backing an amount of sfETH
    function getEthValue(uint256 _sfethAmount) override public view returns (uint256) {
        // Get network balances
        SafeStakeNetworkBalancesInterface safeStakeNetworkBalances = SafeStakeNetworkBalancesInterface(getContractAddress("safeStakeNetworkBalances"));
        uint256 totalEthBalance = safeStakeNetworkBalances.getTotalETHBalance();
        uint256 sfethSupply = safeStakeNetworkBalances.getTotalSFETHSupply();
        // Use 1:1 ratio if no sfETH is minted
        if (sfethSupply == 0) { return _sfethAmount; }
        // Calculate and return
        return _sfethAmount.mul(totalEthBalance).div(sfethSupply);
    }

    // Calculate the amount of sfETH backed by an amount of ETH
    function getSfethValue(uint256 _ethAmount) override public view returns (uint256) {
        // Get network balances
        SafeStakeNetworkBalancesInterface safeStakeNetworkBalances = SafeStakeNetworkBalancesInterface(getContractAddress("safeStakeNetworkBalances"));
        uint256 totalEthBalance = safeStakeNetworkBalances.getTotalETHBalance();
        uint256 sfethSupply = safeStakeNetworkBalances.getTotalSFETHSupply();
        // Use 1:1 ratio if no sfETH is minted
        if (sfethSupply == 0) { return _ethAmount; }
        // Check network ETH balance
        require(totalEthBalance > 0, "Cannot calculate sfETH token amount while total network balance is zero");
        // Calculate and return
        return _ethAmount.mul(sfethSupply).div(totalEthBalance);
    }

    // Get the current ETH : sfETH exchange rate
    // Returns the amount of ETH backing 1 sfETH
    function getExchangeRate() override external view returns (uint256) {
        return getEthValue(1 ether);
    }

    // Get the total amount of collateral available
    // Includes sfETH contract balance & excess deposit pool balance
    function getTotalCollateral() override public view returns (uint256) {
        SafeStakeDepositPoolInterface safeStakeDepositPool = SafeStakeDepositPoolInterface(getContractAddress("safeStakeDepositPool"));
        return safeStakeDepositPool.getExcessBalance().add(address(this).balance);
    }

    // Get the current ETH collateral rate
    // Returns the portion of sfETH backed by ETH in the contract as a fraction of 1 ether
    function getCollateralRate() override public view returns (uint256) {
        uint256 totalEthValue = getEthValue(totalSupply());
        if (totalEthValue == 0) { return calcBase; }
        return calcBase.mul(address(this).balance).div(totalEthValue);
    }

    // Deposit excess ETH from deposit pool
    // Only accepts calls from the SafeStakeDepositPool contract
    function depositExcess() override external payable onlyLatestContract("safeStakeDepositPool", msg.sender) {
        // Emit ether deposited event
        emit EtherDeposited(msg.sender, msg.value, block.timestamp);
    }

    // Mint sfETH
    // Only accepts calls from the SafeStakeDepositPool contract
    function mint(uint256 _ethAmount, address _to) override external onlyLatestContract("safeStakeDepositPool", msg.sender) {
        // Get sfETH amount
        uint256 sfethAmount = getSfethValue(_ethAmount);
        // Check sfETH amount
        require(sfethAmount > 0, "Invalid token mint amount");
        // Update balance & supply
        _mint(_to, sfethAmount);
        // Emit tokens minted event
        emit TokensMinted(_to, sfethAmount, _ethAmount, block.timestamp);
    }

    // Burn sfETH for ETH
    function burn(uint256 _sfethAmount) override external {
        // Check sfETH amount
        require(_sfethAmount > 0, "Invalid token burn amount");
        require(balanceOf(msg.sender) >= _sfethAmount, "Insufficient sfETH balance");
        // Get ETH amount
        uint256 ethAmount = getEthValue(_sfethAmount);
        // Get & check ETH balance
        uint256 ethBalance = getTotalCollateral();
        require(ethBalance >= ethAmount, "Insufficient ETH balance for exchange");
        // Update balance & supply
        _burn(msg.sender, _sfethAmount);
        // Withdraw ETH from deposit pool if required
        withdrawDepositCollateral(ethAmount);
        // Transfer ETH to sender
        msg.sender.transfer(ethAmount);
        // Emit tokens burned event
        emit TokensBurned(msg.sender, _sfethAmount, ethAmount, block.timestamp);
    }

    // Withdraw ETH from the deposit pool for collateral if required
    function withdrawDepositCollateral(uint256 _ethRequired) private {
        // Check sfETH contract balance
        uint256 ethBalance = address(this).balance;
        if (ethBalance >= _ethRequired) { return; }
        // Withdraw
        SafeStakeDepositPoolInterface safeStakeDepositPool = SafeStakeDepositPoolInterface(getContractAddress("safeStakeDepositPool"));
        safeStakeDepositPool.withdrawExcessBalance(_ethRequired.sub(ethBalance));
    }

    // Sends any excess ETH from this contract to the deposit pool (as determined by target collateral rate)
    function depositExcessCollateral() external override {
        // Load contracts
        SafeStakeDAOProtocolSettingsNetworkInterface safeStakeDAOProtocolSettingsNetwork = SafeStakeDAOProtocolSettingsNetworkInterface(getContractAddress("safeStakeDAOProtocolSettingsNetwork"));
        SafeStakeDepositPoolInterface safeStakeDepositPool = SafeStakeDepositPoolInterface(getContractAddress("safeStakeDepositPool"));
        // Get collateral and target collateral rate
        uint256 collateralRate = getCollateralRate();
        uint256 targetCollateralRate = safeStakeDAOProtocolSettingsNetwork.getTargetSfethCollateralRate();
        // Check if we are in excess
        if (collateralRate > targetCollateralRate) {
            // Calculate our target collateral in ETH
            uint256 targetCollateral = address(this).balance.mul(targetCollateralRate).div(collateralRate);
            // If we have excess
            if (address(this).balance > targetCollateral) {
                // Send that excess to deposit pool
                uint256 excessCollateral = address(this).balance.sub(targetCollateral);
                safeStakeDepositPool.recycleExcessCollateral{value: excessCollateral}();
            }
        }
    }

    // This is called by the base ERC20 contract before all transfer, mint, and burns
    function _beforeTokenTransfer(address from, address, uint256) internal override {
        // Don't run check if this is a mint transaction
        if (from != address(0)) {
            // Check which block the user's last deposit was
            bytes32 key = keccak256(abi.encodePacked("user.deposit.block", from));
            uint256 lastDepositBlock = getUint(key);
            if (lastDepositBlock > 0) {
                // Ensure enough blocks have passed
                uint256 depositDelay = getUint(keccak256(abi.encodePacked(keccak256("dao.protocol.setting.network"), "network.sfeth.deposit.delay")));
                uint256 blocksPassed = block.number.sub(lastDepositBlock);
                require(blocksPassed > depositDelay, "Not enough time has passed since deposit");
                // Clear the state as it's no longer necessary to check this until another deposit is made
                deleteUint(key);
            }
        }
    }
}
