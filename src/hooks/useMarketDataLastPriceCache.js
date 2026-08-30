import { useEffect, useRef } from 'react';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { LoggerService } from '../services/LoggerService';
import { uniqueMarketDataRics } from './uniqueMarketDataRics';

export const useMarketDataLastPriceCache = (rics = []) =>
{
    const loggerService = useRef(new LoggerService('useMarketDataLastPriceCache')).current;
    const ricsKey = uniqueMarketDataRics(rics).join('|');

    useEffect(() =>
    {
        const priceService = ServiceRegistry.getPriceService();
        const webWorker = new Worker(new URL('../workers/market-data-reader.js', import.meta.url));

        webWorker.onmessage = (event) =>
        {
            const marketData = event.data?.marketData;
            if (!marketData)
                return;

            priceService.cacheMarketDataTick(marketData);
        };

        return () =>
        {
            webWorker.onmessage = null;
            webWorker.terminate();
        };
    }, []);

    useEffect(() =>
    {
        const uniqueRics = ricsKey ? ricsKey.split('|') : [];
        if (!uniqueRics.length)
            return;

        const marketDataService = ServiceRegistry.getMarketDataService();
        let cancelled = false;
        let subscribedRics = [];

        const subscribe = async () =>
        {
            try
            {
                await marketDataService.subscribe(uniqueRics);
                if (cancelled)
                {
                    await marketDataService.unsubscribeAll(uniqueRics);
                    return;
                }

                subscribedRics = uniqueRics;
            }
            catch (error)
            {
                if (!cancelled)
                    loggerService.logError(`Failed to subscribe to market data: ${error.message}`);
            }
        };

        subscribe();

        return () =>
        {
            cancelled = true;
            if (!subscribedRics.length)
                return;

            marketDataService.unsubscribeAll(subscribedRics).catch(error =>
                loggerService.logError(`Failed to unsubscribe from market data: ${error.message}`));
        };
    }, [ricsKey, loggerService]);
};
