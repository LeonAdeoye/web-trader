export class CacheService
{
    #cacheMap;

    constructor()
    {
        this.#cacheMap = new Map();
    }

    put(symbol, previousData)
    {
        if(this.#cacheMap.has(symbol))
            console.log("CacheService::put => data with symbol " + symbol + " already exists so updating existing data.");

        this.#cacheMap.set(symbol, previousData);
    }

    remove(symbol)
    {
        if(this.#cacheMap.has(symbol))
            this.#cacheMap.delete(symbol);
        else
            console.log("CacheService::remove => cannot remove data because symbol " + symbol + " does not exist.");
    }

    get(symbol)
    {
        if(!this.#cacheMap.has(symbol))
        {
            console.log("CacheService::get => data with symbol " + symbol + " does not exist so returning empty object.");
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
