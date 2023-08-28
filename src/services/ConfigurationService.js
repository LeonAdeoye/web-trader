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

    async loadConfigurations(owner)
    {
        if(isEmptyString(owner))
            return;

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

    reloadConfigurations()
    {
        this.clear();
        this.loadConfigurations()
            .then(() => this.#loggerService.logInfo(`Reloaded configurations`));
    }

    getConfigsBelongingToOwner(owner)
    {
        if(this.#configurations.has(owner))
            return this.#configurations.get(owner);
        else
            return [];
    }

    getCachedConfigs()
    {
        const configs = [];

        for (const list of this.#configurations.values())
            configs.push(...list);

        return configs;
    }

    getConfigValue(owner, key)
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

    async addNewConfiguration(owner, key, value)
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

    clear()
    {
        this.#configurations.clear();
    }

    async deleteConfiguration(id)
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

    async uploadConfigurations(newConfigs)
    {

    }

    parseCSVData(csvData)
    {

    }

    async updateConfiguration(id, owner, key, value)
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
}
