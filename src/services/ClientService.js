import {LoggerService} from "./LoggerService";

export class ClientService
{
    #clients;
    #loggerService;

    constructor()
    {
        this.#clients = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    async loadClients()
    {
        await fetch(`http://localhost:20009/client`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#clients = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} clients.`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero clients.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    async addNewClient(newClient)
    {
        this.#loggerService.logInfo(`Saving new client: ${newClient}.`);
        return await fetch("http://localhost:20009/client", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newClient)})
            .then(response => response.json())
            .then((clientResponse) =>
            {
                this.#clients.push(clientResponse);
                this.#loggerService.logInfo(`Successfully saved client: ${clientResponse}.`);
                return clientResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear()
    {
        this.#clients.clear();
    }

    async deleteClient(clientId)
    {
        fetch(`http://localhost:20009/client?clientId=${clientId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#clients)
                {
                    if(current.blastId === clientId)
                    {
                        this.#clients.splice(this.#clients.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted client with client Id: ${clientId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    async updateClient(clientToUpdate)
    {
        this.#loggerService.logInfo(`Updating client: ${clientToUpdate}.`);
        return await fetch(`http://localhost:20009/client`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(clientToUpdate)})
            .then(response => response.json())
            .then((clientResponse) =>
            {
                for(const current of this.#clients)
                {
                    if(current.blastId === clientResponse.blastId)
                    {
                        this.#clients[this.#clients.indexOf(current)] = clientResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated client: ${clientResponse}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getClients()
    {
        return this.#clients;
    }
}
