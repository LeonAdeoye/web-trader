import {LoggerService} from "./LoggerService";
import {tasks, holdings, baskets, clients, iois, flows, news} from "./MockData";

export class TradeDataService
{
    static HOLDINGS = "holdings";
    static TASKS = "tasks";
    static BASKETS = "baskets";
    static CLIENTS = "clients";
    static INTERESTS = "interests";
    static FLOWS = "flows";
    static IOIs = "IOIs";
    static NEWS = "news";

    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    #filterHoldings = (holdings, stockCode, client) =>
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

    #filterTasks = (tasks, stockCode, client) =>
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

    getData = (dataType, stock, client, days) =>
    {
        switch (dataType)
        {
            case TradeDataService.HOLDINGS:
                return this.#filterHoldings(holdings, stock, client);
            case TradeDataService.TASKS:
                return this.#filterTasks(tasks, stock, client);
            case TradeDataService.BASKETS:
                return baskets;
            case TradeDataService.CLIENTS:
                return clients;
            case TradeDataService.IOIs:
                return iois;
            case TradeDataService.FLOWS:
                return flows;
            case TradeDataService.NEWS:
                return news;
            default:
                return [];
        }
    }

    get = async (url) =>
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
