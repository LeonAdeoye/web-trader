export class ConfigurationService
{
    #configurations;

    constructor()
    {
        this.#configurations = new Map();
    }

    loadConfigurations()
    {

    }

    reloadConfigurations()
    {
        this.clear();
        this.loadConfigurations();
    }

    get(owner)
    {

    }

    get(owner, key)
    {

    }

    set(owner, key, value)
    {

    }

    clear()
    {
        this.#configurations.clear();
    }
}
