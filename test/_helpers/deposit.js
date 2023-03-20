import { SafeStakeDepositPool } from '../_utils/artifacts';


// Get the deposit pool excess ETH balance
export async function getDepositExcessBalance() {
	const safeStakeDepositPool = await SafeStakeDepositPool.deployed();
	let excessBalance = await safeStakeDepositPool.getExcessBalance.call();
	return excessBalance;
}


// Make a deposit
export async function userDeposit(txOptions) {
    const safeStakeDepositPool = await SafeStakeDepositPool.deployed();
    await safeStakeDepositPool.deposit(txOptions);
}


// Assign deposits
export async function assignDeposits(txOptions) {
    const safeStakeDepositPool = await SafeStakeDepositPool.deployed();
    await safeStakeDepositPool.assignDeposits(txOptions);
}

