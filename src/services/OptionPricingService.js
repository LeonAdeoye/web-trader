import {LoggerService} from "./LoggerService";

export class OptionPricingService
{
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    /**
     * Calculate option price using REST pricing service
     * @param {Object} optionPricingRequest - The option pricing request object
     * @param {number} optionPricingRequest.strike - Strike price of the option
     * @param {number} optionPricingRequest.volatility - Volatility percentage (0-100)
     * @param {number} optionPricingRequest.underlyingPrice - Current price of the underlying asset
     * @param {number} optionPricingRequest.daysToExpiry - Days until option expiration
     * @param {number} optionPricingRequest.interestRate - Interest rate percentage (0-100)
     * @param {boolean} optionPricingRequest.isCall - True for call option, false for put option
     // * @param {boolean} optionPricingRequest.isEuropean - True for European option, false for American option
     * @param {number} optionPricingRequest.dayCountConvention - Day count convention (e.g., 360, 250, 365)
     * @returns {Promise<Object>} Promise resolving to OptionPriceResult object
     */
    async calculateOptionPrice(optionPricingRequest)
    {
        try
        {
            this.#loggerService.logInfo(`Calculating option price for request: ${JSON.stringify(optionPricingRequest)}`);
            const response = await fetch(`http://localhost:20015/pricing/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(optionPricingRequest)
            });

            if (!response.ok)
            {
                const errorText = await response.text();
                this.#loggerService.logError(`Pricing service returned error: ${response.status} - ${errorText}`);
                throw new Error(`Pricing service error: ${response.status} - ${errorText}`);
            }

            const optionPriceResult = await response.json();
            
            this.#loggerService.logInfo(`Successfully calculated option price: ${JSON.stringify(optionPriceResult)}`);
            
            return optionPriceResult;
        }
        catch (error)
        {
            this.#loggerService.logError(`Error calculating option price: ${error.message}`);
            throw error;
        }
    }
}
