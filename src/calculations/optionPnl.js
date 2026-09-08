export const getPositionSign = (side) => side === 'SELL' ? -1 : 1;

export const getExpirationPayoff = (underlyingPrice, strike, isCall) =>
{
    if (isCall)
        return Math.max(underlyingPrice - strike, 0);

    return Math.max(strike - underlyingPrice, 0);
};

export const calculateExpirationPnl = ({ underlyingPrice, strike, isCall, side, entryPremium, quantity = 1 }) =>
{
    const payoff = getExpirationPayoff(underlyingPrice, strike, isCall);
    return (payoff - entryPremium) * getPositionSign(side) * quantity;
};

export const calculateMarkToMarketPnl = ({ modelPrice, side, entryPremium, quantity = 1 }) =>
    (modelPrice - entryPremium) * getPositionSign(side) * quantity;

export const attachPnlToRangeResults = (results, { entryPremium, strike, isCall, side, quantity = 1, includeExpiryPnl = false }) =>
{
    return results.map(item =>
    {
        const modelPrice = Number(item.price);
        const row =
        {
            rangeVariable: item.rangeVariable,
            delta: Number(item.delta),
            gamma: Number(item.gamma),
            rho: Number(item.rho),
            theta: Number(item.theta),
            vega: Number(item.vega),
            price: modelPrice,
            pnl: calculateMarkToMarketPnl({ modelPrice, side, entryPremium, quantity })
        };

        if (!includeExpiryPnl)
            return row;

        row.pnlExpiry = calculateExpirationPnl({
            underlyingPrice: item.rangeVariable,
            strike,
            isCall,
            side,
            entryPremium,
            quantity
        });

        return row;
    });
};

export const sumRangeChartRows = (rowsByLeg) =>
{
    if (!rowsByLeg.length)
        return [];

    const keys = ['delta', 'gamma', 'rho', 'theta', 'vega', 'price', 'pnl', 'pnlExpiry'];
    return rowsByLeg[0].map((row, index) =>
    {
        const summed = { ...row };
        for (let i = 1; i < rowsByLeg.length; i++)
        {
            const other = rowsByLeg[i][index];
            if (!other)
                continue;

            for (const key of keys)
            {
                if (other[key] == null)
                    continue;

                summed[key] = summed[key] == null ? other[key] : summed[key] + other[key];
            }
        }

        return summed;
    });
};

export const selectRangeChartRows = (rowsByLeg, activeTab) =>
{
    if (!rowsByLeg.length)
        return [];

    if (activeTab === 0)
        return sumRangeChartRows(rowsByLeg);

    return rowsByLeg[activeTab - 1] ?? [];
};
