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

    loadExchangeRates = async () =>
    {
        await fetch('https://openexchangerates.org/api/latest.json?app_id=0d1601b10ca0490b960214675c968c6f')
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
    getExchangeRate = (currencyCode) =>
    {
        const rate = this.exchangeRates[currencyCode.toUpperCase()];
        return rate !== undefined ? rate : 1.0;
    }

    // Function to convert an amount from one currency to another
    convert = (amount, fromCurrency, toCurrency) =>
    {
        const fromRate = this.getExchangeRate(fromCurrency);
        const toRate = this.getExchangeRate(toCurrency);

        if (isNaN(amount) || typeof amount !== 'number') {
            throw new Error('Invalid amount for conversion.');
        }

        return (amount / fromRate) * toRate;
    }
}
