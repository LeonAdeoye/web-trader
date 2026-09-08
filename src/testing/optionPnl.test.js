import {
    attachPnlToRangeResults,
    calculateExpirationPnl,
    calculateMarkToMarketPnl,
    getExpirationPayoff,
    selectRangeChartRows,
    sumRangeChartRows
} from '../calculations/optionPnl';

describe('getExpirationPayoff', () =>
{
    it('is zero for an OTM call and rises one-for-one above strike', () =>
    {
        expect(getExpirationPayoff(90, 100, true)).toBe(0);
        expect(getExpirationPayoff(100, 100, true)).toBe(0);
        expect(getExpirationPayoff(110, 100, true)).toBe(10);
    });

    it('is zero for an OTM put and rises one-for-one below strike', () =>
    {
        expect(getExpirationPayoff(110, 100, false)).toBe(0);
        expect(getExpirationPayoff(100, 100, false)).toBe(0);
        expect(getExpirationPayoff(90, 100, false)).toBe(10);
    });
});

describe('calculateExpirationPnl', () =>
{
    it('draws a long-call hockey stick: max loss is the premium, profit above strike plus premium', () =>
    {
        const premium = 5;
        expect(calculateExpirationPnl({ underlyingPrice: 90, strike: 100, isCall: true, side: 'BUY', entryPremium: premium })).toBe(-5);
        expect(calculateExpirationPnl({ underlyingPrice: 100, strike: 100, isCall: true, side: 'BUY', entryPremium: premium })).toBe(-5);
        expect(calculateExpirationPnl({ underlyingPrice: 105, strike: 100, isCall: true, side: 'BUY', entryPremium: premium })).toBe(0);
        expect(calculateExpirationPnl({ underlyingPrice: 110, strike: 100, isCall: true, side: 'BUY', entryPremium: premium })).toBe(5);
    });

    it('mirrors a long call for a short call', () =>
    {
        const premium = 5;
        expect(calculateExpirationPnl({ underlyingPrice: 90, strike: 100, isCall: true, side: 'SELL', entryPremium: premium })).toBe(5);
        expect(calculateExpirationPnl({ underlyingPrice: 110, strike: 100, isCall: true, side: 'SELL', entryPremium: premium })).toBe(-5);
    });

    it('draws a long-put hockey stick', () =>
    {
        const premium = 5;
        expect(calculateExpirationPnl({ underlyingPrice: 90, strike: 100, isCall: false, side: 'BUY', entryPremium: premium })).toBe(5);
        expect(calculateExpirationPnl({ underlyingPrice: 100, strike: 100, isCall: false, side: 'BUY', entryPremium: premium })).toBe(-5);
        expect(calculateExpirationPnl({ underlyingPrice: 110, strike: 100, isCall: false, side: 'BUY', entryPremium: premium })).toBe(-5);
    });

    it('mirrors a long put for a short put', () =>
    {
        const premium = 5;
        expect(calculateExpirationPnl({ underlyingPrice: 90, strike: 100, isCall: false, side: 'SELL', entryPremium: premium })).toBe(-5);
        expect(calculateExpirationPnl({ underlyingPrice: 110, strike: 100, isCall: false, side: 'SELL', entryPremium: premium })).toBe(5);
    });

    it('scales by quantity', () =>
    {
        expect(calculateExpirationPnl({
            underlyingPrice: 110, strike: 100, isCall: true, side: 'BUY', entryPremium: 5, quantity: 2
        })).toBe(10);
    });
});

describe('calculateMarkToMarketPnl', () =>
{
    it('is model price minus premium paid for a long, and the reverse for a short', () =>
    {
        expect(calculateMarkToMarketPnl({ modelPrice: 8, side: 'BUY', entryPremium: 5 })).toBe(3);
        expect(calculateMarkToMarketPnl({ modelPrice: 8, side: 'SELL', entryPremium: 5 })).toBe(-3);
    });
});

