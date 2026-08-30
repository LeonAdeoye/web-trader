import { uniqueMarketDataRics } from '../hooks/uniqueMarketDataRics';

describe('uniqueMarketDataRics', () =>
{
    it('returns an empty list for missing input', () =>
    {
        expect(uniqueMarketDataRics()).toEqual([]);
        expect(uniqueMarketDataRics(null)).toEqual([]);
        expect(uniqueMarketDataRics([])).toEqual([]);
    });

    it('drops blanks, dedupes, and sorts RICs', () =>
    {
        expect(uniqueMarketDataRics(['AAPL.O', '', '0700.HK', 'AAPL.O', null, '0700.HK'])).toEqual(['0700.HK', 'AAPL.O']);
    });
});
