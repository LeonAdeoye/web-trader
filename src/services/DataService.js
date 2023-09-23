import {LoggerService} from "./LoggerService";
import {tasks, tradeHistory, holdings, crosses} from "./MockData";

export class DataService
{
    static CROSSES = "crosses";
    static HOLDINGS = "holdings";
    static TRADE_HISTORY = "tradeHistory";
    static TASKS = "tasks";
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    #filterTradeHistory(tradeHistory, stockCode, client, days)
    {
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - days);

        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering trade history for stock code: ${stockCode} and newer than ${days} days ago.`);
            const result = {
                stockCode: stockCode,
                buyTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Buy"),
                sellTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Sell")
            };

            if(result.buyTrades.length !== 0 || result.sellTrades.length !== 0)
                return result;
        }

        if(client)
        {
            this.#loggerService.logInfo(`Filtering trade history for client: ${client} and newer than ${days} days ago.`);
            return {
                client: client,
                buyTrades: tradeHistory.filter((item) => item.client === client && new Date(item.date) > filterDate && item.side === "Buy"),
                sellTrades: tradeHistory.filter((item) => item.client === client && new Date(item.date) > filterDate && item.side === "Sell")
            }
        }
    }

    #filterHoldings(holdings, stockCode, client)
    {
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering holdings for stock code: ${stockCode}.`);
            const result = {
                stockCode: stockCode,
                holdings: holdings.filter((item) => item.stockCode === stockCode)
            };

            if(result.holdings.length !== 0)
                return result;
        }

        if(client)
        {
            this.#loggerService.logInfo(`Filtering holdings for client: ${client}.`);
            return {
                client: client,
                holdings: holdings.filter((item) => item.client === client)
            };
        }
    }

    #filterCrosses(crosses, stockCode, client)
    {
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering crosses for stock code: ${stockCode}.`);
            const result = crosses.filter((item) => item.stockCode === stockCode);
            if(result.length !== 0)
                return result;
        }
        if(client)
        {
            this.#loggerService.logInfo(`Filtering crosses for client: ${client}.`);
            const result = [];
            for (const cross of crosses)
            {
                const { buyOrders, sellOrders, ...rest } = cross;

                const hasMatchingBuy = buyOrders.some((order) => order.client === client);
                const hasMatchingSell = sellOrders.some((order) => order.client === client);

                if (hasMatchingBuy || hasMatchingSell)
                    result.push({ ...rest, buyOrders, sellOrders });
            }
            return result;
        }
        else
            return crosses;
    }

    #filterTasks(tasks, stockCode, client)
    {
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering tasks for stock code: ${stockCode}.`);
            return tasks.filter((item) => item.stockCode === stockCode);
        }
        else if(client)
        {
            this.#loggerService.logInfo(`Filtering tasks for client: ${client}.`);
            return tasks.filter((item) => item.client === client);
        }
        else
            return tasks;
    }

    getData(dataType, stock, client, days)
    {
        switch (dataType)
        {
            case DataService.CROSSES:
                return this.#filterCrosses(crosses, stock, client);
            case DataService.TRADE_HISTORY:
                return this.#filterTradeHistory(tradeHistory, stock, client, days);
            case DataService.HOLDINGS:
                return this.#filterHoldings(holdings, stock, client);
            case DataService.TASKS:
                return this.#filterTasks(tasks, stock, client);
            default:
                return [];
        }
    }

    async get(url)
    {
        try
        {
            const response = await fetch(url);

            if (!response.ok)
                throw new Error(`Request using url: ${url} failed with status ${response.status}`);

            return await response.json();
        }
        catch (error)
        {
            this.#loggerService.logError(error);
        }
    }
}
