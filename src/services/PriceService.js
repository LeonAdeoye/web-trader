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

    getLastTradePrice = (instrumentCode) =>
    {
        // TODO Create a market spring boot data price server for getting delayed market data prices.
        //  This backend service will publish delayed and throttled prices on an AMPS topic for this service to listen to.
        if (this.#prices)
        {
            const index = this.#prices.findIndex(p => p.instrumentCode === instrumentCode);
            if (index !== -1)
            {
                return this.#prices[index].closePrice;
            }
        }
    }

    loadPrices = async () =>
    {
        // Check if we already have cached data
        if (this.#prices && this.#prices.length > 0)
        {
            this.#loggerService.logInfo(`Using cached price data (${this.#prices.length} records)`);
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
                    this.#prices = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} price records: ${JSON.stringify(this.#prices)}`);
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
                // Set empty array if service fails
                this.#prices = [];
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading prices: ${error}`);
            // Set empty array if service fails
            this.#prices = [];
        }

        return this.#prices;
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
                this.#loggerService.logInfo(`Successfully updated price for ${instrumentCode}: ${JSON.stringify(updatedPrice)}`);
                
                // Update local data
                if (this.#prices)
                {
                    const index = this.#prices.findIndex(p => p.instrumentCode === instrumentCode);
                    if (index !== -1)
                    {
                        this.#prices[index] = updatedPrice;
                    }
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

    createDefaultPrices = (instruments, defaultClosePrice = 100.0, defaultOpenPrice = 99.0) =>
    {
        if (!instruments || instruments.length === 0)
        {
            this.#loggerService.logInfo('No instruments available to create default prices');
            this.#prices = [];
            return [];
        }

        const defaultPrices = instruments.map(instrument => ({
            instrumentCode: instrument.instrumentCode,
            closePrice: defaultClosePrice,
            openPrice: defaultOpenPrice,
            lastUpdatedBy: 'System',
            lastUpdatedOn: new Date().toISOString()
        }));

        this.#prices = defaultPrices;
        this.#loggerService.logInfo(`Created ${defaultPrices.length} default price records`);
        
        return defaultPrices;
    }
}
