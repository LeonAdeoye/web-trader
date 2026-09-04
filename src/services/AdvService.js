import {LoggerService} from "./LoggerService";

export class AdvService
{
    #advs;
    #loggerService;

    constructor()
    {
        this.#advs = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    getAdvs = () =>
    {
        return this.#advs;
    }

    loadAdvs = async () =>
    {
        if (this.#advs && this.#advs.length > 0)
        {
            this.#loggerService.logDebug(`Using cached ADV data (${this.#advs.length} records)`);
            return this.#advs;
        }

        try
        {
            const response = await fetch(`http://localhost:20015/adv`);
            if (response.ok)
            {
                const data = await response.json();
                if (data.length > 0)
                {
                    this.#advs = data;
                    this.#loggerService.logDebug(`Loaded ${data.length} ADV records: ${JSON.stringify(this.#advs)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero ADV records.`);
            }
            else
                this.#loggerService.logError(`Failed to load ADVs: ${response.status}`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading ADVs: ${error}`);
        }

        return this.#advs;
    }

    updateAdv = async (instrumentCode, adv, lastUpdatedBy) =>
    {
        const lastUpdatedOn = new Date().toISOString();

        const advData =
        {
            instrumentCode,
            adv,
            lastUpdatedBy,
            lastUpdatedOn
        };

        this.#loggerService.logDebug(`Updating ADV for instrument ${instrumentCode}: ${JSON.stringify(advData)}`);

        try
        {
            const response = await fetch(`http://localhost:20015/adv`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(advData)
            });

            if (response.ok)
            {
                const updatedAdv = await response.json();
                const existingIndex = this.#advs.findIndex(item => item.instrumentCode === instrumentCode);
                if (existingIndex !== -1)
                    this.#advs[existingIndex] = updatedAdv;
                else
                    this.#advs.push(updatedAdv);

                this.#loggerService.logDebug(`Successfully updated ADV for instrument ${instrumentCode}: ${JSON.stringify(updatedAdv)}`);
                return updatedAdv;
            }
            else
            {
                this.#loggerService.logError(`Failed to update ADV for instrument ${instrumentCode}: ${response.status}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error updating ADV for instrument ${instrumentCode}: ${error}`);
            throw error;
        }
    }

    deleteAdv = async (instrumentCode) =>
    {
        this.#loggerService.logDebug(`Deleting ADV for instrument ${instrumentCode}`);
        const response = await fetch(`http://localhost:20015/adv/${encodeURIComponent(instrumentCode)}`, { method: "DELETE" });
        if (!response.ok)
            throw new Error(`Failed to delete ADV: ${response.status}`);

        this.#advs = this.#advs.filter(item => item.instrumentCode !== instrumentCode);
        this.#loggerService.logInfo(`Deleted ADV for instrument ${instrumentCode}`);
    }

    createDefaultAdvs = async (instruments, lastUpdatedBy = 'System') =>
    {
        const defaultAdvs = [];

        for (const instrument of instruments)
        {
            const randomAdv = Math.floor(Math.random() * (20_000_000 - 1_000_000 + 1)) + 1_000_000;
            try
            {
                const saved = await this.updateAdv(instrument.instrumentCode, randomAdv, lastUpdatedBy);
                defaultAdvs.push(saved);
            }
            catch (error)
            {
                const fallback =
                {
                    instrumentCode: instrument.instrumentCode,
                    instrumentName: instrument.instrumentName || instrument.instrumentCode,
                    adv: randomAdv,
                    lastUpdatedBy,
                    lastUpdatedOn: new Date().toISOString()
                };
                defaultAdvs.push(fallback);
                this.#loggerService.logError(`Failed to persist default ADV for ${instrument.instrumentCode}: ${error}`);
            }
        }

        this.#advs = defaultAdvs;
        this.#loggerService.logInfo(`Created default ADVs for ${defaultAdvs.length} instruments`);
        return defaultAdvs;
    }

    clear = () => this.#advs = [];

    getAdv = (instrumentCode) =>
    {
        const advRecord = this.#advs.find(item => item.instrumentCode === instrumentCode);
        return advRecord ? advRecord.adv : null;
    };
}
