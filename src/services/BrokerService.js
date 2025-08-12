import {LoggerService} from "./LoggerService";

export class BrokerService
{
    #brokers;
    #loggerService;

    constructor()
    {
        this.#brokers = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadBrokers = async () =>
    {
        await fetch('http://localhost:20009/broker')
            .then(response => response.json())
            .then(data =>
            {
                if (data.length > 0)
                {
                    this.#brokers = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} brokers: ${JSON.stringify(this.#brokers)}`);
                } else
                    this.#loggerService.logInfo(`Loaded zero brokers.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    getBrokers = () =>
    {
        return this.#brokers;
    }

    getBrokerByAcronym = (acronym) =>
    {
        return this.#brokers.find(broker => broker.brokerAcronym === acronym);
    }

    clear = () =>
    {
        this.#brokers = [];
    }

    addNewBroker = async (newBroker) =>
    {
        const {brokerId, ...rest} = newBroker;
        this.#loggerService.logInfo(`Saving new broker: ${JSON.stringify(newBroker)}.`);
        return await fetch("http://localhost:20009/broker", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(rest)})
            .then(response => response.json())
            .then((brokerResponse) =>
            {
                this.#brokers.push(brokerResponse);
                this.#loggerService.logInfo(`Successfully saved broker: ${JSON.stringify(brokerResponse)}.`);
                return brokerResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateBroker = async (brokerToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating broker: ${JSON.stringify(brokerToUpdate)}.`);
        return await fetch(`http://localhost:20009/broker`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(brokerToUpdate)})
            .then(response => response.json())
            .then((brokerResponse) =>
            {
                for(const current of this.#brokers)
                {
                    if(current.brokerId === brokerResponse.brokerId)
                    {
                        this.#brokers[this.#brokers.indexOf(current)] = brokerResponse;
                        break;
                    }
                }
                this.#loggerService.logInfo(`Updated broker: ${JSON.stringify(brokerResponse)}.`);
                return brokerResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteBroker = async (brokerId) =>
    {
        return await fetch(`http://localhost:20009/broker/${brokerId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#brokers)
                {
                    if(current.brokerId === brokerId)
                    {
                        this.#brokers.splice(this.#brokers.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted broker with broker Id: ${brokerId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }
} 
