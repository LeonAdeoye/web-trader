import {LoggerService} from "./LoggerService";

export class CacheService
{
    #cacheMap;
    #loggerService;

    constructor()
    {
        this.#cacheMap = new Map();
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    put = (symbol, previousData) =>
    {
        if(this.#cacheMap.has(symbol))
            this.#loggerService.logInfo("Data with symbol " + symbol + " already exists so updating existing data.");

        this.#cacheMap.set(symbol, previousData);
    }

    remove = (symbol) =>
    {
        if(this.#cacheMap.has(symbol))
            this.#cacheMap.delete(symbol);
        else
            this.#loggerService.logError("Cannot remove data because symbol " + symbol + " does not exist.");
    }

    get = (symbol) =>
    {
        if(!this.#cacheMap.has(symbol))
        {
            this.#loggerService.logError("Data with symbol " + symbol + " does not exist so returning empty object.");
            return {};
        }
        else
            return this.#cacheMap.get(symbol);
    }

    hasSymbol = (symbol) =>
    {
        return this.#cacheMap.has(symbol);
    }

    clearCache = () =>
    {
        this.#cacheMap.clear();
    }

    getSize = () =>
    {
        return this.#cacheMap.size;
    }

    getSymbols = () =>
    {
        return this.#cacheMap.keys();
    }
}
