import { SafeStakeAuctionManager } from '../_utils/artifacts';


// Recover unclaimed RPL from a lot
export async function recoverUnclaimedRPL(lotIndex, txOptions) {

    // Load contracts
    const safeStakeAuctionManager = await SafeStakeAuctionManager.deployed();

    // Get auction contract details
    function getContractDetails() {
        return Promise.all([
            safeStakeAuctionManager.getAllottedRPLBalance.call(),
            safeStakeAuctionManager.getRemainingRPLBalance.call(),
        ]).then(
            ([allottedRplBalance, remainingRplBalance]) =>
            ({allottedRplBalance, remainingRplBalance})
        );
    }

    // Get lot details
    function getLotDetails() {
        return Promise.all([
            safeStakeAuctionManager.getLotRPLRecovered.call(lotIndex),
            safeStakeAuctionManager.getLotRemainingRPLAmount.call(lotIndex),
        ]).then(
            ([rplRecovered, remainingRplAmount]) =>
            ({rplRecovered, remainingRplAmount})
        );
    }

    // Get initial details
    let [details1, lot1] = await Promise.all([
        getContractDetails(),
        getLotDetails(),
    ]);

    // Recover RPL
    await safeStakeAuctionManager.recoverUnclaimedRPL(lotIndex, txOptions);

    // Get updated details
    let [details2, lot2] = await Promise.all([
        getContractDetails(),
        getLotDetails(),
    ]);

    // Check details
    assert(details2.allottedRplBalance.eq(details1.allottedRplBalance.sub(lot1.remainingRplAmount)), 'Incorrect updated contract allotted RPL balance');
    assert(details2.remainingRplBalance.eq(details1.remainingRplBalance.add(lot1.remainingRplAmount)), 'Incorrect updated contract remaining RPL balance');
    assert.isTrue(lot2.rplRecovered, 'Incorrect updated lot RPL recovered status');

}

