import {LoggerService} from "./LoggerService";

export class BrokerService {
    #brokers;
    #loggerService;

    constructor() {
        this.#brokers = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadBrokers = async () => {
        if (this.#brokers.length !== 0)
            return;

        await fetch('http://localhost:20009/brokers')
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    this.#brokers = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} brokers: ${JSON.stringify(this.#brokers)}`);
                } else {
                    this.#loggerService.logInfo(`Loaded zero brokers.`);
                }
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getBrokers = () => {
        return this.#brokers;
    }

    getBrokerByName = (name) => {
        return this.#brokers.find(broker => broker.brokerName === name);
    }

    clear = () => {
        this.#brokers = [];
    }
} 