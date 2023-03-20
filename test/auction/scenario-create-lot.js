import { SafeStakeAuctionManager, SafeStakeDAOProtocolSettingsAuction, SafeStakeNetworkPrices } from '../_utils/artifacts';


// Create a new lot for auction
export async function createLot(txOptions) {

    // Load contracts
    const [
        safeStakeAuctionManager,
        safeStakeAuctionSettings,
        safeStakeNetworkPrices,
    ] = await Promise.all([
        SafeStakeAuctionManager.deployed(),
        SafeStakeDAOProtocolSettingsAuction.deployed(),
        SafeStakeNetworkPrices.deployed(),
    ]);

    // Get parameters
    const [
        lotMaxEthValue,
        lotDuration,
        startPriceRatio,
        reservePriceRatio,
        rplPrice,
    ] = await Promise.all([
        safeStakeAuctionSettings.getLotMaximumEthValue.call(),
        safeStakeAuctionSettings.getLotDuration.call(),
        safeStakeAuctionSettings.getStartingPriceRatio.call(),
        safeStakeAuctionSettings.getReservePriceRatio.call(),
        safeStakeNetworkPrices.getRPLPrice.call(),
    ]);

    // Get auction contract details
    function getContractDetails() {
        return Promise.all([
            safeStakeAuctionManager.getTotalRPLBalance.call(),
            safeStakeAuctionManager.getAllottedRPLBalance.call(),
            safeStakeAuctionManager.getRemainingRPLBalance.call(),
            safeStakeAuctionManager.getLotCount.call(),
        ]).then(
            ([totalRplBalance, allottedRplBalance, remainingRplBalance, lotCount]) =>
            ({totalRplBalance, allottedRplBalance, remainingRplBalance, lotCount})
        );
    }

    // Get lot details
    function getLotDetails(lotIndex) {
        return Promise.all([
            safeStakeAuctionManager.getLotExists.call(lotIndex),
            safeStakeAuctionManager.getLotStartBlock.call(lotIndex),
            safeStakeAuctionManager.getLotEndBlock.call(lotIndex),
            safeStakeAuctionManager.getLotStartPrice.call(lotIndex),
            safeStakeAuctionManager.getLotReservePrice.call(lotIndex),
            safeStakeAuctionManager.getLotTotalRPLAmount.call(lotIndex),
            safeStakeAuctionManager.getLotCurrentPrice.call(lotIndex),
            safeStakeAuctionManager.getLotClaimedRPLAmount.call(lotIndex),
            safeStakeAuctionManager.getLotRemainingRPLAmount.call(lotIndex),
            safeStakeAuctionManager.getLotIsCleared.call(lotIndex),
        ]).then(
            ([exists, startBlock, endBlock, startPrice, reservePrice, totalRpl, currentPrice, claimedRpl, remainingRpl, isCleared]) =>
            ({exists, startBlock, endBlock, startPrice, reservePrice, totalRpl, currentPrice, claimedRpl, remainingRpl, isCleared})
        );
    }

    // Get initial contract details
    let details1 = await getContractDetails();

    // Create lot
    await safeStakeAuctionManager.createLot(txOptions);

    // Get updated contract details
    let [details2, lot] = await Promise.all([
        getContractDetails(),
        getLotDetails(details1.lotCount),
    ]);

    // Get expected values
    const calcBase = web3.utils.toBN(web3.utils.toWei('1', 'ether'));
    const lotMaxRplAmount = calcBase.mul(lotMaxEthValue).div(rplPrice);
    const expectedRemainingRplBalance = (details1.remainingRplBalance.gt(lotMaxRplAmount) ? details1.remainingRplBalance.sub(lotMaxRplAmount) : web3.utils.toBN(0));
    const expectedLotRplAmount = (details1.remainingRplBalance.lt(lotMaxRplAmount) ? details1.remainingRplBalance : lotMaxRplAmount);

    // Check contract details
    assert(details2.totalRplBalance.eq(details1.totalRplBalance), 'Total RPL balance updated and should not have');
    assert(details2.remainingRplBalance.eq(expectedRemainingRplBalance), 'Incorrect updated remaining RPL balance');
    assert(details2.totalRplBalance.eq(details2.allottedRplBalance.add(details2.remainingRplBalance)), 'Incorrect updated RPL balances');
    assert(details2.lotCount.eq(details1.lotCount.add(web3.utils.toBN(1))), 'Incorrect updated lot count');

    // Check lot details
    assert.isTrue(lot.exists, 'Incorrect lot exists status');
    assert(lot.endBlock.eq(lot.startBlock.add(lotDuration)), 'Incorrect lot start/end blocks');
    assert(lot.startPrice.eq(rplPrice.mul(startPriceRatio).div(calcBase)), 'Incorrect lot starting price');
    assert(lot.reservePrice.eq(rplPrice.mul(reservePriceRatio).div(calcBase)), 'Incorrect lot reserve price');
    assert(lot.totalRpl.eq(expectedLotRplAmount), 'Incorrect lot total RPL amount');
    assert(lot.currentPrice.eq(lot.startPrice), 'Incorrect lot current price');
    assert(lot.claimedRpl.eq(web3.utils.toBN(0)), 'Incorrect lot claimed RPL amount');
    assert(lot.remainingRpl.eq(lot.totalRpl), 'Incorrect lot remaining RPL amount');
    assert.isFalse(lot.isCleared, 'Incorrect lot cleared status');

}

