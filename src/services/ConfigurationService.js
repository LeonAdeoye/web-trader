import {LoggerService} from "./LoggerService";
import {isEmptyString} from "../utilities";

export class ConfigurationService
{
    #configurations;
    #loggerService;

    constructor()
    {
        this.#configurations = new Map();
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadConfigurations = async (owner) =>
    {
        if(isEmptyString(owner) || owner === null)
            return;

        if(this.#configurations.has(owner))
        {
            this.#loggerService.logInfo(`Using cached configurations for owner: ${owner}`);
            return;
        }

        await fetch(`http://localhost:20001/configurationByOwner?owner=${owner}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                    this.#configurations.set(owner, data);
                else
                    this.#loggerService.logInfo(`Loaded zero configurations for owner: ${owner}`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    reloadConfigurations = () =>
    {
        this.clear();
        this.loadConfigurations()
            .then(() => this.#loggerService.logInfo(`Reloaded configurations`));
    }

    getConfigsBelongingToOwner = (owner) =>
    {
        if(this.#configurations.has(owner))
            return this.#configurations.get(owner);
        else
            return [];
    }

    getCachedConfigs = () =>
    {
        const configs = [];

        for (const list of this.#configurations.values())
            configs.push(...list);

        return configs;
    }

    getConfigValue = (owner, key) =>
    {
        if(this.#configurations.has(owner))
        {
            const configurations = this.#configurations.get(owner);
            const configuration = configurations.find(configuration => configuration.key === key)
            if(configuration)
                return configuration.value;
        }
        return null;
    }

    addNewConfiguration = async (owner, key, value) =>
    {
        const newConfig = {owner: owner, key: key, value: value, lastUpdatedBy: owner, lastUpdatedOn: Date.now()};
        this.#loggerService.logInfo(`Saving configuration for owner: ${owner} and key: ${key} with value: ${value}`);
        return await fetch("http://localhost:20001/configuration", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newConfig)})
            .then(response => response.json())
            .then((configResponse) =>
            {
                if(this.#configurations.has(owner))
                    this.#configurations.get(owner).push(configResponse);
                else
                    this.#configurations.set(owner, [configResponse]);

                this.#loggerService.logInfo(`Saved configuration for owner: ${owner} and key: ${key} with value: ${value}`);

                return configResponse.id;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () =>
    {
        this.#configurations.clear();
    }

    deleteConfiguration = async (id) =>
    {
        fetch(`http://localhost:20001/configuration?id=${id}`, {method: "DELETE"})
            .then(() =>
            {
                for(const listOfConfigs of this.#configurations.values())
                {
                    for(const current of listOfConfigs)
                    {
                        if(current.id === id)
                        {
                            listOfConfigs.splice(listOfConfigs.indexOf(current), 1);
                            this.#loggerService.logInfo(`Successfully deleted configuration for id: ${id}`);
                            return;
                        }
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    uploadConfigurations = async (newConfigs) =>
    {

    }

    updateConfiguration = async (id, owner, key, value) =>
    {
        const updatedConfig = {id: id, owner: owner, key: key, value: value, lastUpdatedBy: owner, lastUpdatedOn: Date.now()};
        this.#loggerService.logInfo(`Updating configuration with id: ${id} for owner: ${owner} and key: ${key} with value: ${value}`);
        return await fetch("http://localhost:20001/configuration", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedConfig)})
            .then(response => response.json())
            .then((configResponse) =>
            {
                const listOfConfigs = this.#configurations.get(owner);
                for(const current of listOfConfigs)
                {
                    if(current.id === id)
                    {
                        listOfConfigs[listOfConfigs.indexOf(current)] = configResponse;
                        this.#configurations.set(owner, listOfConfigs);
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated configuration with id: ${id} for owner: ${owner} and key: ${key} with value: ${value}`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    saveOrUpdateConfigurations = async (owner, configObject) =>
    {
        try 
        {
            await this.loadConfigurations(owner);
            
            const configKeys = Object.keys(configObject);
            
            for (const key of configKeys)
            {
                if (configObject[key] !== undefined) 
                {
                    try
                    {
                        const existingConfigs = this.getConfigsBelongingToOwner(owner);
                        const existingConfig = existingConfigs.find(config => config.key === key);
                        
                        if (existingConfig)
                        {
                            await this.updateConfiguration(
                                existingConfig.id,
                                owner,
                                key,
                                configObject[key].toString()
                            );
                            this.#loggerService.logInfo(`Updated configuration: ${key} = ${configObject[key]}`);
                        }
                        else
                        {
                            await this.addNewConfiguration(
                                owner,
                                key,
                                configObject[key].toString()
                            );
                            this.#loggerService.logInfo(`Added new configuration: ${key} = ${configObject[key]}`);
                        }
                    } 
                    catch (error) 
                    {
                        this.#loggerService.logError(`Failed to persist configuration ${key}: ${error.message}`);
                    }
                }
            }
            
            this.#loggerService.logInfo(`Successfully persisted configurations for owner: ${owner}`);
        } 
        catch (error) 
        {
            this.#loggerService.logError(`Failed to save configurations: ${error.message}`);
        }
    }

    getAllApps = async () =>
    {
        this.#loggerService.logInfo("Received request for all apps.");
        try
        {
            const response = await fetch("http://localhost:20001/apps");
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            
            const apps = await response.json();
            this.#loggerService.logInfo(`Retrieved ${apps.length} apps`);
            return apps;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to get all apps: ${error.message}`);
            return [];
        }
    }

    getCryptoInstruments = async () =>
    {
        this.#loggerService.logInfo("Received request for crypto instruments.");
        try
        {
            await this.loadConfigurations("system");
            const cryptoInstruments = this.getConfigValue("system", "crypto-instruments");
            
            if (cryptoInstruments)
            {
                const instruments = JSON.parse(cryptoInstruments);
                this.#loggerService.logInfo(`Retrieved ${instruments.length} crypto instruments from configuration`);
                return instruments;
            }
            else
            {
                const defaultInstruments = ["BTC", "ETH", "XRP", "SOL", "ADA"];
                this.#loggerService.logInfo(`No crypto instruments found in configuration, using defaults: ${JSON.stringify(defaultInstruments)}`);
                return defaultInstruments;
            }
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to get crypto instruments: ${error.message}`);
            const defaultInstruments = ["BTC", "ETH", "XRP", "SOL", "ADA"];
            this.#loggerService.logInfo(`Using default crypto instruments due to error: ${JSON.stringify(defaultInstruments)}`);
            return defaultInstruments;
        }
    }

    getCryptoChartInterval = async () =>
    {
        this.#loggerService.logInfo("Received request for crypto chart interval.");
        try
        {
            await this.loadConfigurations("system");
            const intervalConfig = this.getConfigValue("system", "crypto-chart-interval");
            
            if (intervalConfig)
            {
                const interval = parseInt(intervalConfig);
                if (!isNaN(interval) && interval > 0)
                {
                    this.#loggerService.logInfo(`Retrieved crypto chart interval from configuration: ${interval} seconds`);
                    return interval;
                }
            }
            
            const defaultInterval = 30;
            this.#loggerService.logInfo(`No valid interval configuration found, using default: ${defaultInterval} seconds`);
            return defaultInterval;
        }
        catch (error)
        {
            this.#loggerService.logError(`Failed to get crypto chart interval: ${error.message}`);
            const defaultInterval = 30;
            this.#loggerService.logInfo(`Using default crypto chart interval due to error: ${defaultInterval} seconds`);
            return defaultInterval;
        }
    }
}