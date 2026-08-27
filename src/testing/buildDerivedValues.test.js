import {buildDerivedValues} from "../calculations/buidDerivedValues";

describe('buildDerivedValues', () => {
    it('calculates all derived values correctly', () => {
        const rfq = {
            underlyingPrice: 50,
            notionalFXRate: 1.25,
            salesCreditPercentage: 10
        };

        const leg = {
            quantity: 10
        };

        const metrics = {
            delta: 0.5,
            gamma: 0.1,
            theta: -0.2,
            vega: 0.3,
            rho: 0.4,
            price: 1.5,
            shares: 1000,
            notionalShares: 50000,
            notionalInUSD: 32000
        };

        const result = buildDerivedValues(rfq, leg, metrics);

        // Delta
        expect(result.deltaShares).toBe(0.5 * 1000);
        expect(result.deltaNotional).toBe(0.5 * 50000);
        expect(result.deltaPercent).toBe((0.5 * 100) / 50);

        // Gamma
        expect(result.gammaShares).toBe(0.1 * 1000);
        expect(result.gammaNotional).toBe(0.1 * 50000);
        expect(result.gammaPercent).toBe((0.1 * 100) / 50);

        // Theta
        expect(result.thetaShares).toBe(-0.2 * 1000);
        expect(result.thetaNotional).toBe(-0.2 * 50000);
        expect(result.thetaPercent).toBe((-0.2 * 100) / 50);

        // Vega
        expect(result.vegaShares).toBe(0.3 * 1000);
        expect(result.vegaNotional).toBe(0.3 * 50000);
        expect(result.vegaPercent).toBe((0.3 * 100) / 50);

        // Rho
        expect(result.rhoShares).toBe(0.4 * 1000);
        expect(result.rhoNotional).toBe(0.4 * 50000);
        expect(result.rhoPercent).toBe((0.4 * 100) / 50);

        // Premiums
        expect(result.premiumInUSD).toBe(1.5 / 1.25);
        expect(result.premiumInLocal).toBe(1.5);
        expect(result.premiumPercentage).toBe((1.5 * 100) / 50);

        // Sales credit
        expect(result.salesCreditAmount).toBe((10 * 32000) / 100);
    });

    it('handles zero underlying price safely', () => {
        const rfq = { underlyingPrice: 0, notionalFXRate: 1, salesCreditPercentage: 0 };
        const leg = {};
        const metrics = { delta: 1, gamma: 1, theta: 1, vega: 1, rho: 1, price: 1, shares: 1, notionalShares: 1, notionalInUSD: 1 };

        const result = buildDerivedValues(rfq, leg, metrics);

        expect(result.deltaPercent).toBe(Infinity); // division by zero is expected
    });
});
