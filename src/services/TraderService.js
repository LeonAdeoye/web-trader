import {LoggerService} from "./LoggerService";

export class TraderService {
    #traders;
    #loggerService;

    constructor() {
        this.#traders = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadTraders = async () => {
        if (this.#traders.length !== 0)
            return;

        await fetch('http://localhost:20009/trader')
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    this.#traders = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} traders: ${JSON.stringify(this.#traders)}`);
                } else {
                    this.#loggerService.logInfo(`Loaded zero traders.`);
                }
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getTraders = () => {
        return this.#traders;
    }

    getTraderByUserId = (userId) => {
        return this.#traders.find(trader => trader.userId === userId);
    }

    clear = () => {
        this.#traders = [];
    }
} 
