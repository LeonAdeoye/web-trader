import {
    calculatePortfolioMetrics,
    calculatePortfolioDerivedValues,
    buildRfqPricingFieldUpdates,
    getRfqRecalculationIntervalMs,
    DEFAULT_RFQ_RECALCULATION_PERIOD_SECONDS
} from '../calculations/calculateRfqOptionMetrics';
import { aggregateLegResults, buildLegResult } from '../calculations/rfqDetailsViewModel';

const createMockRfq = () =>
({
    spread: 0.2,
    multiplier: 100,
    underlyingPrice: 78,
    notionalFXRate: 7.841,
    salesCreditPercentage: 0.5,
    volatility: 21,
    interestRate: 7.48,
    exerciseType: 'EUROPEAN',
    dayCountConvention: 365,
    daysToExpiry: 493,
    maturityDate: '2028-07-19',
    premiumSettlementDaysOverride: 2,
    legs: [
        { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' },
        { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT' }
    ]
});

const createMockGreeks = (overrides = {}) =>
({
    delta: '0.5',
    gamma: '0.1',
    theta: '-0.2',
    vega: '0.3',
    rho: '0.4',
    price: '6.0',
    ...overrides
});

describe('getRfqRecalculationIntervalMs', () =>
{
    it('defaults to 30 seconds when config is missing', () =>
    {
        expect(getRfqRecalculationIntervalMs({})).toBe(DEFAULT_RFQ_RECALCULATION_PERIOD_SECONDS * 1000);
    });

    it('uses configured recalculation period in milliseconds', () =>
    {
        expect(getRfqRecalculationIntervalMs({ recalculationPeriodSeconds: 45 })).toBe(45000);
    });
});

describe('calculateRfqOptionMetrics portfolio delta parity', () =>
{
    it('grid delta matches summary greek sum for multi-leg RFQ', () =>
    {
        const rfq = createMockRfq();
        const config = { decimalPrecision: 3, defaultSalesCreditPercentage: 0.5, defaultOptionModel: 'european' };
        const legResults = rfq.legs.map(leg => buildLegResult(rfq, leg, createMockGreeks(
            leg.optionType === 'PUT' ? { delta: '0.3', price: '4.0' } : {}
        )));

        const portfolioMetrics = calculatePortfolioMetrics(rfq, legResults);
        const derivedValues = calculatePortfolioDerivedValues(portfolioMetrics, rfq, config);
        const summary = aggregateLegResults(legResults);

        expect(parseFloat(derivedValues.delta)).toBeCloseTo(summary.greekSums.delta, config.decimalPrecision);
        expect(portfolioMetrics.deltaNumber).toBeCloseTo(summary.greekSums.delta, config.decimalPrecision);
    });

    it('buildRfqPricingFieldUpdates delta matches portfolio metrics', () =>
    {
        const rfq = createMockRfq();
        const config = { decimalPrecision: 3, defaultSalesCreditPercentage: 0.5, defaultSettlementDays: 2 };
        const legResults = rfq.legs.map(leg => buildLegResult(rfq, leg, createMockGreeks(
            leg.optionType === 'PUT' ? { delta: '0.3', price: '4.0' } : {}
        )));
        const portfolioMetrics = calculatePortfolioMetrics(rfq, legResults);
        const derivedValues = calculatePortfolioDerivedValues(portfolioMetrics, rfq, config);
        const optionRequestParserService = { calculateSettlementDate: () => '2028-07-21' };

        const fieldUpdates = buildRfqPricingFieldUpdates(
            { pricedRfq: rfq, optionModel: 'european', portfolioMetrics, derivedValues },
            config,
            optionRequestParserService
        );

        expect(parseFloat(fieldUpdates.delta)).toBeCloseTo(portfolioMetrics.deltaNumber, config.decimalPrecision);
        expect(fieldUpdates.optionModel).toBe('european');
        expect(fieldUpdates.daysToExpiry).toBe(493);
        expect(fieldUpdates.pricedAt).toBeDefined();
    });
});
