import {LoggerService} from "./LoggerService";
import {BankHolidayService} from "../services/BankHolidayService";

export class OptionRequestParserService
{
    #loggerService;
    #bankHolidayService;
    #constants;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#bankHolidayService = new BankHolidayService();

        this.#constants = {
            DEFAULT_VOLATILITY: 0.25,
            DEFAULT_INTEREST_RATE: 0.05,
            DEFAULT_DAY_COUNT_CONVENTION: 'ACT/365',
            DEFAULT_CURRENCY: 'USD'
        };
    }

    isValidOptionRequest = (request) =>
    {
        const optionRequestPattern = /^[+-]\d+[CP](?:,[+-]\d+[CP])*\s+\d+(?:,\d+)*\s+\d{1,2}[A-Z]{3}\d{4}(?:,\d{1,2}[A-Z]{3}\d{4})*\s+[A-Z0-9]+(?:\.[A-Z]+)?(?:,[A-Z0-9]+(?:\.[A-Z]+)?)*$/;
        return optionRequestPattern.test(request);
    }

    parseOptionStrikes = (delimitedStrikes, optionLegs) =>
    {
        if (!delimitedStrikes || !optionLegs || optionLegs.length === 0)
            return;

        const strikes = delimitedStrikes.split(',').map(s => parseFloat(s.trim()));
        
        if (strikes.length === 1 && optionLegs.length > 1)
            optionLegs.forEach(leg => leg.strikePrice = strikes[0]);
        else if (strikes.length === optionLegs.length)
            optionLegs.forEach((leg, index) => leg.strikePrice = strikes[index]);
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
            // Apply single date to all legs
            const maturityDate = this.parseDate(dates[0]);
            optionLegs.forEach(leg =>
            {
                leg.maturityDate = maturityDate;
                leg.daysToExpiry = this.calculateBusinessDaysToExpiry(new Date(), maturityDate);
            });
        }
        else if (dates.length === optionLegs.length)
        {
            // Assign dates to corresponding legs
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
        optionLeg.volatility = this.#constants.DEFAULT_VOLATILITY;
        optionLeg.interestRate = this.#constants.DEFAULT_INTEREST_RATE;
        optionLeg.dayCountConvention = this.#constants.DEFAULT_DAY_COUNT_CONVENTION;
        optionLeg.currency = this.#constants.DEFAULT_CURRENCY;
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

        legStrings.forEach(legString =>
        {
            const match = legString.match(/^([+-])(\d+)([CP])$/);
            if (match)
            {
                const [, side, quantity, optionType] = match;
                optionLegs.push({
                    side: side === '+' ? 'BUY' : 'SELL',
                    quantity: parseInt(quantity),
                    optionType: optionType === 'C' ? 'CALL' : 'PUT',
                    strikePrice: null,
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
    }

    parseDate = (dateStr) =>
    {
        const months = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };

        const match = dateStr.match(/^(\d{1,2})([A-Z]{3})(\d{4})$/);
        if (match)
        {
            const [, day, month, year] = match;
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
            
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)
            {
                // Skip bank holidays if bankHolidayManager is available
                if (this.#bankHolidayService.isBankHoliday(currentDate))
                    businessDays++;
            }
        }

        return businessDays;
    }

    createSampleOptionDetail = () =>
    {
        return {
            side: 'BUY',
            quantity: 1,
            optionType: 'CALL',
            strikePrice: 100,
            maturityDate: new Date(),
            underlying: 'AAPL.OQ',
            volatility: this.#constants.DEFAULT_VOLATILITY,
            interestRate: this.#constants.DEFAULT_INTEREST_RATE,
            dayCountConvention: this.#constants.DEFAULT_DAY_COUNT_CONVENTION,
            currency: this.#constants.DEFAULT_CURRENCY,
            daysToExpiry: 30
        };
    }
}
