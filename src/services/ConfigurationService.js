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

    async addNewConfiguration(owner, key, value)
    {
        const newConfig = {owner: owner, key: key, value: value, lastUpdatedBy: this.#user, lastUpdatedOn: Date.now()};
        this.#loggerService.logInfo(`Saving configuration for owner: ${owner} and key: ${key} with value: ${value} by user: ${this.#user}`);
        await fetch("http://localhost:20001/configuration", {
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
            });
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
                            this.#loggerService.logInfo(`Successfully deleted configuration for id ${id}`);
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
}
