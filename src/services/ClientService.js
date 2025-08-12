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

    loadClients = async () =>
    {
        await fetch(`http://localhost:20009/client`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#clients = data;
                    this.#loggerService.logInfo(`Client service loaded ${this.#clients.length} clients: ${JSON.stringify(this.#clients)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero clients.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    addNewClient = async (newClient) =>
    {
        const {clientId, ...rest} = newClient;
        this.#loggerService.logInfo(`Saving new client: ${JSON.stringify(rest)}.`);
        return await fetch("http://localhost:20009/client", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(rest)})
            .then(response => response.json())
            .then((clientResponse) =>
            {
                this.#clients.push(clientResponse);
                this.#loggerService.logInfo(`Successfully saved client: ${JSON.stringify(clientResponse)}.`);
                return clientResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteClient = async (clientId) =>
    {
        return await fetch(`http://localhost:20009/client?clientId=${clientId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#clients)
                {
                    if(current.clientId === clientId)
                    {
                        this.#clients.splice(this.#clients.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted client with client Id: ${clientId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateClient = async (clientToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating client: ${JSON.stringify(clientToUpdate)}.`);
        return await fetch(`http://localhost:20009/client`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(clientToUpdate)})
            .then(response => response.json())
            .then((clientResponse) =>
            {
                for(const current of this.#clients)
                {
                    if(current.clientId === clientResponse.clientId)
                    {
                        this.#clients[this.#clients.indexOf(current)] = clientResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated client: ${JSON.stringify(clientResponse)}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () => this.#clients.clear();

    getClientId = (clientName) => this.#clients.find(client => client.clientName === clientName).clientId;

    getClientName = (clientId) => this.#clients.find(client => client.clientId === clientId).clientName;

    getClients = () => this.#clients;
}
