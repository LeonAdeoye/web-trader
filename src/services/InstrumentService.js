import {LoggerService} from "./LoggerService";

export class InstrumentService
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
        // Check if we already have cached data
        if (this.#instruments && this.#instruments.length > 0)
        {
            this.#loggerService.logInfo(`Using cached instrument data (${this.#instruments.length} records)`);
            return this.#instruments;
        }

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

        return this.#instruments;
    }

    getInstruments = () =>
    {
        return this.#instruments;
    }

    getInstrumentByCode = (instrumentCode) =>
    {
        return this.#instruments.find(instrument => instrument.instrumentCode === instrumentCode);
    }

    addNewInstrument = async (newInstrument) =>
    {
        this.#loggerService.logInfo(`Saving new instrument: ${JSON.stringify(newInstrument)}.`);
        return await fetch("http://localhost:20009/instrument", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newInstrument)})
            .then(response => response.json())
            .then((instrumentResponse) => {
                this.#instruments.push(instrumentResponse);
                this.#loggerService.logInfo(`Successfully saved instrument: ${JSON.stringify(instrumentResponse)}.`);
                return instrumentResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateInstrument = async (instrumentToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating instrument: ${JSON.stringify(instrumentToUpdate)}.`);
        return await fetch(`http://localhost:20009/instrument`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(instrumentToUpdate)})
            .then(response => response.json())
            .then((instrumentResponse) => {
                for(const current of this.#instruments) {
                    if(current.instrumentId === instrumentResponse.instrumentId) {
                        this.#instruments[this.#instruments.indexOf(current)] = instrumentResponse;
                        break;
                    }
                }
                this.#loggerService.logInfo(`Updated instrument: ${JSON.stringify(instrumentResponse)}.`);
                return instrumentResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteInstrument = async (instrumentId) =>
    {
        return await fetch(`http://localhost:20009/instrument/${instrumentId}`, {method: "DELETE"})
            .then(() => {
                for(const current of this.#instruments) {
                    if(current.instrumentId === instrumentId) {
                        this.#instruments.splice(this.#instruments.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted instrument with instrument Id: ${instrumentId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () => this.#instruments.clear();
}
