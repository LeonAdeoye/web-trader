import {LoggerService} from "./LoggerService";
import {isEmptyString} from "../utilities";

export class BlastService
{
    #blasts;
    #loggerService;

    constructor()
    {
        this.#blasts = new Map();
        this.#loggerService = new LoggerService(this.constructor.name);
        this.#blasts.set("leon", [
            {
                blastId: 1,
                blastName: "Schroders' Blasts",
                contents: ["News", "Holdings", "Flows", "IOIs"],
                markets: ["JP", "HK"],
                clientId: 1,
                triggerTime:"09:10:00",
                advFilter: {JP: 3, HK: 2},
                notionalValueFilter: {JP: 2000000, HK: 50000}
            },
            {
                blastId: 2,
                blastName: "Nomura's Blasts",
                contents: ["News", "Flows"],
                markets: ["JP"],
                clientId: 2,
                triggerTime: "09:00:00",
                advFilter: {JP: 3},
                notionalValueFilter: {JP: 2000000}
            },
            {
                blastId: 3,
                blastName: "Horatio's Blasts",
                contents: ["Flows"],
                markets: ["AU"],
                clientId: 2,
                triggerTime: "",
                advFilter: {},
                notionalValueFilter: {AU: 2000000}
            }]);
    }

    async loadBlasts(owner)
    {
        if(isEmptyString(owner))
            return;

        await fetch(`http://localhost:20009/blasts?owner=${owner}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                    this.#blasts.set(owner, data);
                else
                    this.#loggerService.logInfo(`Loaded zero blasts for owner: ${owner}`);
            })
            .catch(err => this.#loggerService.logError(err));
    }

    async addNewBlastConfiguration(owner, newBlastConfiguration)
    {
        this.#loggerService.logInfo(`Saving blast configuration: ${newBlastConfiguration} for owner: ${owner}.`);
        return await fetch("http://localhost:20009/blast", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newBlastConfiguration)})
            .then(response => response.json())
            .then((blastResponse) =>
            {
                if(this.#blasts.has(owner))
                    this.#blasts.get(owner).push(blastResponse);
                else
                    this.#blasts.set(owner, [blastResponse]);

                this.#loggerService.logInfo(`Successfully saved blast configuration: ${newBlastConfiguration}for owner: ${owner}.`);

                return blastResponse.id;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    clear()
    {
        this.#blasts.clear();
    }

    async deleteBlastConfiguration(blastId)
    {
        fetch(`http://localhost:20009/blast?id=${blastId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const listOfBlasts of this.#blasts.values())
                {
                    for(const current of listOfBlasts)
                    {
                        if(current.blastId === blastId)
                        {
                            listOfBlasts.splice(listOfBlasts.indexOf(current), 1);
                            this.#loggerService.logInfo(`Successfully deleted blast configuration with id: ${blastId}`);
                            return;
                        }
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    async updateBlastConfiguration(owner, updatedBlastConfiguration)
    {
        this.#loggerService.logInfo(`Updating blast configuration: ${updatedBlastConfiguration} for owner: ${owner}`);
        return await fetch("http://localhost:20009/blast", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedBlastConfiguration)})
            .then(response => response.json())
            .then((blastResponse) =>
            {
                const listOfBlasts = this.#blasts.get(owner);
                for(const current of listOfBlasts)
                {
                    if(current.blastId === updatedBlastConfiguration.blastId)
                    {
                        listOfBlasts[listOfBlasts.indexOf(current)] = blastResponse;
                        this.#blasts.set(owner, listOfBlasts);
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated blast configuration: ${updatedBlastConfiguration} for owner: ${owner}`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    getBlasts(owner)
    {
        return this.#blasts.get("leon");
    }
}
