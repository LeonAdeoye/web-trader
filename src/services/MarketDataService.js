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

    subscribeToCrypto = async (instrumentCodes) =>
    {
        try
        {
            this.#loggerService.logInfo(`Subscribing to crypto instruments: ${JSON.stringify(instrumentCodes)}`);
            
            const response = await fetch(`${this.#baseUrl}/crypto/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instrumentCodes: instrumentCodes
                })
            });

            if (!response.ok)
            {
                const errorData = await response.json();
                throw new Error(`Crypto subscription failed: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            this.#loggerService.logInfo(`Successfully subscribed to crypto instruments: ${JSON.stringify(instrumentCodes)}`);
            return result;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to subscribe to crypto instruments ${JSON.stringify(instrumentCodes)}: ${error.message}`);
            throw error;
        }
    }

    unsubscribeFromCrypto = async (instrumentCode) =>
    {
        try
        {
            this.#loggerService.logInfo(`Unsubscribing from crypto instrument: ${instrumentCode}`);
            
            const response = await fetch(`${this.#baseUrl}/crypto/unsubscribe/${instrumentCode}`, {
                method: 'DELETE'
            });

            if (!response.ok)
            {
                const errorData = await response.json();
                throw new Error(`Crypto unsubscription failed: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();
            this.#loggerService.logInfo(`Successfully unsubscribed from crypto instrument: ${instrumentCode}`);
            return result;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to unsubscribe from crypto instrument ${instrumentCode}: ${error.message}`);
            throw error;
        }
    }

    unsubscribeAllCrypto = async (instrumentCodes) =>
    {
        const unsubscribePromises = instrumentCodes.map(code => this.unsubscribeFromCrypto(code));
        try
        {
            await Promise.all(unsubscribePromises);
            this.#loggerService.logInfo(`Successfully unsubscribed from all crypto instruments: ${JSON.stringify(instrumentCodes)}`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to unsubscribe from some crypto instruments: ${error.message}`);
            throw error;
        }
    }
}
