import { useEffect, useRef, useState } from 'react';
import { calculateRfqOptionMetrics } from '../calculations/calculateRfqOptionMetrics';
import { aggregateLegResults } from '../calculations/rfqDetailsViewModel';
import { useLiveRfqPricingInputs } from './useLiveRfqPricingInputs';
import { ServiceRegistry } from '../services/ServiceRegistry';

export const useRfqAllLegCalculations = (rfq, optionPricingService, loggerService, config, optionRequestParserService) =>
{
    const { pricedRfq, refreshTick } = useLiveRfqPricingInputs(rfq, optionRequestParserService, config);
    const pricedRfqRef = useRef(pricedRfq);
    pricedRfqRef.current = pricedRfq;

    const [legResults, setLegResults] = useState(null);
    const [summary, setSummary] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const hasResultsRef = useRef(false);

    useEffect(() =>
    {
        hasResultsRef.current = false;
        setLegResults(null);
        setSummary(null);
        setInitialLoading(true);
    }, [rfq?.rfqId]);

    useEffect(() =>
    {
        const rfqToCalculate = pricedRfqRef.current;

        if (!rfqToCalculate?.legs?.length)
        {
            if (!hasResultsRef.current)
            {
                setLegResults(null);
                setSummary(null);
                setInitialLoading(false);
            }
            return;
        }

        let cancelled = false;
        const isInitialLoad = !hasResultsRef.current;

        const calculate = async () =>
        {
            if (isInitialLoad)
                setInitialLoading(true);

            try
            {
                const result = await calculateRfqOptionMetrics(rfqToCalculate, config, {
                    optionPricingService,
                    optionRequestParserService,
                    priceService: ServiceRegistry.getPriceService()
                });

                if (!cancelled && result)
                {
                    hasResultsRef.current = true;
                    setLegResults(result.legResults);
                    setSummary(aggregateLegResults(result.legResults));
                }
            }
            catch (err)
            {
                loggerService.logError("Error calculating leg metrics", err);
            }
            finally
            {
                if (!cancelled && isInitialLoad)
                    setInitialLoading(false);
            }
        };

        calculate();

        return () =>
        {
            cancelled = true;
        };
    }, [
        refreshTick,
        rfq?.rfqId,
        config.decimalPrecision,
        config.defaultOptionModel,
        config.defaultSpread,
        config.defaultSalesCreditPercentage,
        config.defaultDayConvention,
        optionPricingService,
        loggerService,
        optionRequestParserService
    ]);

    return { legResults, summary, initialLoading, pricedRfq };
};
