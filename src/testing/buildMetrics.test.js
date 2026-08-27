import {buildMetrics} from "../calculations/buildMetrics";

describe('buildMetrics', () => {
    it('calculates metrics correctly for BUY side', () => {
        const rfq = {
            spread: 0.2,
            multiplier: 100,
            underlyingPrice: 50,
            notionalFXRate: 1.25
        };

        const leg = {
            quantity: 10,
            strike: 40,
            side: 'BUY'
        };

        const greeks = {
            delta: '0.5',
            gamma: '0.1',
            theta: '-0.2',
            vega: '0.3',
            rho: '0.4',
            price: '1.5'
        };

        const result = buildMetrics(rfq, leg, greeks);

        expect(result.delta).toBe(0.5);
        expect(result.gamma).toBe(0.1);
        expect(result.theta).toBe(-0.2);
        expect(result.vega).toBe(0.3);
        expect(result.rho).toBe(0.4);
        expect(result.price).toBe(1.5);

        expect(result.shares).toBe(1000); // 10 * 100
        expect(result.notionalShares).toBe(50000); // 1000 * 50
        expect(result.notionalInLocal).toBe(40000); // 10 * 100 * 40
        expect(result.notionalInUSD).toBe(32000); // 40000 / 1.25
    });

    it('applies negative sign for SELL side', () => {
        const rfq = { multiplier: 1, underlyingPrice: 1, notionalFXRate: 1, spread: 0 };
        const leg = { quantity: 1, strike: 1, side: 'SELL' };
        const greeks = { delta: '1', gamma: '1', theta: '1', vega: '1', rho: '1', price: '1' };

        const result = buildMetrics(rfq, leg, greeks);

        expect(result.delta).toBe(-1);
        expect(result.gamma).toBe(-1);
        expect(result.theta).toBe(-1);
        expect(result.vega).toBe(-1);
        expect(result.rho).toBe(-1);
        expect(result.price).toBe(-1);
    });
});

