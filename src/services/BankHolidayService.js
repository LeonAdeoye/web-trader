import {LoggerService} from "./LoggerService";

export class BankHolidayService
{
    #bankHolidays;
    #countries;
    #loggerService;

    constructor()
    {
        this.#bankHolidays = [];
        this.#countries = [
            {code: 'JP', name: 'Japan'},
            {code: 'HK', name: 'Hong Kong'}
        ];
        this.#loggerService = new LoggerService(this.constructor.name);
        this.initializeDefaultHolidays();
        this.cleanupFutureHolidays(); // Ensure cleanup happens immediately
    }

    initializeDefaultHolidays = () =>
    {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const cutoffDate = this.getCutoffDate();

        this.#countries.forEach(country =>
        {
            this.addDefaultHolidaysForCountry(country.code, currentYear);
            this.addDefaultHolidaysForCountry(country.code, nextYear);
        });

        // Filter out holidays that are too far in the future (after August 2026)
        this.#bankHolidays = this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holidayDate <= cutoffDate;
        });

        this.#loggerService.logInfo(`Initialized bank holidays for ${this.#countries.length} countries for ${currentYear}-${nextYear}, filtered to exclude holidays after August 2026`);
    }

    addDefaultHolidaysForCountry = (countryCode, year) =>
    {
        const holidays = this.getDefaultHolidaysForCountry(countryCode, year);
        holidays.forEach(holiday =>
        {
            this.#bankHolidays.push({
                id: this.generateId(),
                countryCode: countryCode,
                holidayName: holiday.name,
                holidayDate: holiday.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
                isPublicHoliday: true,
                description: holiday.description
            });
        });
    }

    getDefaultHolidaysForCountry = (countryCode, year) =>
    {
        const holidays = [];

        switch (countryCode)
        {
            case 'JP':
                holidays.push(
                    {name: 'New Year\'s Day', date: new Date(year, 0, 1), description: 'National holiday'},
                    {name: 'Coming of Age Day', date: this.getNthMondayOfMonth(year, 1, 2), description: 'Second Monday in January'},
                    {name: 'National Foundation Day', date: new Date(year, 1, 11), description: 'National holiday'},
                    {name: 'Emperor\'s Birthday', date: new Date(year, 1, 23), description: 'National holiday'},
                    {name: 'Vernal Equinox Day', date: new Date(year, 2, 20), description: 'National holiday'},
                    {name: 'Showa Day', date: new Date(year, 3, 29), description: 'National holiday'},
                    {name: 'Constitution Memorial Day', date: new Date(year, 4, 3), description: 'National holiday'},
                    {name: 'Greenery Day', date: new Date(year, 4, 4), description: 'National holiday'},
                    {name: 'Children\'s Day', date: new Date(year, 4, 5), description: 'National holiday'},
                    {name: 'Marine Day', date: this.getNthMondayOfMonth(year, 7, 3), description: 'Third Monday in July'},
                    {name: 'Mountain Day', date: new Date(year, 7, 11), description: 'National holiday'},
                    {name: 'Respect for the Aged Day', date: this.getNthMondayOfMonth(year, 9, 3), description: 'Third Monday in September'},
                    {name: 'Autumnal Equinox Day', date: new Date(year, 9, 23), description: 'National holiday'},
                    {name: 'Sports Day', date: this.getNthMondayOfMonth(year, 10, 2), description: 'Second Monday in October'},
                    {name: 'Culture Day', date: new Date(year, 10, 3), description: 'National holiday'},
                    {name: 'Labor Thanksgiving Day', date: new Date(year, 10, 23), description: 'National holiday'}
                );
                break;

            case 'HK':
                holidays.push(
                    {name: 'New Year\'s Day', date: new Date(year, 0, 1), description: 'Public holiday'},
                    {name: 'Chinese New Year', date: this.getChineseNewYear(year), description: 'Public holiday'},
                    {name: 'Good Friday', date: this.getGoodFriday(year), description: 'Public holiday'},
                    {name: 'Easter Monday', date: this.getEasterMonday(year), description: 'Public holiday'},
                    {name: 'Ching Ming Festival', date: new Date(year, 3, 5), description: 'Public holiday'},
                    {name: 'Labour Day', date: new Date(year, 4, 1), description: 'Public holiday'},
                    {name: 'Buddha\'s Birthday', date: this.getBuddhasBirthday(year), description: 'Public holiday'},
                    {name: 'Tuen Ng Festival', date: new Date(year, 5, 22), description: 'Public holiday'},
                    {name: 'Hong Kong Special Administrative Region Establishment Day', date: new Date(year, 6, 1), description: 'Public holiday'},
                    {name: 'Chung Yeung Festival', date: this.getChungYeungFestival(year), description: 'Public holiday'},
                    {name: 'Christmas Day', date: new Date(year, 11, 25), description: 'Public holiday'},
                    {name: 'Boxing Day', date: new Date(year, 11, 26), description: 'Public holiday'}
                );
                break;

            default:
                // Generic holidays for other countries
                holidays.push(
                    {name: 'New Year\'s Day', date: new Date(year, 0, 1), description: 'Public holiday'},
                    {name: 'Christmas Day', date: new Date(year, 11, 25), description: 'Public holiday'}
                );
                break;
        }

        return holidays;
    }

    getNthMondayOfMonth = (year, month, nth) =>
    {
        const firstDay = new Date(year, month, 1);
        const firstMonday = firstDay.getDay() === 1 ? 1 : (8 - firstDay.getDay()) % 7 + 1;
        return new Date(year, month, firstMonday + (nth - 1) * 7);
    }

    getNthThursdayOfMonth = (year, month, nth) =>
    {
        const firstDay = new Date(year, month, 1);
        const firstThursday = firstDay.getDay() === 4 ? 1 : (11 - firstDay.getDay()) % 7 + 1;
        return new Date(year, month, firstThursday + (nth - 1) * 7);
    }

    getGoodFriday = (year) =>
    {
        // Simplified Easter calculation (Meeus/Jones/Butcher algorithm)
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        
        const easter = new Date(year, month - 1, day);
        const goodFriday = new Date(easter);
        goodFriday.setDate(easter.getDate() - 2);
        return goodFriday;
    }

    getEasterMonday = (year) =>
    {
        const goodFriday = this.getGoodFriday(year);
        const easterMonday = new Date(goodFriday);
        easterMonday.setDate(goodFriday.getDate() + 3);
        return easterMonday;
    }

    getChineseNewYear = (year) =>
    {
        // Simplified Chinese New Year calculation (approximate)
        const baseDate = new Date(year, 0, 21); // Around January 21st
        const dayOffset = (year - 2000) * 0.2422; // Approximate lunar cycle
        const chineseNewYear = new Date(baseDate);
        chineseNewYear.setDate(baseDate.getDate() + Math.floor(dayOffset));
        return chineseNewYear;
    }

    getBuddhasBirthday = (year) =>
    {
        // Buddha's Birthday is typically in May
        return new Date(year, 4, 15);
    }

    getChungYeungFestival = (year) =>
    {
        // Chung Yeung Festival is typically in October
        return new Date(year, 9, 15);
    }

    loadBankHolidays = async () =>
    {
        try
        {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Clean up any holidays that are too far in the future
            this.cleanupFutureHolidays();
            
            this.#loggerService.logInfo(`Bank holiday service loaded ${this.#bankHolidays.length} holidays`);
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to load bank holidays: ${error}`);
        }
    }

    cleanupFutureHolidays = () =>
    {
        const cutoffDate = this.getCutoffDate();
        const initialCount = this.#bankHolidays.length;
        
        this.#bankHolidays = this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holidayDate <= cutoffDate;
        });
        
        const removedCount = initialCount - this.#bankHolidays.length;
        if (removedCount > 0)
            this.#loggerService.logInfo(`Removed ${removedCount} holidays that were after August 2026`);
    }

    getBankHolidays = () => 
    {
        // Filter out holidays that have already passed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        return this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holidayDate >= today;
        });
    }

    getAllBankHolidays = () => this.#bankHolidays; // Internal use - includes past holidays

    getBankHolidaysByCountry = (countryCode) =>
    {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        return this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holiday.countryCode === countryCode && holidayDate >= today;
        });
    }

    getBankHolidaysByDateRange = (startDate, endDate) =>
    {
        const cutoffDate = this.getCutoffDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        return this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holidayDate >= startDate && 
                   holidayDate <= endDate && 
                   holidayDate <= cutoffDate &&
                   holidayDate >= today;
        });
    }

    getHolidaysWithinNextYear = () =>
    {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const cutoffDate = this.getCutoffDate();
        
        return this.#bankHolidays.filter(holiday =>
        {
            const holidayDate = new Date(holiday.holidayDate);
            return holidayDate >= today && 
                   holidayDate <= nextYear && 
                   holidayDate <= cutoffDate;
        });
    }

    isBankHoliday = (date, countryCode) =>
    {
        let dateStr;
        if (typeof date === 'string')
            dateStr = date;
        else
            dateStr = date.toISOString().split('T')[0];
            
        return this.getAllBankHolidays().some(holiday =>
        {
            return holiday.holidayDate === dateStr && 
                   (!countryCode || holiday.countryCode === countryCode);
        });
    }

    calculateBusinessDays = (startDate, endDate, countryCode) =>
    {
        let businessDays = 0;
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        while (currentDate <= endDateObj)
        {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) // Skip weekends
            {
                if (!this.isBankHoliday(currentDate, countryCode))
                    businessDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return businessDays;
    }

    addBankHoliday = async (bankHoliday) =>
    {
        try
        {
            const newHoliday = {
                ...bankHoliday,
                id: this.generateId(),
                holidayDate: bankHoliday.holidayDate || new Date().toISOString().split('T')[0]
            };
            
            // Check if the holiday date is too far in the future
            const holidayDate = new Date(newHoliday.holidayDate);
            const cutoffDate = this.getCutoffDate();
            
            if (holidayDate > cutoffDate)
                throw new Error('Cannot add holidays after August 2026');
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.#bankHolidays.push(newHoliday);
            this.#loggerService.logInfo(`Added bank holiday: ${JSON.stringify(newHoliday)}`);
            return newHoliday;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to add bank holiday: ${error}`);
            throw error;
        }
    }

    updateBankHoliday = async (bankHoliday) =>
    {
        try
        {
            // Check if the updated holiday date is too far in the future
            if (bankHoliday.holidayDate)
            {
                const holidayDate = new Date(bankHoliday.holidayDate);
                const cutoffDate = this.getCutoffDate();
                
                if (holidayDate > cutoffDate)
                    throw new Error('Cannot update holidays to dates after August 2026');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const index = this.#bankHolidays.findIndex(h => h.id === bankHoliday.id);
            if (index !== -1)
            {
                this.#bankHolidays[index] = { ...bankHoliday };
                this.#loggerService.logInfo(`Updated bank holiday: ${JSON.stringify(bankHoliday)}`);
                return this.#bankHolidays[index];
            }
            throw new Error('Bank holiday not found');
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to update bank holiday: ${error}`);
            throw error;
        }
    }

    deleteBankHoliday = async (id) =>
    {
        try
        {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const index = this.#bankHolidays.findIndex(h => h.id === id);
            if (index !== -1)
            {
                const deletedHoliday = this.#bankHolidays.splice(index, 1)[0];
                this.#loggerService.logInfo(`Deleted bank holiday: ${JSON.stringify(deletedHoliday)}`);
                return deletedHoliday;
            }
            throw new Error('Bank holiday not found');
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to delete bank holiday: ${error}`);
            throw error;
        }
    }

    getCountries = () => this.#countries;

    getCountryByCode = (countryCode) =>
    {
        return this.#countries.find(country => country.code === countryCode);
    }

    generateId = () =>
    {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCutoffDate = () =>
    {
        return new Date(2026, 7, 31); // August 31, 2026
    }
}
