import {LoggerService} from "./LoggerService";

export class NewsService
{
    #news;
    #loggerService;

    constructor()
    {
        this.#news = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadNews = async () =>
    {
        await fetch(`http://localhost:20004/news`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#news = data;
                    this.#loggerService.logDebug(`News service loaded ${this.#news.length} news: ${JSON.stringify(this.#news)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero news.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    clear = () => this.#news.clear();

    getNewsByArticleId = (articleId) => this.#news.find(article => article.articleId === articleId);

    getNews = () => this.#news;
}
