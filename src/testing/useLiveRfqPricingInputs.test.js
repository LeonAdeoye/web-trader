import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useLiveRfqPricingInputs } from '../hooks/useLiveRfqPricingInputs';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { PriceService } from '../services/PriceService';

jest.mock('../hooks/useMarketDataLastPriceCache', () => ({
    useMarketDataLastPriceCache: jest.fn()
}));

const Harness = ({ rfq, optionRequestParserService, config }) =>
{
    const { pricedRfq } = useLiveRfqPricingInputs(rfq, optionRequestParserService, config);
    return <div data-testid="underlying">{pricedRfq?.underlyingPrice ?? 'none'}</div>;
};

describe('useLiveRfqPricingInputs', () =>
{
    let priceService;

    beforeEach(() =>
    {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => [] }));
        priceService = new PriceService();
        priceService.createDefaultPrices([{ instrumentCode: '0700.HK' }], 78, 77);
        jest.spyOn(priceService, 'loadPrices').mockResolvedValue(priceService.getPrices());
        jest.spyOn(ServiceRegistry, 'getPriceService').mockReturnValue(priceService);
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('applies lastPrice from PriceService onto the RFQ', async () =>
    {
        priceService.updateLastTradePrice('0700.HK', 112.5);
        const rfq = {
            rfqId: 'RFQ-1',
            underlying: '0700.HK',
            underlyingPrice: 78,
            legs: [{ quantity: 1, strike: 100 }]
        };
        const optionRequestParserService = { calculateBusinessDaysToExpiry: () => 10 };

        await act(async () =>
        {
            render(<Harness rfq={rfq} optionRequestParserService={optionRequestParserService} config={{ recalculationPeriodSeconds: 30 }} />);
        });

        await waitFor(() => expect(screen.getByTestId('underlying').textContent).toBe('112.5'));
    });

    it('returns no priced RFQ when there are no legs', async () =>
    {
        const rfq = { rfqId: 'RFQ-1', underlying: '0700.HK', underlyingPrice: 78, legs: [] };

        await act(async () =>
        {
            render(<Harness rfq={rfq} optionRequestParserService={{}} config={{ recalculationPeriodSeconds: 30 }} />);
        });

        await waitFor(() => expect(screen.getByTestId('underlying').textContent).toBe('none'));
    });
});
