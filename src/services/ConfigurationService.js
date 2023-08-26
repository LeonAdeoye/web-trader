import {LoggerService} from "./LoggerService";

export class ConfigurationService
{
    #configurations;
    #loggerService;
    #user

    constructor(user)
    {
        this.#user = user;
        this.#configurations = new Map();
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    async loadConfigurations(owner)
    {
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
            .then(() => this.#loggerService.logInfo(`Reloaded configurations for user ${this.#user}`));
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

    set(owner, key, value)
    {
        const newConfig = {owner: owner, key: key, value: value, lastUpdatedBy: this.#user, lastUpdatedOn: new Date()};
        fetch("http://localhost:20001/configuration", {
            method: "POST",
            contentType: "application/json",
            body: JSON.stringify(newConfig)})
            .then(() =>
            {
                if(this.#configurations.has(owner))
                {
                    const configurations = this.#configurations.get(owner);
                    const configuration = configurations.find(configuration => configuration.key === key)

                    if(configuration)
                        configuration.value = value;
                    else
                        configurations.push(newConfig);
                }
                else
                    this.#configurations.set(owner, [newConfig]);

                this.#loggerService.logInfo(`Saved configuration for owner ${owner} and key ${key} with value ${value} by ${this.#user}`);
            });
    }

    remove(owner, key)
    {
        fetch(`http://localhost:20001/configuration?owner=${owner}&key=${key}`, {method: "DELETE"})
            .then(() =>
            {
                if(this.#configurations.has(owner))
                {
                    const configurations = this.#configurations.get(owner);
                    const configuration = configurations.find(configuration => configuration.key === key)

                    if(configuration)
                        configurations.splice(configurations.indexOf(configuration), 1);
                    else
                        throw new Error(`Cannot remove configuration for owner ${owner} and key ${key} because key does not exist.`);

                    this.#loggerService.logInfo(`Removed configuration for owner ${owner} and key ${key} by ${owner}`);
                }
                else
                    throw new Error(`Cannot remove configuration for owner ${owner} because owner does not exist.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear()
    {
        this.#configurations.clear();
    }

    async addConfiguration(owner, key, value)
    {
        const newConfig = {owner: owner, key: key, value: value, lastUpdatedBy: owner, lastUpdatedOn: new Date()};
        fetch(`http://localhost:20001/configuration`, {
            method: "POST",
            body: JSON.stringify(newConfig)})
            .then(() =>
            {
                if(this.#configurations.has(owner))
                {
                    const configurations = this.#configurations.get(owner);
                    configurations.push(newConfig);
                }
                else
                    this.#configurations.set(owner, [newConfig]);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    async deleteConfiguration(id)
    {

    }

    async uploadConfigurations(newConfigs)
    {

    }

    parseCSVData(csvData)
    {

    }
}
