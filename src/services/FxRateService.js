class FxRateService
{
    #exchangeRates

    constructor()
    {
        this.#exchangeRates = {}
    }

    setExchangeRate(rate)
    {
        this.#exchangeRates[rate.currency.toUpperCase()] = rate;
    }

    getExchangeRate(currencyCode, priceType='mid')
    {
        const rate = this.#exchangeRates[currencyCode.toUpperCase()][priceType];
        return rate !== undefined ? rate : 1.0;
    }

    getAllExchangeRates()
    {
        return this.#exchangeRates;
    }

    convert(amount, fromCurrency, toCurrency, priceType = 'mid')
    {
        const fromRate = this.getExchangeRate(fromCurrency, priceType);
        const toRate = this.getExchangeRate(toCurrency, priceType);

        if (isNaN(amount) || typeof amount !== 'number') {
            throw new Error('Invalid amount for conversion.');
        }

        return (amount / fromRate) * toRate;
    }
}

module.exports = FxRateService;
