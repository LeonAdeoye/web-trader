import {LoggerService} from "./LoggerService";

export class ReferenceDataService
{
    #instruments;
    #loggerService;
    #exchanges;

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

    getInstrumentByCode = (instrumentCode) =>
    {
        return this.#instruments.find(instrument => instrument.instrumentCode === instrumentCode);
    }

    loadExchanges = async () =>
    {
        if(this.#exchanges && this.#exchanges.length > 0)
            return;

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
}
