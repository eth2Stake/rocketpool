import { SafeStakeTokenRETH, SafeStakeTokenNETH, SafeStakeTokenDummyRPL, SafeStakeTokenRPL } from '../_utils/artifacts';


// Get the RPL balance of an address
export async function getRplBalance(address) {
    const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
    let balance = safeStakeTokenRPL.balanceOf.call(address);
    return balance;
}


// Get the rETH balance of an address
export async function getRethBalance(address) {
    const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
    let balance = safeStakeTokenRETH.balanceOf.call(address);
    return balance;
}


// Get the current rETH exchange rate
export async function getRethExchangeRate() {
    const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
    let exchangeRate = await safeStakeTokenRETH.getExchangeRate.call();
    return exchangeRate;
}


// Get the current rETH collateral rate
export async function getRethCollateralRate() {
    const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
    let collateralRate = await safeStakeTokenRETH.getCollateralRate.call();
    return collateralRate;
}


// Get the current rETH token supply
export async function getRethTotalSupply() {
    const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
    let totalSupply = await safeStakeTokenRETH.totalSupply.call();
    return totalSupply;
}


// Get the nETH balance of an address
export async function getNethBalance(address) {
    const safeStakeTokenNETH = await SafeStakeTokenNETH.deployed();
    let balance = safeStakeTokenNETH.balanceOf.call(address);
    return balance;
}


// Mint RPL to an address
export async function mintRPL(owner, toAddress, amount) {

    // Load contracts
    const [safeStakeTokenDummyRPL, safeStakeTokenRPL] = await Promise.all([
        SafeStakeTokenDummyRPL.deployed(),
        SafeStakeTokenRPL.deployed(),
    ]);

    // Mint dummy RPL to address
    await safeStakeTokenDummyRPL.mint(toAddress, amount, {from: owner});

    // Swap dummy RPL for RPL
    await safeStakeTokenDummyRPL.approve(safeStakeTokenRPL.address, amount, {from: toAddress});
    await safeStakeTokenRPL.swapTokens(amount, {from: toAddress});

}


// Approve RPL to be spend by an address
export async function approveRPL(spender, amount, txOptions) {
    const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
    await safeStakeTokenRPL.approve(spender, amount, txOptions);
}


export async function depositExcessCollateral(txOptions) {
    const safeStakeTokenRETH = await SafeStakeTokenRETH.deployed();
    await safeStakeTokenRETH.depositExcessCollateral(txOptions);
}
