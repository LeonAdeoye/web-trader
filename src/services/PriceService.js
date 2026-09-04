import {LoggerService} from "./LoggerService";

export class PriceService
{
    #prices;
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    getPrices = () =>
    {
        return this.#prices;
    }

    #getPrice = (instrumentCode) =>
    {
        if (!this.#prices || instrumentCode == null)
            return;

        return this.#prices.find(price => price.instrumentCode === instrumentCode);
    }

    #preserveLast = (incomingPrices) =>
    {
        return incomingPrices.map(incoming =>
        {
            const previous = this.#getPrice(incoming.instrumentCode);
            if (previous?.lastPrice == null)
                return incoming;

            return { ...incoming, lastPrice: previous.lastPrice };
        });
    }

    updateLastTradePrice = (instrumentCode, price) =>
    {
        if (instrumentCode == null || instrumentCode === '')
            return;

        const numericPrice = Number(price);
        if (price == null || price === '' || Number.isNaN(numericPrice))
            return;

        if (!this.#prices)
            this.#prices = [];

        const existing = this.#getPrice(instrumentCode);
        if (existing)
            existing.lastPrice = numericPrice;
        else
            this.#prices.push({ instrumentCode, lastPrice: numericPrice });
    }

    getLiveLastTradePrice = (instrumentCode) =>
    {
        return this.#getPrice(instrumentCode)?.lastPrice;
    }

    getLastTradePrice = (instrumentCode) =>
    {
        const price = this.#getPrice(instrumentCode);
        if (!price)
            return;

        return price.lastPrice ?? price.closePrice;
    }

    cacheMarketDataTick = (marketData) =>
    {
        if (!marketData)
            return;

        this.updateLastTradePrice(marketData.ric, marketData.price);
    }

    applyLiveUnderlyingPrice = (rfq) =>
    {
        if (!rfq)
            return rfq;

        const lastPrice = this.getLiveLastTradePrice(rfq.underlying);
        if (lastPrice == null)
            return rfq;

        return { ...rfq, underlyingPrice: lastPrice };
    }

    loadPrices = async (forceReload = false) =>
    {
        if (!forceReload && this.#prices && this.#prices.length > 0)
        {
            this.#loggerService.logDebug(`Using cached price data (${this.#prices.length} records)`);
            return this.#prices;
        }

        try
        {
            const response = await fetch(`http://localhost:20015/price`);
            if (response.ok)
            {
                const data = await response.json();
                if (data.length > 0)
                {
                    this.#prices = this.#preserveLast(data);
                    this.#loggerService.logDebug(`Loaded ${data.length} price records: ${JSON.stringify(this.#prices)}`);
                }
                else
                {
                    this.#loggerService.logInfo(`Loaded zero price records.`);
                    this.#prices = [];
                }
            }
            else
            {
                this.#loggerService.logError(`Failed to load prices: ${response.status}`);
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading prices: ${error}`);
        }

        return this.#prices ?? [];
    }

    async refreshPrices()
    {
        return this.loadPrices(true);
    }

    clearPriceCache()
    {
        this.#prices = null;
    }

    updatePrice = async (instrumentCode, closePrice, openPrice, lastUpdatedBy) =>
    {
        try
        {
            const response = await fetch(`http://localhost:20015/price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instrumentCode,
                    closePrice,
                    openPrice,
                    lastUpdatedBy
                })
            });

            if (response.ok)
            {
                const updatedPrice = await response.json();
                this.#loggerService.logDebug(`Successfully updated price for ${instrumentCode}: ${JSON.stringify(updatedPrice)}`);
                
                if (this.#prices)
                {
                    const index = this.#prices.findIndex(p => p.instrumentCode === instrumentCode);
                    if (index !== -1)
                        this.#prices[index] = { ...updatedPrice, lastPrice: this.#prices[index].lastPrice };
                }
                
                return updatedPrice;
            }
            else
            {
                const errorText = await response.text();
                this.#loggerService.logError(`Failed to update price: ${response.status} - ${errorText}`);
                throw new Error(`Price update failed: ${response.status} - ${errorText}`);
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error updating price: ${error.message}`);
            throw error;
        }
    }

    deletePrice = async (instrumentCode) =>
    {
        this.#loggerService.logDebug(`Deleting price for instrument ${instrumentCode}`);
        const response = await fetch(`http://localhost:20015/price/${encodeURIComponent(instrumentCode)}`, { method: "DELETE" });
        if (!response.ok)
            throw new Error(`Failed to delete price: ${response.status}`);

        if (this.#prices)
            this.#prices = this.#prices.filter(item => item.instrumentCode !== instrumentCode);

        this.#loggerService.logInfo(`Deleted price for instrument ${instrumentCode}`);
    }

    createDefaultPrices = (instruments, defaultClosePrice = 100.0, defaultOpenPrice = 99.0) =>
    {
        if (!instruments || instruments.length === 0)
        {
            this.#loggerService.logInfo('No instruments available to create default prices');
            this.#prices = [];
            return [];
        }

        const defaultPrices = this.#preserveLast(instruments.map(instrument => ({
            instrumentCode: instrument.instrumentCode,
            closePrice: defaultClosePrice,
            openPrice: defaultOpenPrice,
            lastUpdatedBy: 'System',
            lastUpdatedOn: new Date().toISOString()
        })));

        this.#prices = defaultPrices;
        this.#loggerService.logInfo(`Created ${defaultPrices.length} default price records`);
        
        return defaultPrices;
    }
}

export const refreshPriceData = async (priceService) =>
{
    const service = priceService?.loadPrices ? priceService : null;
    if (!service)
        return;

    return service.loadPrices(true);
};
