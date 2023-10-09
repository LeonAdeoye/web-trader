import {LoggerService} from "./LoggerService";

export class ClientInterestService
{
    #clientInterests;
    #loggerService;

    constructor()
    {
        this.#clientInterests = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadClientInterests = async (ownerId) =>
    {
        if(this.#clientInterests.length !== 0)
            return;

        await fetch(`http://localhost:20009/interest?ownerId=${ownerId}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#clientInterests = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} client interests: ${JSON.stringify(this.#clientInterests)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero client interests.`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    addNewClientInterest = async (newClientInterest) =>
    {
        this.#loggerService.logInfo(`Saving new client interest: ${JSON.stringify(newClientInterest)}.`);
        return await fetch("http://localhost:20009/interest", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newClientInterest)})
            .then(response => response.json())
            .then((clientInterestResponse) =>
            {
                this.#clientInterests.push(clientInterestResponse);
                this.#loggerService.logInfo(`Successfully saved client interest: ${JSON.stringify(clientInterestResponse)}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear = () =>
    {
        this.#clientInterests.clear();
    }

    deleteClientInterest = async (ownerId, clientInterestId) =>
    {
        fetch(`http://localhost:20009/interest?ownerId=${ownerId}&clientInterestId=${clientInterestId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#clientInterests)
                {
                    if(current.clientInterestId === clientInterestId)
                    {
                        this.#clientInterests.splice(this.#clientInterests.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted client interest with client interest Id: ${clientInterestId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateClientInterest = async (clientInterestToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating clientInterest: ${JSON.stringify(clientInterestToUpdate)}.`);
        return await fetch(`http://localhost:20009/interest`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(clientInterestToUpdate)})
            .then(response => response.json())
            .then((clientInterestResponse) =>
            {
                for(const current of this.#clientInterests)
                {
                    if(current.blastId === clientInterestResponse.blastId)
                    {
                        this.#clientInterests[this.#clientInterests.indexOf(current)] = clientInterestResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Successfully updated client interest: ${JSON.stringify(clientInterestResponse)}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getClientInterests = () =>
    {
        return this.#clientInterests;
    }
}
