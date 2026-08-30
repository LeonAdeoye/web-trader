import { PriceService } from '../services/PriceService';

describe('PriceService last trade prices', () =>
{
    let priceService;

    beforeEach(() =>
    {
        global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
        priceService = new PriceService();
        priceService.createDefaultPrices([{ instrumentCode: '0700.HK' }], 100, 99);
    });

    const getPrice = (instrumentCode) => priceService.getPrices().find(price => price.instrumentCode === instrumentCode);

    it('returns REST close price when no live last trade exists', () =>
    {
        expect(getPrice('0700.HK').closePrice).toBe(100);
        expect(getPrice('0700.HK').lastPrice).toBeUndefined();
        expect(priceService.getLastTradePrice('0700.HK')).toBe(100);
        expect(priceService.getLiveLastTradePrice('0700.HK')).toBeUndefined();
    });

    it('stores last on the same price record as closePrice', () =>
    {
        priceService.updateLastTradePrice('0700.HK', 112.5);

        expect(getPrice('0700.HK').closePrice).toBe(100);
        expect(getPrice('0700.HK').lastPrice).toBe(112.5);
        expect(priceService.getLiveLastTradePrice('0700.HK')).toBe(112.5);
        expect(priceService.getLastTradePrice('0700.HK')).toBe(112.5);
    });

    it('ignores empty or invalid live price updates', () =>
    {
        priceService.updateLastTradePrice('0700.HK', 112.5);
        priceService.updateLastTradePrice('', 120);
        priceService.updateLastTradePrice(null, 120);
        priceService.updateLastTradePrice('0700.HK', null);
        priceService.updateLastTradePrice('0700.HK', '');
        priceService.updateLastTradePrice('0700.HK', 'not-a-number');

        expect(getPrice('0700.HK').lastPrice).toBe(112.5);
        expect(priceService.getLastTradePrice('0700.HK')).toBe(112.5);
    });

    it('accepts a live price of zero', () =>
    {
        priceService.updateLastTradePrice('0700.HK', 0);

        expect(getPrice('0700.HK').lastPrice).toBe(0);
        expect(priceService.getLastTradePrice('0700.HK')).toBe(0);
        expect(priceService.getLiveLastTradePrice('0700.HK')).toBe(0);
    });

    it('falls back to REST close for instruments without a live tick', () =>
    {
        priceService.createDefaultPrices([
            { instrumentCode: '0700.HK' },
            { instrumentCode: 'AAPL.O' }
        ], 80, 79);
        priceService.updateLastTradePrice('0700.HK', 91);

        expect(getPrice('0700.HK').closePrice).toBe(80);
        expect(getPrice('0700.HK').lastPrice).toBe(91);
        expect(getPrice('AAPL.O').closePrice).toBe(80);
        expect(getPrice('AAPL.O').lastPrice).toBeUndefined();
        expect(priceService.getLastTradePrice('0700.HK')).toBe(91);
        expect(priceService.getLastTradePrice('AAPL.O')).toBe(80);
    });

    it('keeps last when REST prices are reloaded', async () =>
    {
        priceService.updateLastTradePrice('0700.HK', 112.5);
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: async () => ([{ instrumentCode: '0700.HK', closePrice: 101, openPrice: 99 }])
        }));

        await priceService.loadPrices(true);

        expect(getPrice('0700.HK').closePrice).toBe(101);
        expect(getPrice('0700.HK').lastPrice).toBe(112.5);
        expect(priceService.getLastTradePrice('0700.HK')).toBe(112.5);
    });

    it('returns undefined when the instrument is unknown', () =>
    {
        expect(priceService.getLastTradePrice('MISSING')).toBeUndefined();
        expect(priceService.getLiveLastTradePrice('MISSING')).toBeUndefined();
    });

    it('creates a lastPrice-only record for a new instrument', () =>
    {
        priceService.updateLastTradePrice('AAPL.O', 190.25);

        expect(getPrice('AAPL.O').lastPrice).toBe(190.25);
        expect(getPrice('AAPL.O').closePrice).toBeUndefined();
        expect(priceService.getLastTradePrice('AAPL.O')).toBe(190.25);
    });

    it('coerces string last prices to numbers', () =>
    {
        priceService.updateLastTradePrice('0700.HK', '112.5');

        expect(getPrice('0700.HK').lastPrice).toBe(112.5);
        expect(priceService.getLastTradePrice('0700.HK')).toBe(112.5);
    });

    it('keeps lastPrice when default prices are recreated', () =>
    {
        priceService.updateLastTradePrice('0700.HK', 112.5);
        priceService.createDefaultPrices([{ instrumentCode: '0700.HK' }], 80, 79);

        expect(getPrice('0700.HK').closePrice).toBe(80);
        expect(getPrice('0700.HK').lastPrice).toBe(112.5);
    });

    it('caches AMPS ticks onto lastPrice', () =>
    {
        priceService.cacheMarketDataTick({ ric: '0700.HK', price: 115 });
        priceService.cacheMarketDataTick(undefined);
        priceService.cacheMarketDataTick(null);

        expect(getPrice('0700.HK').lastPrice).toBe(115);
    });

    it('overlays lastPrice onto an RFQ without changing closePrice', () =>
    {
        const rfq = { rfqId: 'RFQ-1', underlying: '0700.HK', underlyingPrice: 100 };
        expect(priceService.applyLiveUnderlyingPrice(rfq)).toEqual(rfq);

        priceService.updateLastTradePrice('0700.HK', 112.5);

        expect(priceService.applyLiveUnderlyingPrice(rfq)).toEqual({ ...rfq, underlyingPrice: 112.5 });
        expect(getPrice('0700.HK').closePrice).toBe(100);
        expect(priceService.applyLiveUnderlyingPrice(null)).toBeNull();
        expect(priceService.applyLiveUnderlyingPrice(undefined)).toBeUndefined();
    });
});
