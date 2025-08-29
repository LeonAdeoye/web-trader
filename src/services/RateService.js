import {LoggerService} from "./LoggerService";

export class RateService
{
    #rates;
    #currencies;
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
        this.#currencies = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadRates = async () =>
    {
        try {
            const response = await fetch(`http://localhost:20009/rate`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    this.#rates = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} interest rate records: ${JSON.stringify(this.#rates)}`);
                } else {
                    this.#loggerService.logInfo(`Loaded zero interest rate records.`);
                }
            } else {
                this.#loggerService.logError(`Failed to load interest rates: ${response.status}`);
            }
        } catch (error) {
            this.#loggerService.logError(`Error loading interest rates: ${error}`);
        }
    }

    loadCurrencies = async () =>
    {
        try {
            const response = await fetch(`http://localhost:20009/currency`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    this.#currencies = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} currencies: ${JSON.stringify(this.#currencies)}`);
                } else {
                    this.#loggerService.logError(`Failed to load currencies: ${response.status}`);
                }
            } else {
                // If no currencies exist, create dummy ones for now
                this.#currencies = this.#defaultCurrencies;
                this.#loggerService.logInfo(`Created ${this.#currencies.length} dummy currencies for development`);
            }
        } catch (error) {
            // If API call fails, create dummy currencies
            this.#currencies = this.#defaultCurrencies;
            this.#loggerService.logInfo(`Created ${this.#currencies.length} dummy currencies due to API error`);
        }
    }

    getRates = () =>
    {
        return this.#rates;
    }

    getCurrencies = () =>
    {
        return this.#currencies;
    }

    getRateByCurrencyCode = (currencyCode) =>
    {
        return this.#rates.find(rate => rate.currencyCode === currencyCode);
    }

    updateRate = async (currencyCode, interestRatePercentage, lastUpdatedBy) =>
    {
        const lastUpdatedOn = new Date().toISOString();
        
        const rateData = {
            currencyCode,
            interestRatePercentage,
            lastUpdatedBy,
            lastUpdatedOn
        };

        this.#loggerService.logInfo(`Updating interest rate for currency ${currencyCode}: ${JSON.stringify(rateData)}`);
        
        try {
            const response = await fetch(`http://localhost:20009/rate`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(rateData)
            });

            if (response.ok) {
                const updatedRate = await response.json();
                
                // Update local cache
                const existingIndex = this.#rates.findIndex(r => r.currencyCode === currencyCode);
                if (existingIndex !== -1) {
                    this.#rates[existingIndex] = updatedRate;
                } else {
                    this.#rates.push(updatedRate);
                }
                
                this.#loggerService.logInfo(`Successfully updated interest rate for currency ${currencyCode}: ${JSON.stringify(updatedRate)}`);
                return updatedRate;
            } else {
                this.#loggerService.logError(`Failed to update interest rate for currency ${currencyCode}: ${response.status}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.#loggerService.logError(`Error updating interest rate for currency ${currencyCode}: ${error}`);
            throw error;
        }
    }

    createDefaultRates = (currencies, defaultRate = 5.0) =>
    {
        const defaultRates = currencies.map(currency => ({
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
        this.#currencies = [];
    }
}

