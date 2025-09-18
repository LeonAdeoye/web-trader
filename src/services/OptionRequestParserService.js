import {LoggerService} from "./LoggerService";
import { ServiceRegistry } from './ServiceRegistry';

export class OptionRequestParserService
{
    #loggerService;
    #bankHolidayService;
    #instrumentService;
    #volatilityService;
    #interestRateService;
    #priceService;
    #constants;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#bankHolidayService = ServiceRegistry.getBankHolidayService();
        this.#instrumentService = ServiceRegistry.getInstrumentService();
        this.#volatilityService = ServiceRegistry.getVolatilityService();
        this.#interestRateService = ServiceRegistry.getRateService();
        this.#priceService = ServiceRegistry.getPriceService();
        this.#loadReferenceData();
        
        this.#constants =
        {
            DEFAULT_VOLATILITY: 0.25,
            DEFAULT_INTEREST_RATE: 0.05,
            DEFAULT_DAY_COUNT_CONVENTION: 250,
            DEFAULT_CURRENCY: 'USD'
        };
    }

    async #loadReferenceData()
    {
        try
        {
            await Promise.all([
                this.#instrumentService.loadInstruments(),
                this.#volatilityService.loadVolatilities(),
                this.#interestRateService.loadRates(),
                this.#bankHolidayService.loadBankHolidays(),
                this.#priceService.loadPrices()
            ]);
            
            this.#loggerService.logInfo(`Reference data loaded successfully`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Error loading reference data: ${error.message}`);
        }
    }

    isValidOptionRequest = (request) =>
    {
        const optionRequestPattern = /^[+-](?:1)?\d*[CP](?:,[+-](?:1)?\d*[CP])*\s+\d+(?:,\d+)*\s+\d{1,2}[A-Z]{3}\d{2,4}(?:,\d{1,2}[A-Z]{3}\d{2,4})*\s+[A-Z0-9]+(?:\.[A-Z]+)?$/;
        return optionRequestPattern.test(request);
    };

    parseOptionStrikes = (delimitedStrikes, optionLegs) =>
    {
        if (!delimitedStrikes || !optionLegs || optionLegs.length === 0)
            return;

        const strikes = delimitedStrikes.split(',').map(s => parseFloat(s.trim()));
        if (strikes.length === 1 && optionLegs.length > 1)
            optionLegs.forEach(leg => leg.strike = strikes[0]);
        else if (strikes.length === optionLegs.length)
            optionLegs.forEach((leg, index) => leg.strike = strikes[index]);
        else
            this.#loggerService.logError(`Mismatch between strikes (${strikes.length}) and option legs (${optionLegs.length})`);
    }

    parseOptionMaturityDate = (matDate, optionLegs) =>
    {
        const maturityDate = this.parseDate(matDate);
        optionLegs.forEach(leg =>
        {
            leg.maturityDate = maturityDate;
            leg.daysToExpiry = this.calculateBusinessDaysToExpiry(new Date(), maturityDate);
        });
    }

    parseOptionUnderlying = (underlying, optionLegs) => optionLegs.forEach(leg => this.setOptionLegUnderlying(leg, underlying));

    setOptionLegUnderlying = (optionLeg, underlying) =>
    {
        optionLeg.underlying = underlying;
        optionLeg.volatility = this.#volatilityService.getVolatility(underlying) || this.#constants.DEFAULT_VOLATILITY;
        optionLeg.dayCountConvention = this.#constants.DEFAULT_DAY_COUNT_CONVENTION;
        optionLeg.underlyingPrice = this.#priceService.getLastTradePrice(underlying);
        const instrument = this.#instrumentService.getInstrumentByCode(underlying);
        if (instrument?.settlementCurrency)
            optionLeg.currency = instrument.settlementCurrency;
        else
            optionLeg.currency = this.#constants.DEFAULT_CURRENCY;
        optionLeg.interestRate = this.#interestRateService.getInterestRate(optionLeg.currency) || this.#constants.DEFAULT_INTEREST_RATE;
    }

    parseRequest = (request) =>
    {
        const parts = request.trim().split(/\s+/);
        if (parts.length !== 4)
        {
            this.#loggerService.logError(`Invalid option request structure. Expected 4 RFQ snippet parts, got ${parts.length}`);
            return null;
        }

        const [optionTypes, strikes, maturityDate, underlying] = parts;
        const optionLegs = this.parseOptionTypes(optionTypes);
        if (!optionLegs || optionLegs.length === 0)
            return null;

        this.parseOptionStrikes(strikes, optionLegs);
        this.parseOptionUnderlying(underlying, optionLegs);
        this.parseOptionMaturityDate(maturityDate, optionLegs);
        return optionLegs;
    }

    parseOptionTypes = (request) =>
    {
        const optionLegs = [];
        const legStrings = request.split(',');
        legStrings.forEach(legString =>
        {
            const match = legString.match(/^([+-])(?:(\d+))?([CP])$/);
            if (match)
            {
                const [, side, quantity, optionType] = match;
                const parsedQuantity = quantity ? parseInt(quantity) : 1;

                optionLegs.push({
                    side: side === '+' ? 'BUY' : 'SELL',
                    quantity: parsedQuantity,
                    optionType: optionType === 'C' ? 'CALL' : 'PUT',
                    strike: null,
                    maturityDate: null,
                    underlying: null,
                    volatility: null,
                    interestRate: null,
                    dayCountConvention: null,
                    currency: null,
                    daysToExpiry: null
                });
            }
            else
                this.#loggerService.logError(`Invalid option leg format: ${legString}`);
        });

        return optionLegs;
    };

    parseDate = (dateStr) =>
    {
        const months = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };

        const match = dateStr.match(/^(\d{1,2})([A-Z]{3})(\d{2,4})$/);
        if (match)
        {
            const [, day, month, year] = match;
            if(year.length === 2)
                return new Date(2000 + parseInt(year), months[month], parseInt(day));
            else
                return new Date(parseInt(year), months[month], parseInt(day));
        }

        this.#loggerService.logError(`Invalid date format: ${dateStr}`);
        return null;
    }

    calculateBusinessDaysToExpiry = (tradeDate, maturityDate) =>
    {
        if (!tradeDate || !maturityDate)
            return 0;

        let businessDays = 0;
        const currentDate = new Date(tradeDate);
        
        while (currentDate < maturityDate)
        {
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)
            {
                if (!this.#bankHolidayService.isBankHoliday(currentDate))
                    businessDays++;
            }
        }

        return businessDays;
    }

    calculateSettlementDate(endDate, settlementDays = 2)
    {
        if (!endDate || settlementDays < 1)
            return endDate;

        let businessDaysAdded = 0;
        const settlementDate = new Date(endDate);

        while (businessDaysAdded < settlementDays)
        {
            settlementDate.setDate(settlementDate.getDate() + 1);
            if (settlementDate.getDay() !== 0 && settlementDate.getDay() !== 6)
            {
                if (!this.#bankHolidayService.isBankHoliday(settlementDate))
                    businessDaysAdded++;
            }
        }

        return settlementDate.toLocaleDateString();
    }
}
