import {LoggerService} from "./LoggerService";

export class ExchangeService
{
    #exchanges;
    #loggerService;

    constructor()
    {
        this.#exchanges = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadExchanges = async () =>
    {
        await fetch(`http://localhost:20009/exchange`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#exchanges = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} exchanges: ${JSON.stringify(this.#exchanges)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero exchanges.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getExchanges = () =>
    {
        return this.#exchanges;
    }

    addNewExchange = async (newExchange) =>
    {
        this.#loggerService.logInfo(`Saving new exchange: ${JSON.stringify(newExchange)}.`);
        return await fetch("http://localhost:20009/exchange", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newExchange)})
            .then(response => response.json())
            .then((exchangeResponse) => {
                this.#exchanges.push(exchangeResponse);
                this.#loggerService.logInfo(`Successfully saved exchange: ${JSON.stringify(exchangeResponse)}.`);
                return exchangeResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateExchange = async (exchangeToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating exchange: ${JSON.stringify(exchangeToUpdate)}.`);
        return await fetch(`http://localhost:20009/exchange`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(exchangeToUpdate)})
            .then(response => response.json())
            .then((exchangeResponse) => {
                for(const current of this.#exchanges) {
                    if(current.exchangeId === exchangeResponse.exchangeId) {
                        this.#exchanges[this.#exchanges.indexOf(current)] = exchangeResponse;
                        break;
                    }
                }
                this.#loggerService.logInfo(`Updated exchange: ${JSON.stringify(exchangeResponse)}.`);
                return exchangeResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteExchange = async (exchangeId) =>
    {
        return await fetch(`http://localhost:20009/exchange?exchangeId=${exchangeId}`, {method: "DELETE"})
            .then(() => {
                for(const current of this.#exchanges) {
                    if(current.exchangeId === exchangeId) {
                        this.#exchanges.splice(this.#exchanges.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted exchange with exchange Id: ${exchangeId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () => this.#exchanges.clear();
}
