import {LoggerService} from "./LoggerService";

export class RateService
{
    #rates;
    #loggerService;
    #defaultCurrencies = [
    { currencyCode: 'USD' },
    { currencyCode: 'EUR' },
    { currencyCode: 'GBP' },
    { currencyCode: 'JPY' },
    { currencyCode: 'HKD' },
    { currencyCode: 'SGD' },
    { currencyCode: 'KRW' },
    { currencyCode: 'INR' },
    { currencyCode: 'NZD' },
    { currencyCode: 'THB' },
    { currencyCode: 'CHF' },
    { currencyCode: 'AUD' },
    { currencyCode: 'CAD' },
    { currencyCode: 'CNY' }];

    constructor()
    {
        this.#rates = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadRates = async () =>
    {
        // Check if we already have cached data
        if (this.#rates && this.#rates.length > 0)
        {
            this.#loggerService.logInfo(`Using cached interest rate data (${this.#rates.length} records)`);
            return this.#rates;
        }

        try
        {
            const response = await fetch(`http://localhost:20015/rate`);
            if (response.ok)
            {
                const data = await response.json();
                if (data.length > 0)
                {
                    this.#rates = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} interest rate records: ${JSON.stringify(this.#rates)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero interest rate records.`);
            }
            else
                this.#loggerService.logError(`Failed to load interest rates: ${response.status}`);

        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading interest rates: ${error}`);
        }

        return this.#rates;
    }

    getRates = () =>
    {
        return this.#rates;
    }

    updateRate = async (currencyCode, interestRatePercentage, lastUpdatedBy) =>
    {
        const lastUpdatedOn = new Date().toISOString();
        
        const rateData =
        {
            currencyCode,
            interestRatePercentage,
            lastUpdatedBy,
            lastUpdatedOn
        };

        this.#loggerService.logInfo(`Updating interest rate for currency ${currencyCode}: ${JSON.stringify(rateData)}`);
        
        try
        {
            const response = await fetch(`http://localhost:20015/rate`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(rateData)
            });

            if (response.ok)
            {
                const updatedRate = await response.json();
                const existingIndex = this.#rates.findIndex(r => r.currencyCode === currencyCode);
                if (existingIndex !== -1)
                    this.#rates[existingIndex] = updatedRate;
                else
                    this.#rates.push(updatedRate);
                this.#loggerService.logInfo(`Successfully updated interest rate for currency ${currencyCode}: ${JSON.stringify(updatedRate)}`);
                return updatedRate;
            }
            else
            {
                this.#loggerService.logError(`Failed to update interest rate for currency ${currencyCode}: ${response.status}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Error updating interest rate for currency ${currencyCode}: ${error}`);
            throw error;
        }
    }

    createDefaultRates = (defaultRate = 5.0) =>
    {
        const defaultRates = this.#defaultCurrencies.map(currency => ({
            currencyCode: currency.currencyCode,
            interestRatePercentage: defaultRate,
            lastUpdatedBy: 'System',
            lastUpdatedOn: new Date().toISOString()
        }));

        this.#rates = defaultRates;
        this.#loggerService.logInfo(`Created default interest rates for ${defaultRates.length} currencies`);
        return defaultRates;
    }

    clear = () => 
    {
        this.#rates = [];
    }

    getInterestRate = (currencyCode, decimalPlace = 3) =>
    {
        const rateRecord = this.#rates.find(r => r.currencyCode === currencyCode);
        const rate = rateRecord ? rateRecord.interestRatePercentage : 0.1;
        return parseFloat(rate.toFixed(decimalPlace));
    }
}

