class FxRateService
{
    #exchangeRates

    constructor()
    {
        this.#exchangeRates = {}
    }

    setExchangeRate({currency, rate})
    {
        this.#exchangeRates[currency.toUpperCase()] = rate;
    }

    getExchangeRate(currencyCode)
    {
        const rate = this.#exchangeRates[currencyCode.toUpperCase()];
        return rate !== undefined ? rate : 1.0;
    }

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

module.exports = FxRateService;
