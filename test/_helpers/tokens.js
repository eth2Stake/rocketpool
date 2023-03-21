import { SafeStakeTokenSFETH, SafeStakeTokenNETH, SafeStakeTokenDummyRPL, SafeStakeTokenRPL } from '../_utils/artifacts';


// Get the RPL balance of an address
export async function getRplBalance(address) {
    const safeStakeTokenRPL = await SafeStakeTokenRPL.deployed();
    let balance = safeStakeTokenRPL.balanceOf.call(address);
    return balance;
}


// Get the rETH balance of an address
export async function getRethBalance(address) {
    const safeStakeTokenSFETH = await SafeStakeTokenSFETH.deployed();
    let balance = safeStakeTokenSFETH.balanceOf.call(address);
    return balance;
}


// Get the current rETH exchange rate
export async function getRethExchangeRate() {
    const safeStakeTokenSFETH = await SafeStakeTokenSFETH.deployed();
    let exchangeRate = await safeStakeTokenSFETH.getExchangeRate.call();
    return exchangeRate;
}


// Get the current rETH collateral rate
export async function getRethCollateralRate() {
    const safeStakeTokenSFETH = await SafeStakeTokenSFETH.deployed();
    let collateralRate = await safeStakeTokenSFETH.getCollateralRate.call();
    return collateralRate;
}


// Get the current rETH token supply
export async function getRethTotalSupply() {
    const safeStakeTokenSFETH = await SafeStakeTokenSFETH.deployed();
    let totalSupply = await safeStakeTokenSFETH.totalSupply.call();
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
    const safeStakeTokenSFETH = await SafeStakeTokenSFETH.deployed();
    await safeStakeTokenSFETH.depositExcessCollateral(txOptions);
}
