import {LoggerService} from "./LoggerService";
import {tasks, tradeHistory, holdings, crosses, baskets, clients, blasts} from "./MockData";

export class DataService
{
    static CROSSES = "crosses";
    static HOLDINGS = "holdings";
    static TRADE_HISTORY = "tradeHistory";
    static TASKS = "tasks";
    static BASKETS = "baskets";
    static CLIENTS = "clients";
    static INTERESTS = "interests";
    static BLASTS = "blasts";
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    #filterTradeHistory(tradeHistory, stockCode, client, filterDays)
    {
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - filterDays);

        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering trade history for stock code: ${stockCode} and newer than ${filterDays} days ago.`);
            return {
                stockCode: stockCode,
                buyTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Buy"),
                sellTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Sell")
            };
        }

        if(client)
        {
            this.#loggerService.logInfo(`Filtering trade history for client: ${client} and newer than ${filterDays} days ago.`);
            return {
                client: client,
                buyTrades: tradeHistory.filter((item) => item.client === client && new Date(item.date) > filterDate && item.side === "Buy"),
                sellTrades: tradeHistory.filter((item) => item.client === client && new Date(item.date) > filterDate && item.side === "Sell")
            };
        }

        this.#loggerService.logInfo("Both the stockCode and client are NULL so return no trade history.");
        return {
            stockCode: "",
            client: "",
            buyTrades: [],
            sellTrades: []
        }
    }

    #filterHoldings(holdings, stockCode, client)
    {
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering holdings for stock code: ${stockCode}.`);
            return {
                stockCode: stockCode,
                holdings: holdings.filter((holding) => holding.stockCode === stockCode)
            };
        }

        if(client)
        {
            this.#loggerService.logInfo(`Filtering holdings for client: ${client}.`);
            return {
                client: client,
                holdings: holdings.filter((holding) => holding.client === client)
            };
        }

        this.#loggerService.logInfo("Both the stockCode and client are NULL so return no trade history.");
        return {
            stockCode: "",
            client: "",
            buyTrades: [],
            sellTrades: []
        }
    }

    #filterCrosses(crosses, stockCode, client)
    {
        let result = [];
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering crosses for stock code: ${stockCode}.`);
            result = crosses.filter((item) => item.stockCode === stockCode);
        }

        if(client)
        {
            this.#loggerService.logInfo(`Filtering crosses for client: ${client}.`);
            for (const cross of crosses)
            {
                const { buyOrders, sellOrders, ...rest } = cross;
                const hasMatchingBuy = buyOrders.some((order) => order.client === client && order.stockCode !== stockCode);
                const hasMatchingSell = sellOrders.some((order) => order.client === client && order.stockCode !== stockCode);

                if (hasMatchingBuy || hasMatchingSell)
                    result.push({ ...rest, buyOrders, sellOrders });
            }
        }

        if(!client && !stockCode)
            return crosses;

        return result;
    }

    #filterTasks(tasks, stockCode, client)
    {
        if(stockCode)
        {
            this.#loggerService.logInfo(`Filtering tasks for stock code: ${stockCode}.`);
            const result = tasks.filter((item) => item.stockCode === stockCode);
            if(result.length !== 0)
                return result;
        }

        if(client)
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
            case DataService.BASKETS:
                return baskets;
            case DataService.CLIENTS:
                return clients;
            case DataService.BLASTS:
                return blasts;
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
