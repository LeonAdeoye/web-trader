import { useEffect, useMemo, useState } from 'react';
import { getRfqRecalculationIntervalMs, prepareRfqForPricing } from '../calculations/calculateRfqOptionMetrics';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { useMarketDataLastPriceCache } from './useMarketDataLastPriceCache';

const applyPricingInputs = (rfq, optionRequestParserService) =>
{
    const priceService = ServiceRegistry.getPriceService();
    return prepareRfqForPricing(rfq, { priceService, optionRequestParserService });
};

const tryReloadPrices = async (priceService) =>
{
    try
    {
        await priceService.loadPrices(true);
    }
    catch (error)
    {
        console.error('Failed to reload prices for RFQ pricing inputs:', error);
    }
};

export const useLiveRfqPricingInputs = (rfq, optionRequestParserService, config) =>
{
    useMarketDataLastPriceCache(rfq?.underlying ? [rfq.underlying] : []);
    const refreshIntervalMs = getRfqRecalculationIntervalMs(config);
    const [pricedRfq, setPricedRfq] = useState(() =>
        rfq?.legs?.length ? applyPricingInputs(rfq, optionRequestParserService) : null
    );
    const [refreshTick, setRefreshTick] = useState(0);

    const pricingInputsKey = useMemo(() =>
    {
        if (!rfq) return '';
        return [
            rfq.rfqId,
            rfq.underlying,
            rfq.underlyingPrice,
            rfq.volatility,
            rfq.interestRate,
            rfq.maturityDate,
            rfq.optionModel,
            rfq.legs?.length
        ].join('|');
    }, [rfq]);

    useEffect(() =>
    {
        if (!rfq?.legs?.length)
        {
            setPricedRfq(null);
            return;
        }

        let cancelled = false;

        const refresh = async () =>
        {
            const priceService = ServiceRegistry.getPriceService();
            await tryReloadPrices(priceService);

            if (cancelled)
                return;

            setPricedRfq(applyPricingInputs(rfq, optionRequestParserService));
            setRefreshTick(tick => tick + 1);
        };

        refresh();
        const intervalId = setInterval(refresh, refreshIntervalMs);

        return () =>
        {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [rfq, pricingInputsKey, optionRequestParserService, refreshIntervalMs]);

    return { pricedRfq, refreshTick };
};
