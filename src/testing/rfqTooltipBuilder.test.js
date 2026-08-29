import React from 'react';
import { render } from '@testing-library/react';
import CalculationTooltipCellRenderer from "../components/CalculationTooltipCellRenderer";
import {
    getNotionalUSDTooltip,
    getNotionalLocalTooltip,
    getPremiumUSDTooltip,
    getSalesCreditTooltip,
    getDeltaSharesTooltip,
    getDeltaNotionalTooltip,
    getDeltaPercentTooltip,
    getPremiumLocalTooltip,
    getAskPremiumTooltip,
    getBidPremiumTooltip,
    getPremiumPercentTooltip,
    getGammaSharesTooltip,
    getGammaNotionalTooltip,
    getGammaPercentTooltip,
    getThetaSharesTooltip,
    getThetaNotionalTooltip,
    getThetaPercentTooltip,
    getVegaSharesTooltip,
    getVegaNotionalTooltip,
    getVegaPercentTooltip,
    getAskPremiumPercentTooltip,
    getBidPremiumPercentTooltip,
    getRhoSharesTooltip,
    getRhoNotionalTooltip,
    getRhoPercentTooltip,
    NOTIONAL_USD_HEADER_TOOLTIP,
    NOTIONAL_LOCAL_HEADER_TOOLTIP
} from "../calculations/rfqTooltipBuilder";

const sampleRow =
{
    notionalInLocal: 40000,
    notionalInUSD: 32000,
    notionalFXRate: 1.25,
    multiplier: 100,
    legs: [{ quantity: 10, strike: 40 }],
    premiumInLocal: 150,
    premiumInUSD: 120,
    spread: 20,
    askPremiumInLocal: 160,
    bidPremiumInLocal: 140,
    premiumPercentage: 3,
    salesCreditPercentage: 5,
    salesCreditAmount: 1600,
    delta: 0.5,
    deltaShares: 50,
    deltaNotional: 2500,
    deltaPercent: 1,
    gamma: 0.02,
    gammaShares: 2,
    gammaNotional: 100,
    gammaPercent: 4,
    theta: -0.05,
    thetaShares: -5,
    thetaNotional: -250,
    thetaPercent: -0.1,
    vega: 0.1,
    vegaShares: 10,
    vegaNotional: 500,
    vegaPercent: 0.2,
    rho: 0.03,
    rhoShares: 3,
    rhoNotional: 150,
    rhoPercent: 0.06,
    askPremiumPercentage: 3.2,
    bidPremiumPercentage: 2.8,
    underlyingPrice: 50
};

