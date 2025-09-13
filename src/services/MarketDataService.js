import {LoggerService} from "./LoggerService";

export class MarketDataService
{
    #loggerService;
    #baseUrl;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#baseUrl = 'http://localhost:20019'; // Market Data Service port
    }

    subscribe = async (rics) =>
    {
        try
        {
            this.#loggerService.logInfo(`Subscribing to RICs: ${JSON.stringify(rics)}`);
            
            const response = await fetch(`${this.#baseUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rics: rics,
                    dataSource: null
                })
            });

            if (!response.ok)
            {
                const errorData = await response.json();
                throw new Error(`Subscription failed: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            this.#loggerService.logInfo(`Successfully subscribed to RICs: ${JSON.stringify(rics)}`);
            return result;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to subscribe to RICs ${JSON.stringify(rics)}: ${error.message}`);
            throw error;
        }
    }

    unsubscribe = async (ric) =>
    {
        try
        {
            this.#loggerService.logInfo(`Unsubscribing from RIC: ${ric}`);
            
            const response = await fetch(`${this.#baseUrl}/unsubscribe/${ric}`, {
                method: 'DELETE'
            });

            if (!response.ok)
            {
                const errorData = await response.json();
                throw new Error(`Unsubscription failed: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            this.#loggerService.logInfo(`Successfully unsubscribed from RIC: ${ric}`);
            return result;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to unsubscribe from RIC ${ric}: ${error.message}`);
            throw error;
        }
    }

    unsubscribeAll = async (rics) =>
    {
        const unsubscribePromises = rics.map(ric => this.unsubscribe(ric));
        try
        {
            await Promise.all(unsubscribePromises);
            this.#loggerService.logInfo(`Successfully unsubscribed from all RICs: ${JSON.stringify(rics)}`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to unsubscribe from some RICs: ${error.message}`);
            throw error;
        }
    }
}
