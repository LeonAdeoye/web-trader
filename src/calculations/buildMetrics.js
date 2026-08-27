export const buildMetrics = (rfq, leg, greeks) => {
    const sign = leg.side === 'SELL' ? -1 : 1;

    const shares = leg.quantity * rfq.multiplier;
    const notionalShares = shares * rfq.underlyingPrice;
    const notionalInLocal = leg.quantity * rfq.multiplier * leg.strike;
    const notionalInUSD = notionalInLocal / rfq.notionalFXRate;

    return {
        spread: rfq.spread,
        delta: Number(greeks.delta) * sign,
        gamma: Number(greeks.gamma) * sign,
        theta: Number(greeks.theta) * sign,
        vega: Number(greeks.vega) * sign,
        rho: Number(greeks.rho) * sign,
        price: Number(greeks.price) * sign,
        shares,
        notionalShares,
        notionalInLocal,
        notionalInUSD
    };
};
