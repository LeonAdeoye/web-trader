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

        // Check if configurations are already cached
        if(this.#configurations.has(owner))
        {
            this.#loggerService.logInfo(`Using cached configurations for owner: ${owner}`);
            return;
        }

        // Only load from backend if cache is empty
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
        const updatedConfig = {owner: owner, key: key, value: value, lastUpdatedBy: owner, lastUpdatedOn: Date.now()};
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

    // High-level method to save or update multiple configurations
    saveOrUpdateConfigurations = async (owner, configObject) =>
    {
        try 
        {
            const configKeys = Object.keys(configObject);
            
            for (const key of configKeys)
            {
                if (configObject[key] !== undefined) 
                {
                    try
                    {
                        // Check if config already exists
                        const existingConfigs = this.getConfigsBelongingToOwner(owner);
                        const existingConfig = existingConfigs.find(config => config.key === key);
                        
                        if (existingConfig)
                        {
                            // Update existing configuration
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
                            // Add new configuration
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
}