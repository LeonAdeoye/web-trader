import {LoggerService} from "./LoggerService";

export class DataService
{
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    async get(url)
    {
        let data = [];

        await fetch(url)
            .then(response => response.json())
            .then(jsonResponse => data = jsonResponse)
            .catch(error => this.#loggerService.logError(error));

        return data;
    }
}
