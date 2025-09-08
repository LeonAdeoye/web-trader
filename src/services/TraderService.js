import {LoggerService} from "./LoggerService";

export class TraderService
{
    #traders;
    #loggerService;

    constructor() {
        this.#traders = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadTraders = async () =>
    {
        // Check if we already have cached data
        if (this.#traders && this.#traders.length > 0)
        {
            this.#loggerService.logInfo(`Using cached trader data (${this.#traders.length} records)`);
            return this.#traders;
        }

        await fetch('http://localhost:20009/trader')
            .then(response => response.json())
            .then(data =>
            {
                if (data.length > 0)
                {
                    this.#traders = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} traders: ${JSON.stringify(this.#traders)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero traders.`);
            })
            .catch(err => this.#loggerService.logError(err));

        return this.#traders;
    }

    getTraders = () =>
    {
        return this.#traders;
    }

    getTraderByUserId = (userId) =>
    {
        return this.#traders.find(trader => trader.userId === userId);
    }

    clear = () =>
    {
        this.#traders = [];
    }

    addNewTrader = async (newTrader) =>
    {
        const {traderId, ...rest} = newTrader;
        this.#loggerService.logInfo(`Saving new trader: ${JSON.stringify(newTrader)}.`);
        return await fetch("http://localhost:20009/trader", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(rest)})
            .then(response => response.json())
            .then((traderResponse) =>
            {
                this.#traders.push(traderResponse);
                this.#loggerService.logInfo(`Successfully saved trader: ${JSON.stringify(traderResponse)}.`);
                return traderResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateTrader = async (traderToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating trader: ${JSON.stringify(traderToUpdate)}.`);
        return await fetch(`http://localhost:20009/trader`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(traderToUpdate)})
            .then(response => response.json())
            .then((traderResponse) =>
            {
                for(const current of this.#traders)
                {
                    if(current.traderId === traderResponse.traderId)
                    {
                        this.#traders[this.#traders.indexOf(current)] = traderResponse;
                        break;
                    }
                }
                this.#loggerService.logInfo(`Updated trader: ${JSON.stringify(traderResponse)}.`);
                return traderResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteTrader = async (traderId) =>
    {
        return await fetch(`http://localhost:20009/trader?traderId=${traderId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#traders)
                {
                    if(current.traderId === traderId)
                    {
                        this.#traders.splice(this.#traders.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted trader with trader Id: ${traderId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getDeskId = (deskName) => 
    {
        if (!deskName) return null;
        const trader = this.#traders.find(trader => trader.desk === deskName);
        return trader ? trader.traderId : null;
    }

    getDeskName = (deskId) => 
    {
        if (!deskId) return null;
        const trader = this.#traders.find(trader => trader.traderId === deskId);
        return trader ? trader.desk : null;
    }
} 