describe('attachPnlToRangeResults', () =>
{
    const results = [
        { rangeVariable: 90, delta: 0.2, gamma: 0.01, rho: 0.1, theta: -0.02, vega: 0.3, price: 1.5 },
        { rangeVariable: 110, delta: 0.8, gamma: 0.01, rho: 0.2, theta: -0.03, vega: 0.25, price: 12 }
    ];

    it('adds live P&L from the pricing-service premium and expiry P&L from intrinsic payoff', () =>
    {
        const rows = attachPnlToRangeResults(results, {
            entryPremium: 5,
            strike: 100,
            isCall: true,
            side: 'BUY',
            includeExpiryPnl: true
        });

        expect(rows[0].pnl).toBe(-3.5);
        expect(rows[0].pnlExpiry).toBe(-5);
        expect(rows[1].pnl).toBe(7);
        expect(rows[1].pnlExpiry).toBe(5);
    });

    it('keeps a finite hockey-stick value at strike so the line stays continuous', () =>
    {
        const results = [99, 100, 101].map(spot => ({
            rangeVariable: spot, delta: 0, gamma: 0, rho: 0, theta: 0, vega: 0, price: 1
        }));
        const rows = attachPnlToRangeResults(results, {
            entryPremium: 5,
            strike: 100,
            isCall: true,
            side: 'BUY',
            includeExpiryPnl: true
        });

        expect(rows.map(row => row.pnlExpiry)).toEqual([-5, -5, -4]);
        rows.forEach(row => expect(Number.isFinite(row.pnlExpiry)).toBe(true));
    });
});

describe('sumRangeChartRows', () =>
{
    it('sums P&L across legs at the same spot', () =>
    {
        const longCall = attachPnlToRangeResults(
            [{ rangeVariable: 110, delta: 0.8, gamma: 0.01, rho: 0, theta: 0, vega: 0, price: 12 }],
            { entryPremium: 5, strike: 100, isCall: true, side: 'BUY', includeExpiryPnl: true }
        );
        const shortCall = attachPnlToRangeResults(
            [{ rangeVariable: 110, delta: 0.6, gamma: 0.01, rho: 0, theta: 0, vega: 0, price: 4 }],
            { entryPremium: 2, strike: 120, isCall: true, side: 'SELL', includeExpiryPnl: true }
        );

        const summed = sumRangeChartRows([longCall, shortCall]);
        expect(summed[0].pnl).toBe(5);
        expect(summed[0].pnlExpiry).toBe(7);
        expect(summed[0].price).toBe(16);
    });
});

describe('selectRangeChartRows', () =>
{
    const callRows = attachPnlToRangeResults(
        [
            { rangeVariable: 90, delta: 0.2, gamma: 0.01, rho: 0.1, theta: -0.02, vega: 0.3, price: 1.5 },
            { rangeVariable: 110, delta: 0.8, gamma: 0.01, rho: 0.2, theta: -0.03, vega: 0.25, price: 12 }
        ],
        { entryPremium: 5, strike: 100, isCall: true, side: 'BUY', includeExpiryPnl: true }
    );
    const putRows = attachPnlToRangeResults(
        [
            { rangeVariable: 90, delta: -0.8, gamma: 0.01, rho: -0.2, theta: -0.02, vega: 0.3, price: 11 },
            { rangeVariable: 110, delta: -0.2, gamma: 0.01, rho: -0.1, theta: -0.03, vega: 0.25, price: 1.5 }
        ],
        { entryPremium: 5, strike: 100, isCall: false, side: 'BUY', includeExpiryPnl: true }
    );
    const rowsByLeg = [callRows, putRows];

    it('returns the summed straddle series for the All Legs tab', () =>
    {
        const allLegs = selectRangeChartRows(rowsByLeg, 0);

        expect(allLegs[0].delta).toBeCloseTo(-0.6);
        expect(allLegs[0].pnlExpiry).toBe(0);
        expect(allLegs[1].delta).toBeCloseTo(0.6);
        expect(allLegs[1].pnlExpiry).toBe(0);
    });

    it('returns the call-only series for the Call tab without another Chart click', () =>
    {
        const callTab = selectRangeChartRows(rowsByLeg, 1);

        expect(callTab).toBe(callRows);
        expect(callTab[0].pnlExpiry).toBe(-5);
        expect(callTab[1].pnlExpiry).toBe(5);
        expect(callTab[0].delta).toBe(0.2);
    });

    it('returns the put-only series for the Put tab without another Chart click', () =>
    {
        const putTab = selectRangeChartRows(rowsByLeg, 2);

        expect(putTab).toBe(putRows);
        expect(putTab[0].pnlExpiry).toBe(5);
        expect(putTab[1].pnlExpiry).toBe(-5);
        expect(putTab[0].delta).toBe(-0.8);
    });

    it('returns an empty series when there is no cached data', () =>
    {
        expect(selectRangeChartRows([], 0)).toEqual([]);
        expect(selectRangeChartRows([], 1)).toEqual([]);
    });
});
