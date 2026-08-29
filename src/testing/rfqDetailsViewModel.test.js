import {
    aggregateLegResults,
    buildGreeksGridData,
    buildLegGreeksGridData,
    buildLegGreekRowValues,
    buildRfqDetailsTextFields,
    buildLegResult,
    buildSummaryGreeksGridData
} from "../calculations/rfqDetailsViewModel";

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
    arrivalTime: '15:51:13',
    rfqId: 'test-rfq-id',
    status: 'PENDING',
    underlying: '0007.HK',
    notionalCurrency: 'HKD',
    notionalInLocal: 24000,
    notionalInUSD: 3060.834,
    daysToExpiry: 493,
    maturityDate: '2028-07-19',
    premiumSettlementCurrency: 'USD',
    premiumSettlementDaysOverride: 2,
    premiumSettlementFXRate: 1
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

describe('buildLegGreekRowValues', () =>
{
    it('applies quantity and side sign to greek row values', () =>
    {
        const rfq = createMockRfq();
        const buyLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' };
        const sellLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT' };
        const buyResult = buildLegResult(rfq, buyLeg, createMockGreeks());
        const sellResult = buildLegResult(rfq, sellLeg, createMockGreeks({ delta: '0.3' }));

        const buyRows = buildLegGreekRowValues(buyResult.leg, buyResult.metrics, buyResult.derived);
        const sellRows = buildLegGreekRowValues(sellResult.leg, sellResult.metrics, sellResult.derived);

        expect(buyRows.greek.delta).toBeCloseTo(0.5);
        expect(sellRows.greek.delta).toBeCloseTo(-0.6);
        expect(buyRows.shares.delta).toBeCloseTo(50);
        expect(sellRows.shares.delta).toBeCloseTo(-60);
    });
});

describe('aggregateLegResults', () =>
{
    it('sums additive values across two legs', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL', underlying: '0007.HK', currency: 'HKD' };
        const putLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT', underlying: '0007.HK', currency: 'HKD' };

        const callResult = buildLegResult(rfq, callLeg, createMockGreeks());
        const putResult = buildLegResult(rfq, putLeg, createMockGreeks({ delta: '0.3', price: '4.0' }));
        const legResults = [callResult, putResult];
        const summary = aggregateLegResults(legResults);

        expect(summary.totalQuantity).toBe(3);
        expect(summary.strikes).toBe('100, 70');
        expect(summary.greekSums.delta).toBeCloseTo(0.5 * 1 + -0.3 * 2);
        expect(summary.totalPremiumInLocal).toBeCloseTo(6.0 + -4.0);
        expect(summary.totalNotionalInLocal).toBeCloseTo(callResult.metrics.notionalInLocal + putResult.metrics.notionalInLocal);
        expect(summary.totalSalesCreditAmount).toBeCloseTo(callResult.derived.salesCreditAmount + putResult.derived.salesCreditAmount);
    });
});

