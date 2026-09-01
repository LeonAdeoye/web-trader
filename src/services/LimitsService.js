import {LoggerService} from "./LoggerService";

export class LimitsService
{
    #baseUrl = "http://localhost:20017";
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(LimitsService.name);
    }

    getDeskNotionalLimits = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/desk`, "desk notional limits");
    }

    saveDeskNotionalLimit = async (payload) =>
    {
        return this.#postJson(`${this.#baseUrl}/limits/desk`, payload, "desk notional limit");
    }

    getDeskUtilizations = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/desk/utilization`, "desk notional utilization");
    }

    getTraderNotionalLimits = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/trader`, "trader notional limits");
    }

    saveTraderNotionalLimit = async (payload) =>
    {
        return this.#postJson(`${this.#baseUrl}/limits/trader`, payload, "trader notional limit");
    }

    getTraderUtilizations = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/trader/utilization`, "trader notional utilization");
    }

    getPriceLimits = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/price`, "price limits");
    }

    savePriceLimit = async (payload) =>
    {
        return this.#postJson(`${this.#baseUrl}/limits/price`, payload, "price limit");
    }

    getQuantityLimits = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/qty`, "quantity limits");
    }

    saveQuantityLimit = async (payload) =>
    {
        return this.#postJson(`${this.#baseUrl}/limits/qty`, payload, "quantity limit");
    }

    getAdvLimits = async () =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/adv`, "ADV limits");
    }

    saveAdvLimit = async (payload) =>
    {
        return this.#postJson(`${this.#baseUrl}/limits/adv`, payload, "ADV limit");
    }

    getBreaches = async (category) =>
    {
        return this.#getJson(`${this.#baseUrl}/limits/breaches/${category}`, `${category} breaches`);
    }

    #getJson = async (url, label) =>
    {
        try
        {
            const response = await fetch(url);
            if (!response.ok)
            {
                this.#loggerService.logError(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch ${label}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error)
        {
            this.#loggerService.logError(`Error fetching ${label}: ${error.message}`);
            throw error;
        }
    }

    #postJson = async (url, payload, label) =>
    {
        try
        {
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });
            if (!response.ok)
            {
                this.#loggerService.logError(`Failed to save ${label}: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to save ${label}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error)
        {
            this.#loggerService.logError(`Error saving ${label}: ${error.message}`);
            throw error;
        }
    }
}
