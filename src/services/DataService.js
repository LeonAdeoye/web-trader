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
            return {
                stockCode: stockCode,
                buyTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Buy"),
                sellTrades: tradeHistory.filter((item) => item.stockCode === stockCode && new Date(item.date) > filterDate && item.side === "Sell")
            };
        }
        else if(client)
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
            return {
                stockCode: stockCode,
                holdings: holdings.filter((item) => item.stockCode === stockCode)
            };
        }
        else if(client)
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
            return crosses.filter((item) => item.stockCode === stockCode);
        }
        else if(client)
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
                return tasks;
            default:
                return [];
        }
    }

    async get(url)
    {
        let data = [];

        await fetch(url)
            .then(response => response.json())
            .then(jsonResponse => data = jsonResponse)
            .catch(error => this.#loggerService.logError(error));

        return data;
    }
}