describe('buildGreeksGridData', () =>
{
    it('returns empty grid rows when leg result is not loaded yet', () =>
    {
        const gridData = buildGreeksGridData({ mode: 'leg', legResult: null, summary: null }, 3);
        expect(gridData).toEqual([]);
    });

    it('builds leg grid rows from a single leg result', () =>
    {
        const rfq = createMockRfq();
        const leg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' };
        const legResult = buildLegResult(rfq, leg, createMockGreeks());
        const gridData = buildLegGreeksGridData(legResult, 3);

        expect(gridData).toHaveLength(4);
        expect(gridData[0].field).toBe('Greek');
        expect(gridData[0].delta).toBe('0.500');
        expect(gridData[3].field).toBe('Shares');
    });

    it('builds summary grid rows that equal the sum of leg grid rows', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' };
        const putLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT' };
        const legResults = [
            buildLegResult(rfq, callLeg, createMockGreeks({ delta: '0.423', gamma: '0.017', theta: '-0.015', vega: '0.221', rho: '0.118' })),
            buildLegResult(rfq, putLeg, createMockGreeks({ delta: '0.310', gamma: '0.014', theta: '-0.011', vega: '0.198', rho: '0.092', price: '4.0' }))
        ];

        const callGrid = buildLegGreeksGridData(legResults[0], 3);
        const putGrid = buildLegGreeksGridData(legResults[1], 3);
        const summaryGrid = buildSummaryGreeksGridData(legResults, 3);

        expect(summaryGrid).toHaveLength(4);

        for (const rowIndex of [0, 1, 2, 3])
        {
            for (const greek of ['delta', 'gamma', 'theta', 'vega', 'rho'])
            {
                const legSum = parseFloat(callGrid[rowIndex][greek]) + parseFloat(putGrid[rowIndex][greek]);
                expect(parseFloat(summaryGrid[rowIndex][greek])).toBe(parseFloat(legSum.toFixed(3)));
            }
        }
    });

    it('builds summary grid rows from aggregated leg results via buildGreeksGridData', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' };
        const putLeg = { quantity: 1, strike: 70, side: 'SELL', optionType: 'PUT' };
        const legResults = [
            buildLegResult(rfq, callLeg, createMockGreeks()),
            buildLegResult(rfq, putLeg, createMockGreeks({ delta: '0.2', price: '2.0' }))
        ];
        const summary = aggregateLegResults(legResults);
        const gridData = buildGreeksGridData({ mode: 'summary', legResults, summary }, 3);

        expect(gridData).toHaveLength(4);
        expect(parseFloat(gridData[0].delta)).toBeCloseTo(0.5 + -0.2);
    });
});

