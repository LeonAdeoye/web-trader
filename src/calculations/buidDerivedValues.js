export const buildDerivedValues = (rfq, leg, metrics) => {
    const { delta, gamma, theta, vega, rho, price, shares, notionalShares, notionalInUSD } = metrics;
    const { underlyingPrice, notionalFXRate, salesCreditPercentage } = rfq;

    return {
        deltaShares: delta * shares,
        deltaNotional: delta * notionalShares,
        deltaPercent: (delta * 100) / underlyingPrice,

        gammaShares: gamma * shares,
        gammaNotional: gamma * notionalShares,
        gammaPercent: (gamma * 100) / underlyingPrice,

        thetaShares: theta * shares,
        thetaNotional: theta * notionalShares,
        thetaPercent: (theta * 100) / underlyingPrice,

        vegaShares: vega * shares,
        vegaNotional: vega * notionalShares,
        vegaPercent: (vega * 100) / underlyingPrice,

        rhoShares: rho * shares,
        rhoNotional: rho * notionalShares,
        rhoPercent: (rho * 100) / underlyingPrice,

        premiumInUSD: price / notionalFXRate,
        premiumInLocal: price,
        premiumPercentage: (price * 100) / underlyingPrice,

        salesCreditAmount: (salesCreditPercentage * notionalInUSD) / 100
    };
};
