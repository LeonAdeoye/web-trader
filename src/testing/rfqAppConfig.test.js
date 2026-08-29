import { DEFAULT_RFQ_APP_CONFIG, normalizeRfqAppConfig, parseRfqConfigParam } from '../config/rfqAppConfig';

describe('rfqAppConfig', () =>
{
    it('normalizes numeric config values from strings', () =>
    {
        const config = normalizeRfqAppConfig({
            recalculationPeriodSeconds: '10',
            decimalPrecision: '4',
            defaultOptionModel: 'monte_carlo'
        });

        expect(config.recalculationPeriodSeconds).toBe(10);
        expect(config.decimalPrecision).toBe(4);
        expect(config.defaultOptionModel).toBe('monte_carlo');
        expect(config.defaultSpread).toBe(DEFAULT_RFQ_APP_CONFIG.defaultSpread);
    });

    it('parses encoded config params with defaults', () =>
    {
        const encoded = encodeURIComponent(JSON.stringify({ recalculationPeriodSeconds: 15, defaultOptionModel: 'binomial' }));
        const config = parseRfqConfigParam(encoded);

        expect(config.recalculationPeriodSeconds).toBe(15);
        expect(config.defaultOptionModel).toBe('binomial');
    });
});
