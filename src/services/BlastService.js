import {LoggerService} from "./LoggerService";
import {isEmptyString} from "../utilities";

export class BlastService
{
    #blasts;
    #loggerService;

    constructor()
    {
        this.#blasts = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    async loadBlasts(ownerId)
    {
        if(isEmptyString(ownerId))
            return;

        await fetch(`http://localhost:20009/blast?ownerId=${ownerId}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#blasts = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} blasts for owner: ${ownerId}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero blasts for owner: ${ownerId}`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    async addNewBlastConfiguration(ownerId, newBlastConfiguration)
    {
        this.#loggerService.logInfo(`Saving blast configuration: ${newBlastConfiguration} for owner: ${ownerId}.`);
        return await fetch("http://localhost:20009/blast", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newBlastConfiguration)})
            .then(response => response.json())
            .then((blastResponse) =>
            {
                this.#blasts.push(blastResponse);
                this.#loggerService.logInfo(`Successfully saved blast configuration: ${blastResponse}for owner: ${ownerId}.`);
                return blastResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear()
    {
        this.#blasts.clear();
    }

    async deleteBlastConfiguration(ownerId, blastId)
    {
        fetch(`http://localhost:20009/blast?ownerId=${ownerId}&blastId=${blastId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#blasts)
                {
                    if(current.blastId === blastId)
                    {
                        this.#blasts.splice(this.#blasts.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted blast configuration with ownerId: ${ownerId} and blast Id: ${blastId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    async updateBlastConfiguration(ownerId, updatedBlastConfiguration)
    {
        this.#loggerService.logInfo(`Updating blast configuration: ${updatedBlastConfiguration} for owner: ${ownerId}`);
        return await fetch(`http://localhost:20009/blast?ownerId=${ownerId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedBlastConfiguration)})
            .then(response => response.json())
            .then((blastResponse) =>
            {
                for(const current of this.#blasts)
                {
                    if(current.blastId === updatedBlastConfiguration.blastId)
                    {
                        this.#blasts[this.#blasts.indexOf(current)] = blastResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated blast configuration: ${updatedBlastConfiguration} for owner id: ${ownerId}`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getBlasts()
    {
        return this.#blasts;
    }
}