describe('buildRfqDetailsTextFields', () =>
{
    it('shows shared RFQ values and aggregated fields in summary mode', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL', underlying: '0007.HK', currency: 'HKD' };
        const putLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT', underlying: '0007.HK', currency: 'HKD' };
        const summary = aggregateLegResults([
            buildLegResult(rfq, callLeg, createMockGreeks()),
            buildLegResult(rfq, putLeg, createMockGreeks({ price: '4.0' }))
        ]);

        const fields = buildRfqDetailsTextFields(rfq, { mode: 'summary', legResult: null, summary }, 3);
        const fieldMap = Object.fromEntries(fields.map(field => [field.label, field.value]));

        expect(fieldMap['Quantity']).toBe(3);
        expect(fieldMap['Strike']).toBe('100, 70');
        expect(fieldMap['Underlying']).toBe('0007.HK');
        expect(fieldMap['Volatility']).toBe(21);
        expect(fieldMap['Status']).toBe('PENDING');
        expect(parseFloat(fieldMap['Premium In Local'])).toBeCloseTo(2.0);
    });

    it('shows leg-specific values in leg mode', () =>
    {
        const rfq = createMockRfq();
        const leg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL', underlying: '0007.HK', currency: 'HKD', daysToExpiry: 493 };
        const legResult = buildLegResult(rfq, leg, createMockGreeks());
        const fields = buildRfqDetailsTextFields(rfq, { mode: 'leg', legResult, summary: null }, 3);
        const fieldMap = Object.fromEntries(fields.map(field => [field.label, field.value]));

        expect(fieldMap['Quantity']).toBe(1);
        expect(fieldMap['Strike']).toBe(100);
        expect(fieldMap['Premium In Local']).toBe('6.000');
        expect(fieldMap['Notional In Local']).toBe('10000');
    });

    it('formats notional in local without decimal places in summary and leg modes', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL', underlying: '0007.HK', currency: 'HKD' };
        const putLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT', underlying: '0007.HK', currency: 'HKD' };
        const legResults = [
            buildLegResult(rfq, callLeg, createMockGreeks()),
            buildLegResult(rfq, putLeg, createMockGreeks({ price: '4.0' }))
        ];
        const summary = aggregateLegResults(legResults);

        const summaryFields = buildRfqDetailsTextFields(rfq, { mode: 'summary', legResult: null, summary }, 3);
        const summaryMap = Object.fromEntries(summaryFields.map(field => [field.label, field.value]));
        expect(summaryMap['Notional In Local']).toBe('24000');
        expect(summaryMap['Notional In Local']).not.toContain('.');

        const legFields = buildRfqDetailsTextFields(rfq, { mode: 'leg', legResult: legResults[0], summary: null }, 3);
        const legMap = Object.fromEntries(legFields.map(field => [field.label, field.value]));
        expect(legMap['Notional In Local']).toBe('10000');
        expect(legMap['Notional In Local']).not.toContain('.');
    });

    it('shows per-leg notional in USD on leg tabs and the sum on summary', () =>
    {
        const rfq = createMockRfq();
        const callLeg = { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL', underlying: '0007.HK', currency: 'HKD' };
        const putLeg = { quantity: 2, strike: 70, side: 'SELL', optionType: 'PUT', underlying: '0007.HK', currency: 'HKD' };
        const legResults = [
            buildLegResult(rfq, callLeg, createMockGreeks()),
            buildLegResult(rfq, putLeg, createMockGreeks({ price: '4.0' }))
        ];
        const summary = aggregateLegResults(legResults);

        const callUsd = legResults[0].metrics.notionalInUSD;
        const putUsd = legResults[1].metrics.notionalInUSD;
        expect(callUsd).not.toBe(putUsd);

        const summaryFields = buildRfqDetailsTextFields(rfq, { mode: 'summary', legResult: null, summary }, 3);
        const summaryMap = Object.fromEntries(summaryFields.map(field => [field.label, field.value]));
        expect(parseFloat(summaryMap['Notional In USD'])).toBeCloseTo(callUsd + putUsd, 3);

        const callFields = buildRfqDetailsTextFields(rfq, { mode: 'leg', legResult: legResults[0], summary: null }, 3);
        const callMap = Object.fromEntries(callFields.map(field => [field.label, field.value]));
        expect(parseFloat(callMap['Notional In USD'])).toBeCloseTo(callUsd, 3);
        expect(callMap['Notional In USD']).not.toBe(summaryMap['Notional In USD']);

        const putFields = buildRfqDetailsTextFields(rfq, { mode: 'leg', legResult: legResults[1], summary: null }, 3);
        const putMap = Object.fromEntries(putFields.map(field => [field.label, field.value]));
        expect(parseFloat(putMap['Notional In USD'])).toBeCloseTo(putUsd, 3);
    });

    it('formats maturity and premium settlement dates from ISO strings', () =>
    {
        const rfq = createMockRfq();
        rfq.maturityDate = '2028-07-19T00:00:00.000Z';
        rfq.premiumSettlementDate = '2028-07-21T00:00:00.000Z';
        const summary = aggregateLegResults([
            buildLegResult(rfq, { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' }, createMockGreeks())
        ]);

        const fields = buildRfqDetailsTextFields(rfq, { mode: 'summary', legResult: null, summary }, 3);
        const fieldMap = Object.fromEntries(fields.map(field => [field.label, field.value]));

        expect(fieldMap['Maturity Date']).toBe('19 Jul 2028');
        expect(fieldMap['Premium Settlement Date']).toBe('21 Jul 2028');
    });

    it('formats slash-separated premium settlement dates consistently', () =>
    {
        const rfq = createMockRfq();
        rfq.maturityDate = '2028-07-19T00:00:00.000Z';
        rfq.premiumSettlementDate = '21/07/2028';
        const summary = aggregateLegResults([
            buildLegResult(rfq, { quantity: 1, strike: 100, side: 'BUY', optionType: 'CALL' }, createMockGreeks())
        ]);

        const fields = buildRfqDetailsTextFields(rfq, { mode: 'summary', legResult: null, summary }, 3);
        const fieldMap = Object.fromEntries(fields.map(field => [field.label, field.value]));

        expect(fieldMap['Maturity Date']).toBe('19 Jul 2028');
        expect(fieldMap['Premium Settlement Date']).toBe('21 Jul 2028');
    });
});
