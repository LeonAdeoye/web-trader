import {LoggerService} from "./LoggerService";

export class NewsService
{
    #symbolsWithNews
    #news;
    #loggerService;

    constructor()
    {
        this.#news = [];
        this.#symbolsWithNews = []
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadArticlesForSymbol = async (ric) =>
    {
        await fetch(`http://localhost:20004/news/articles?ric=${ric}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#news = data;
                    this.#loggerService.logDebug(`News service loaded ${this.#news.length} news: ${JSON.stringify(this.#news)} for ric: ${ric}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero news for ric: ${ric}.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    loadSymbolsWithNews = async () =>
    {
        await fetch(`http://localhost:20004/news/symbols`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#symbolsWithNews = data;
                    this.#loggerService.logDebug(`News service loaded ${this.#symbolsWithNews.length} news symbols: ${JSON.stringify(this.#symbolsWithNews)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero symbols with news.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    getInstruments = () => this.#symbolsWithNews

    getArticles = () => this.#news

    clear = () => this.#news.clear();
}
