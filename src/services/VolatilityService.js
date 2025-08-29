import {LoggerService} from "./LoggerService";

export class VolatilityService
{
    #volatilities;
    #loggerService;

    constructor()
    {
        this.#volatilities = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    getVolatilities = () =>
    {
        return this.#volatilities;
    }

    loadVolatilities = async () =>
    {
        try
        {
            const response = await fetch(`http://localhost:20015/volatility`);
            if (response.ok)
            {
                const data = await response.json();
                if (data.length > 0)
                {
                    this.#volatilities = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} volatility records: ${JSON.stringify(this.#volatilities)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero volatility records.`);
            }
            else
                this.#loggerService.logError(`Failed to load volatilities: ${response.status}`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading volatilities: ${error}`);
        }
    }

    updateVolatility = async (instrumentCode, volatilityPercentage, lastUpdatedBy) =>
    {
        const lastUpdatedOn = new Date().toISOString();
        
        const volatilityData =
        {
            instrumentCode,
            volatilityPercentage,
            lastUpdatedBy,
            lastUpdatedOn
        };

        this.#loggerService.logInfo(`Updating volatility for instrument ${instrumentCode}: ${JSON.stringify(volatilityData)}`);
        
        try
        {
            const response = await fetch(`http://localhost:20015/volatility`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(volatilityData)
            });

            if (response.ok)
            {
                const updatedVolatility = await response.json();
                const existingIndex = this.#volatilities.findIndex(v => v.instrumentCode === instrumentCode);
                if (existingIndex !== -1)
                    this.#volatilities[existingIndex] = updatedVolatility;
                else
                    this.#volatilities.push(updatedVolatility);
                
                this.#loggerService.logInfo(`Successfully updated volatility for instrument ${instrumentCode}: ${JSON.stringify(updatedVolatility)}`);
                return updatedVolatility;
            }
            else
            {
                this.#loggerService.logError(`Failed to update volatility for instrument ${instrumentCode}: ${response.status}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error updating volatility for instrument ${instrumentCode}: ${error}`);
            throw error;
        }
    }

    createDefaultVolatilities = (instruments, defaultVolatility = 20.0) =>
    {
        const defaultVolatilities = instruments.map(instrument =>
        ({
            instrumentCode: instrument.instrumentCode,
            instrumentName: instrument.instrumentName || instrument.instrumentCode,
            volatilityPercentage: defaultVolatility,
            lastUpdatedBy: 'System',
            lastUpdatedOn: new Date().toISOString()
        }));

        this.#volatilities = defaultVolatilities;
        this.#loggerService.logInfo(`Created default volatilities for ${defaultVolatilities.length} instruments`);
        return defaultVolatilities;
    }

    clear = () => this.#volatilities = [];

    getVolatility = (instrumentCode, decimalPlace = 3) =>
    {
        const volatilityRecord = this.#volatilities.find(v => v.instrumentCode === instrumentCode);
        const volatility = volatilityRecord ? volatilityRecord.volatilityPercentage : 0.2;
        return parseFloat(volatility.toFixed(decimalPlace));
    };
}
