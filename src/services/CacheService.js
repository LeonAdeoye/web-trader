import {LoggerService} from "./LoggerService";

export class CacheService
{
    #cacheMap = new Map();
    #logService = new LoggerService();

    constructor()
    {
        this.#logService.setLogger("CacheService");
    }

    put(symbol, previousData)
    {
        if(this.#cacheMap.has(symbol))
            this.#logService.logInfo("Data with symbol " + symbol + " already exists so updating existing data.");

        this.#cacheMap.set(symbol, previousData);
    }

    remove(symbol)
    {
        if(this.#cacheMap.has(symbol))
            this.#cacheMap.delete(symbol);
        else
            this.#logService.logError("Cannot remove data because symbol " + symbol + " does not exist.");
    }

    get(symbol)
    {
        if(!this.#cacheMap.has(symbol))
        {
            this.#logService.logError("Data with symbol " + symbol + " does not exist so returning empty object.");
            return {};
        }
        else
            return this.#cacheMap.get(symbol);
    }

    hasSymbol(symbol)
    {
        return this.#cacheMap.has(symbol);
    }

    clearCache()
    {
        this.#cacheMap.clear();
    }

    getSize()
    {
        return this.#cacheMap.size;
    }

    getSymbols()
    {
        return this.#cacheMap.keys();
    }
}
