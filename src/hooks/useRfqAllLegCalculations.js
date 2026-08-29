import { useEffect, useMemo, useState } from 'react';
import { aggregateLegResults, buildLegResult, getOptionPricingParams } from '../calculations/rfqDetailsViewModel';

export const useRfqAllLegCalculations = (rfq, optionPricingService, loggerService, config) =>
{
    const [legResults, setLegResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        if (!rfq?.legs?.length)
        {
            setLegResults(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const calculate = async () =>
        {
            setLoading(true);

            try
            {
                const results = await Promise.all(rfq.legs.map(async (leg) =>
                {
                    const greeks = await optionPricingService.calculateOptionPrice(getOptionPricingParams(rfq, leg, config));
                    return buildLegResult(rfq, leg, greeks);
                }));

                if (!cancelled)
                    setLegResults(results);
            }
            catch (err)
            {
                loggerService.logError("Error calculating leg metrics", err);

                if (!cancelled)
                    setLegResults(null);
            }
            finally
            {
                if (!cancelled)
                    setLoading(false);
            }
        };

        calculate();

        return () =>
        {
            cancelled = true;
        };
    }, [rfq, optionPricingService, loggerService, config]);

    const summary = useMemo(() =>
        legResults ? aggregateLegResults(legResults) : null,
    [legResults]);

    return { legResults, summary, loading };
};
