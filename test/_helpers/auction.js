import { SafeStakeAuctionManager } from '../_utils/artifacts';


// Get lot start/end blocks
export async function getLotStartBlock(lotIndex) {
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();
    let startBlock = await safeStakeAuctionManager.getLotStartBlock.call(lotIndex);
    return startBlock;
}
export async function getLotEndBlock(lotIndex) {
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();
    let endBlock = await safeStakeAuctionManager.getLotEndBlock.call(lotIndex);
    return endBlock;
}


// Get lot price at a block
export async function getLotPriceAtBlock(lotIndex, block) {
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();
    let price = await safeStakeAuctionManager.getLotPriceAtBlock.call(lotIndex, block);
    return price;
}


// Create a new lot for auction
export async function auctionCreateLot(txOptions) {
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();
    await safeStakeAuctionManager.createLot(txOptions);
}


// Place a bid on a lot
export async function auctionPlaceBid(lotIndex, txOptions) {
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();
    await safeStakeAuctionManager.placeBid(lotIndex, txOptions);
}