describe('rfqTooltipBuilder', () =>
{
    it('builds notional USD tooltip', () =>
    {
        expect(getNotionalUSDTooltip(sampleRow)).toBe("Notional in USD = notionalInLocal / notionalFXRate\n= 40,000 / 1.25\n= 32,000");
    });

    it('builds notional local tooltip from legs', () =>
    {
        expect(getNotionalLocalTooltip(sampleRow)).toBe("Notional in Local = Σ (quantity × multiplier × strike)\n= 10 × 100 × 40\n= 40,000");
    });

    it('builds notional local tooltip for multiple legs', () =>
    {
        const row = { ...sampleRow, notionalInLocal: 62500, legs: [{ quantity: 10, strike: 40 }, { quantity: 5, strike: 45 }] };
        expect(getNotionalLocalTooltip(row)).toBe("Notional in Local = Σ (quantity × multiplier × strike)\n= 10 × 100 × 40 + 5 × 100 × 45\n= 62,500");
    });

    it('builds premium USD tooltip', () =>
    {
        expect(getPremiumUSDTooltip(sampleRow)).toBe("Fair Premium$ = premiumInLocal / notionalFXRate\n= 150 / 1.25\n= 120");
    });

    it('builds sales credit tooltip', () =>
    {
        expect(getSalesCreditTooltip(sampleRow)).toBe("S.Credit$ = (salesCreditPercentage × notionalInUSD) / 100\n= (5 × 32,000) / 100\n= 1,600");
    });

    it('builds delta shares tooltip', () =>
    {
        expect(getDeltaSharesTooltip(sampleRow)).toBe("Delta Shares = delta × multiplier\n= 0.5 × 100\n= 50");
    });

    it('builds delta notional tooltip', () =>
    {
        expect(getDeltaNotionalTooltip(sampleRow)).toBe("Delta Notional = deltaShares × underlyingPrice\n= 50 × 50\n= 2,500");
    });

    it('builds delta percent tooltip', () =>
    {
        expect(getDeltaPercentTooltip(sampleRow)).toBe("Delta % = (delta × 100) / underlyingPrice\n= (0.5 × 100) / 50\n= 1");
    });

    it('builds fair premium local tooltip', () =>
    {
        expect(getPremiumLocalTooltip(sampleRow)).toBe("Fair Premium = theoretical option model price (local)\n= 150");
    });

    it('builds ask premium tooltip', () =>
    {
        expect(getAskPremiumTooltip(sampleRow)).toBe("Ask Premium = premiumInLocal + (spread / 2)\n= 150 + (20 / 2)\n= 160");
    });

    it('builds bid premium tooltip', () =>
    {
        expect(getBidPremiumTooltip(sampleRow)).toBe("Bid Premium = premiumInLocal − (spread / 2)\n= 150 − (20 / 2)\n= 140");
    });

    it('builds fair premium percent tooltip', () =>
    {
        expect(getPremiumPercentTooltip(sampleRow)).toBe("Fair Premium% = (premiumInLocal × 100) / underlyingPrice\n= (150 × 100) / 50\n= 3");
    });

    it('builds gamma shares tooltip', () =>
    {
        expect(getGammaSharesTooltip(sampleRow)).toBe("Gamma Shares = gamma × multiplier\n= 0.02 × 100\n= 2");
    });

    it('builds gamma notional tooltip', () =>
    {
        expect(getGammaNotionalTooltip(sampleRow)).toBe("Gamma Notional = gammaShares × underlyingPrice\n= 2 × 50\n= 100");
    });

    it('builds gamma percent tooltip', () =>
    {
        expect(getGammaPercentTooltip(sampleRow)).toBe("Gamma % = (gamma × 100) / underlyingPrice\n= (0.02 × 100) / 50\n= 4");
    });

    it('builds theta shares tooltip', () =>
    {
        expect(getThetaSharesTooltip(sampleRow)).toBe("Theta Shares = theta × multiplier\n= -0.05 × 100\n= -5");
    });

    it('builds theta notional tooltip', () =>
    {
        expect(getThetaNotionalTooltip(sampleRow)).toBe("Theta Notional = thetaShares × underlyingPrice\n= -5 × 50\n= -250");
    });

    it('builds theta percent tooltip', () =>
    {
        expect(getThetaPercentTooltip(sampleRow)).toBe("Theta % = (theta × 100) / underlyingPrice\n= (-0.05 × 100) / 50\n= -0.1");
    });

    it('builds vega shares tooltip', () =>
    {
        expect(getVegaSharesTooltip(sampleRow)).toBe("Vega Shares = vega × multiplier\n= 0.1 × 100\n= 10");
    });

    it('builds vega notional tooltip', () =>
    {
        expect(getVegaNotionalTooltip(sampleRow)).toBe("Vega Notional = vegaShares × underlyingPrice\n= 10 × 50\n= 500");
    });

    it('builds vega percent tooltip', () =>
    {
        expect(getVegaPercentTooltip(sampleRow)).toBe("Vega % = (vega × 100) / underlyingPrice\n= (0.1 × 100) / 50\n= 0.2");
    });

    it('builds ask premium percent tooltip', () =>
    {
        expect(getAskPremiumPercentTooltip(sampleRow)).toBe("Ask Premium% = (askPremiumInLocal × 100) / underlyingPrice\n= (160 × 100) / 50\n= 3.2");
    });

    it('builds bid premium percent tooltip', () =>
    {
        expect(getBidPremiumPercentTooltip(sampleRow)).toBe("Bid Premium% = (bidPremiumInLocal × 100) / underlyingPrice\n= (140 × 100) / 50\n= 2.8");
    });

    it('builds rho shares tooltip', () =>
    {
        expect(getRhoSharesTooltip(sampleRow)).toBe("Rho Shares = rho × multiplier\n= 0.03 × 100\n= 3");
    });

    it('builds rho notional tooltip', () =>
    {
        expect(getRhoNotionalTooltip(sampleRow)).toBe("Rho Notional = rhoShares × underlyingPrice\n= 3 × 50\n= 150");
    });

    it('builds rho percent tooltip', () =>
    {
        expect(getRhoPercentTooltip(sampleRow)).toBe("Rho % = (rho × 100) / underlyingPrice\n= (0.03 × 100) / 50\n= 0.06");
    });

    it('returns formula only when values are missing', () =>
    {
        expect(getNotionalUSDTooltip({})).toBe(NOTIONAL_USD_HEADER_TOOLTIP);
        expect(getNotionalLocalTooltip({})).toBe(NOTIONAL_LOCAL_HEADER_TOOLTIP);
    });

    it('calculation cell renderer displays formatted cell value', () =>
    {
        const { container } = render(<CalculationTooltipCellRenderer data={sampleRow} value={sampleRow.notionalInUSD} valueFormatted="32,000.00" colDef={{ cellRendererParams: { getTooltip: getNotionalUSDTooltip } }} />);
        expect(container.querySelector('span').textContent).toBe("32,000.00");
    });
});
