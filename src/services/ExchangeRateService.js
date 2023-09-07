import {LoggerService} from "./LoggerService";

export class ExchangeRateService
{
    #loggerService;
    #exchangeRates

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#exchangeRates = {}
    }

    async loadExchangeRates()
    {
        await fetch('https://openexchangerates.org/api/latest.json?app_id=62fe3c007da5482c8568c27cce515fbf')
            .then(response => response.json())
            .then(jsonResponse =>
            {
                this.exchangeRates = jsonResponse.rates;
                this.#loggerService.logInfo("Exchange rates loaded.");
                console.log("1 USD to GBP: " + this.getExchangeRate('GBP'));
            })
            .catch(error => this.#loggerService.logError(error));
    }

    // Function to get the exchange rate for a given currency
    getExchangeRate(currencyCode)
    {
        const rate = this.exchangeRates[currencyCode.toUpperCase()];
        return rate !== undefined ? rate : 1.0;
    }

    // Function to convert an amount from one currency to another
    convert(amount, fromCurrency, toCurrency)
    {
        const fromRate = this.getExchangeRate(fromCurrency);
        const toRate = this.getExchangeRate(toCurrency);

        if (isNaN(amount) || typeof amount !== 'number') {
            throw new Error('Invalid amount for conversion.');
        }

        return (amount / fromRate) * toRate;
    }
}
