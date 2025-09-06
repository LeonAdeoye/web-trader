import { VolatilityService } from './VolatilityService';
import { PriceService } from './PriceService';
import { RateService } from './RateService';
import { InstrumentService } from './InstrumentService';
import { BankHolidayService } from './BankHolidayService';
import { ClientService } from './ClientService';
import { TraderService } from './TraderService';
import { ExchangeRateService } from './ExchangeRateService';

class ServiceRegistry
{
    static #services = new Map();

    static getService(serviceClass)
    {
        const serviceName = serviceClass.name;
        
        if (!this.#services.has(serviceName))
        {
            this.#services.set(serviceName, new serviceClass());
        }
        
        return this.#services.get(serviceName);
    }

    static getVolatilityService()
    {
        return this.getService(VolatilityService);
    }

    static getPriceService()
    {
        return this.getService(PriceService);
    }

    static getRateService()
    {
        return this.getService(RateService);
    }

    static getInstrumentService()
    {
        return this.getService(InstrumentService);
    }

    static getBankHolidayService()
    {
        return this.getService(BankHolidayService);
    }

    static getClientService()
    {
        return this.getService(ClientService);
    }

    static getTraderService()
    {
        return this.getService(TraderService);
    }

    static getExchangeRateService()
    {
        return this.getService(ExchangeRateService);
    }

    // Method to preload all services
    static async preloadAllServices()
    {
        const services = [
            this.getVolatilityService(),
            this.getPriceService(),
            this.getRateService(),
            this.getInstrumentService(),
            this.getBankHolidayService(),
            this.getClientService(),
            this.getTraderService(),
            this.getExchangeRateService()
        ];

        await Promise.all([
            services[0].loadVolatilities(),
            services[1].loadPrices(),
            services[2].loadRates(),
            services[3].loadInstruments(),
            services[4].loadBankHolidays(),
            services[5].loadClients(),
            services[6].loadTraders(),
            services[7].loadExchangeRates()
        ]);
    }
}

export { ServiceRegistry };
