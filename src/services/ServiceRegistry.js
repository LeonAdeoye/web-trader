import { VolatilityService } from './VolatilityService';
import { PriceService } from './PriceService';
import { RateService } from './RateService';
import { InstrumentService } from './InstrumentService';
import { BankHolidayService } from './BankHolidayService';
import { ClientService } from './ClientService';
import { TraderService } from './TraderService';
import { ExchangeRateService } from './ExchangeRateService';
import { ConfigurationService } from './ConfigurationService';
import { HealthCheckService } from './HealthCheckService';
import { AlertConfigurationsService } from './AlertConfigurationsService';
import { MarketDataService } from './MarketDataService';
import { RfqService } from './RfqService';
import { DeskService } from "./DeskService";

class ServiceRegistry
{
    static #services = new Map();

    static getService(serviceClass)
    {
        const serviceName = serviceClass.name;
        
        if (!this.#services.has(serviceName))
            this.#services.set(serviceName, new serviceClass());
        
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

    static getDeskService()
    {
        return this.getService(DeskService);
    }

    static getExchangeRateService()
    {
        return this.getService(ExchangeRateService);
    }

    static getConfigurationService()
    {
        return this.getService(ConfigurationService);
    }

    static getHealthCheckService()
    {
        return this.getService(HealthCheckService);
    }

    static getAlertConfigurationsService()
    {
        return this.getService(AlertConfigurationsService);
    }

    static getMarketDataService()
    {
        return this.getService(MarketDataService);
    }

    static getRfqService()
    {
        return this.getService(RfqService);
    }

    static async preloadAllServices(ownerId = null)
    {
        const services = [
            this.getVolatilityService(),
            this.getPriceService(),
            this.getRateService(),
            this.getInstrumentService(),
            this.getBankHolidayService(),
            this.getClientService(),
            this.getTraderService(),
            this.getExchangeRateService(),
            this.getConfigurationService(),
            this.getAlertConfigurationsService(),
            this.getMarketDataService(),
            this.getRfqService(),
            this.getDeskService()
        ];

        const loadPromises = [
            await services[0].loadVolatilities(),
            await services[1].loadPrices(),
            await services[2].loadRates(),
            await services[3].loadInstruments(),
            await services[4].loadBankHolidays(),
            await services[5].loadClients(),
            await services[6].loadTraders(),
            await services[7].loadExchangeRates(),
            await services[9].loadAlertTypes(),
            await services[10].loadAlertConfigurations(),
            await services[11].loadDesks()
        ];

        if (ownerId)
        {
            loadPromises.push(services[8].loadConfigurations(ownerId));
        }

        await Promise.all(loadPromises);
    }

    // Service configuration for health monitoring
    static getServicesConfig()
    {
        return [
            { name: 'Configuration Service', port: 20001, actuatorUrl: 'http://localhost:20001/health' },
            { name: 'Logging Service', port: 20002, actuatorUrl: 'http://localhost:20002/health' },
            { name: 'Users Service', port: 20003, actuatorUrl: 'http://localhost:20003/health' },
            { name: 'Domain Service', port: 20009, actuatorUrl: 'http://localhost:20009/health' },
            { name: 'Alert Service', port: 20012, actuatorUrl: 'http://localhost:20012/health' },
            { name: 'Order Service', port: 20013, actuatorUrl: 'http://localhost:20013/health' },
            { name: 'Exchange Service', port: 20014, actuatorUrl: 'http://localhost:20014/health' },
            { name: 'Limits Service', port: 20017, actuatorUrl: 'http://localhost:20017/health' },
            { name: 'Pricing Service', port: 20015, actuatorUrl: 'http://localhost:20015/health' },
            { name: 'IOI Service', port: 20018, actuatorUrl: 'http://localhost:20018/health' },
            { name: 'Market Data Service', port: 20019, actuatorUrl: 'http://localhost:20019/health' },
            { name: 'RFQ Service', port: 20020, actuatorUrl: 'http://localhost:20020/health' }
        ];
    }

    static async checkAllServicesHealth()
    {
        const healthCheckService = this.getHealthCheckService();
        const servicesConfig = this.getServicesConfig();
        
        return await healthCheckService.checkAllServicesHealth(servicesConfig);
    }
}

export { ServiceRegistry };
