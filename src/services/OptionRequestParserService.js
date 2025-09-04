import {LoggerService} from "./LoggerService";
import {BankHolidayService} from "../services/BankHolidayService";
import {InstrumentService} from "./InstrumentService";
import {VolatilityService} from "./VolatilityService";
import {RateService} from "./RateService";
import {PriceService} from "./PriceService";

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
        this.#bankHolidayService = new BankHolidayService();
        this.#instrumentService = new InstrumentService();
        this.#volatilityService = new VolatilityService();
        this.#interestRateService = new RateService();
        this.#priceService = new PriceService();
        this.#instrumentService.loadInstruments().then(() => this.#loggerService.logInfo(`Instruments loaded: ${this.#instrumentService.getInstruments().length}`));
        this.#volatilityService.loadVolatilities().then(() => this.#loggerService.logInfo(`Volatilities loaded: ${this.#volatilityService.getVolatilities().length}`));
        this.#interestRateService.loadRates().then(() => this.#loggerService.logInfo(`Interest rates loaded: ${this.#interestRateService.getRates().length}`));
        this.#bankHolidayService.loadBankHolidays().then(() => this.#loggerService.logInfo(`Bank holidays loaded: ${this.#bankHolidayService.getBankHolidays().length}`));
        this.#priceService.loadPrices().then(() => this.#loggerService.logInfo(`Prices loaded: ${this.#priceService.getPrices().length}`));

        this.#constants =
        {
            DEFAULT_VOLATILITY: 0.25,
            DEFAULT_INTEREST_RATE: 0.05,
            DEFAULT_DAY_COUNT_CONVENTION: 250,
            DEFAULT_CURRENCY: 'USD'
        };
    }

    isValidOptionRequest = (request) =>
    {
        const optionRequestPattern = /^[+-](?:1)?\d*[CP](?:,[+-](?:1)?\d*[CP])*\s+\d+(?:,\d+)*\s+\d{1,2}[A-Z]{3}\d{2,4}(?:,\d{1,2}[A-Z]{3}\d{2,4})*\s+[A-Z0-9]+(?:\.[A-Z]+)?(?:,[A-Z0-9]+(?:\.[A-Z]+)?)*$/;
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

    parseOptionMaturityDates = (delimitedDates, optionLegs) =>
    {
        if (!delimitedDates || !optionLegs || optionLegs.length === 0)
            return;

        const dates = delimitedDates.split(',').map(d => d.trim());
        
        if (dates.length === 1 && optionLegs.length > 1)
        {
            const maturityDate = this.parseDate(dates[0]);
            optionLegs.forEach(leg =>
            {
                leg.maturityDate = maturityDate;
                leg.daysToExpiry = this.calculateBusinessDaysToExpiry(new Date(), maturityDate);
            });
        }
        else if (dates.length === optionLegs.length)
        {
            optionLegs.forEach((leg, index) =>
            {
                const maturityDate = this.parseDate(dates[index]);
                leg.maturityDate = maturityDate;
                leg.daysToExpiry = this.calculateBusinessDaysToExpiry(new Date(), maturityDate);
            });
        }
        else
            this.#loggerService.logError(`Mismatch between dates (${dates.length}) and option legs (${optionLegs.length})`);

    }

    parseOptionUnderlyings = (delimitedUnderlyings, optionLegs) =>
    {
        if (!delimitedUnderlyings || !optionLegs || optionLegs.length === 0)
            return;

        const underlyings = delimitedUnderlyings.split(',').map(u => u.trim());
        
        if (underlyings.length === 1 && optionLegs.length > 1)
            optionLegs.forEach(leg => this.setOptionLegUnderlying(leg, underlyings[0]));
        else if (underlyings.length === optionLegs.length)
            optionLegs.forEach((leg, index) => this.setOptionLegUnderlying(leg, underlyings[index]));
        else
            this.#loggerService.logError(`Mismatch between underlyings (${underlyings.length}) and option legs (${optionLegs.length})`);
    }

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

    parseRequest = (request, parent) =>
    {
        const parts = request.trim().split(/\s+/);
        if (parts.length !== 4)
        {
            this.#loggerService.logError(`Invalid option request structure. Expected 4 RFQ snippet parts, got ${parts.length}`);
            return null;
        }

        const [optionTypes, strikes, dates, underlyings] = parts;

        const optionLegs = this.parseOptionTypes(optionTypes, parent);
        if (!optionLegs || optionLegs.length === 0)
            return null;

        this.parseOptionStrikes(strikes, optionLegs);
        this.parseOptionUnderlyings(underlyings, optionLegs);
        this.parseOptionMaturityDates(dates, optionLegs);
        return optionLegs;
    }

    parseOptionTypes = (request) =>
    {
        const optionLegs = [];
        const legStrings = request.split(',');

        legStrings.forEach(legString => {
            const match = legString.match(/^([+-])(?:(\d+))?([CP])$/);
            if (match) {
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
            } else {
                this.#loggerService.logError(`Invalid option leg format: ${legString}`);
            }
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
