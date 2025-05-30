import {LoggerService} from "./LoggerService";

export class ReferenceDataService
{
    #instruments;
    #loggerService;

    constructor()
    {
        this.#instruments = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadInstruments = async () =>
    {
        if(this.#instruments.length !== 0)
            return;

        await fetch(`http://localhost:20009/instrument`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#instruments = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} instruments: ${JSON.stringify(this.#instruments)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero instruments.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getInstruments = () =>
    {
        return this.#instruments;
    }
}
