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
        if(this.#exchangeRates && Object.keys(this.#exchangeRates).length > 0)
            return;

        await fetch('https://openexchangerates.org/api/latest.json?app_id=0d1601b10ca0490b960214675c968c6f')
            .then(response => response.json())
            .then(jsonResponse =>
            {
                this.#exchangeRates = jsonResponse.rates;
                this.#loggerService.logInfo("Exchange rates loaded.");
                console.log("1 USD to GBP: " + this.getExchangeRate('GBP'));
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getExchangeRate = (currencyCode, dp = 3) =>
    {
        const rate = this.#exchangeRates[currencyCode.toUpperCase()];
        const finalRate = rate !== undefined ? rate : 1.0;
        return parseFloat(finalRate.toFixed(dp));
    };

    convert = (amount, fromCurrency, toCurrency) =>
    {
        const fromRate = this.getExchangeRate(fromCurrency);
        const toRate = this.getExchangeRate(toCurrency);
        const amountNum = Number(amount);
        if (isNaN(amountNum) || typeof amountNum !== 'number')
        {
            throw new Error('Invalid amount for conversion.');
        }
        return (amountNum / fromRate) * toRate;
    }

    getCurrencyCodes = () =>
    {
        return Object.keys(this.#exchangeRates);
    }
}
