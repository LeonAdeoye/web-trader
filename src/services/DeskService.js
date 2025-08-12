import {LoggerService} from "./LoggerService";

export class DeskService
{
    #desks;
    #loggerService;

    constructor()
    {
        this.#desks = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    loadDesks = async () =>
    {
        await fetch(`http://localhost:20009/desk`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#desks = data;
                    this.#loggerService.logInfo(`Desk service loaded ${this.#desks.length} desks: ${JSON.stringify(this.#desks)}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero desks.`);

            })
            .catch(err => this.#loggerService.logError(err));
    }

    reconfigure = async () =>
    {
        this.#loggerService.logInfo("Reconfiguring desk service...");
        try {
            const response = await fetch("http://localhost:20009/desk/reconfigure", {
                method: "GET"
            });
            if (response.ok) {
                this.#loggerService.logInfo("Desk service reconfigured successfully");
                // Clear local cache to force reload on next request
                this.#desks = [];
            } else {
                this.#loggerService.logError(`Failed to reconfigure desk service: ${response.status}`);
            }
        } catch (error) {
            this.#loggerService.logError(`Error reconfiguring desk service: ${error}`);
        }
    }

    addNewDesk = async (newDesk) =>
    {
        this.#loggerService.logInfo(`Saving new desk: ${newDesk}.`);
        return await fetch("http://localhost:20009/desk", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newDesk)})
            .then(response => response.json())
            .then((deskResponse) =>
            {
                this.#desks.push(deskResponse);
                this.#loggerService.logInfo(`Successfully saved desk: ${deskResponse}.`);
                return deskResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    }

    deleteDesk = async (deskId) =>
    {
        return await fetch(`http://localhost:20009/desk?deskId=${deskId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#desks)
                {
                    if(current.deskId === deskId)
                    {
                        this.#desks.splice(this.#desks.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted desk with desk Id: ${deskId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    }

    updateDesk = async (deskToUpdate) =>
    {
        this.#loggerService.logInfo(`Updating desk: ${deskToUpdate}.`);
        return await fetch(`http://localhost:20009/desk`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(deskToUpdate)})
            .then(response => response.json())
            .then((deskResponse) =>
            {
                for(const current of this.#desks)
                {
                    if(current.deskId === deskResponse.deskId)
                    {
                        this.#desks[this.#desks.indexOf(current)] = deskResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Updated desk: ${deskResponse}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    }

    addTraderToDesk = async (deskId, traderId) =>
    {
        this.#loggerService.logInfo(`Adding trader ${traderId} to desk ${deskId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/addTrader/${deskId}/${traderId}`, {
                method: "POST"
            });
            if (response.ok) {
                this.#loggerService.logInfo(`Successfully added trader ${traderId} to desk ${deskId}`);
                // Update local cache
                const desk = this.#desks.find(d => d.deskId === deskId);
                if (desk) {
                    if (!desk.traders) {
                        desk.traders = [];
                    }
                    if (!desk.traders.includes(traderId)) {
                        desk.traders.push(traderId);
                    }
                }
                return true;
            } else {
                this.#loggerService.logError(`Failed to add trader ${traderId} to desk ${deskId}: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.#loggerService.logError(`Error adding trader ${traderId} to desk ${deskId}: ${error}`);
            return false;
        }
    }

    removeTraderFromDesk = async (deskId, traderId) =>
    {
        this.#loggerService.logInfo(`Removing trader ${traderId} from desk ${deskId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/removeTrader/${deskId}/${traderId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                this.#loggerService.logInfo(`Successfully removed trader ${traderId} from desk ${deskId}`);
                // Update local cache
                const desk = this.#desks.find(d => d.deskId === deskId);
                if (desk && desk.traders) {
                    const index = desk.traders.indexOf(traderId);
                    if (index > -1) {
                        desk.traders.splice(index, 1);
                    }
                }
                return true;
            } else {
                this.#loggerService.logError(`Failed to remove trader ${traderId} from desk ${deskId}: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.#loggerService.logError(`Error removing trader ${traderId} from desk ${deskId}: ${error}`);
            return false;
        }
    }

    clear = () => this.#desks.clear();

    getDeskById = (deskId) => this.#desks.find(desk => desk.deskId === deskId);

    getDeskByIdFromServer = async (deskId) =>
    {
        this.#loggerService.logInfo(`Getting desk by ID from server: ${deskId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/${deskId}`);
            if (response.ok) {
                const desk = await response.json();
                this.#loggerService.logInfo(`Retrieved desk from server: ${desk.deskName}`);
                return desk;
            } else if (response.status === 404) {
                this.#loggerService.logInfo(`Desk with ID ${deskId} not found on server`);
                return null;
            } else {
                this.#loggerService.logError(`Failed to get desk ${deskId}: ${response.status}`);
                return null;
            }
        } catch (error) {
            this.#loggerService.logError(`Error getting desk ${deskId}: ${error}`);
            return null;
        }
    }

    getDeskByName = (deskName) => this.#desks.find(desk => desk.deskName === deskName);

    getDesks = () => this.#desks;

    getTradersByDeskId = async (deskId) =>
    {
        this.#loggerService.logInfo(`Getting traders for desk ID: ${deskId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/traders/${deskId}`);
            if (response.ok) {
                const traders = await response.json();
                this.#loggerService.logInfo(`Retrieved ${traders.length} traders for desk ${deskId}`);
                return traders;
            } else if (response.status === 204) {
                this.#loggerService.logInfo(`No traders found for desk ${deskId}`);
                return [];
            } else {
                this.#loggerService.logError(`Failed to get traders for desk ${deskId}: ${response.status}`);
                return [];
            }
        } catch (error) {
            this.#loggerService.logError(`Error getting traders for desk ${deskId}: ${error}`);
            return [];
        }
    }

    doesTraderBelongToDesk = async (deskId, traderId) =>
    {
        this.#loggerService.logInfo(`Checking if trader ${traderId} belongs to desk ${deskId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/belongs/${deskId}/${traderId}`);
            if (response.ok) {
                const belongs = await response.json();
                this.#loggerService.logInfo(`Trader ${traderId} ${belongs ? 'belongs' : 'does not belong'} to desk ${deskId}`);
                return belongs;
            } else {
                this.#loggerService.logError(`Failed to check trader membership: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.#loggerService.logError(`Error checking trader membership: ${error}`);
            return false;
        }
    }

    getDeskByTraderId = async (traderId) =>
    {
        this.#loggerService.logInfo(`Getting desk for trader ID: ${traderId}`);
        try {
            const response = await fetch(`http://localhost:20009/desk/deskByTrader/${traderId}`);
            if (response.ok) {
                const desk = await response.json();
                this.#loggerService.logInfo(`Retrieved desk for trader ${traderId}: ${desk.deskName}`);
                return desk;
            } else if (response.status === 404) {
                this.#loggerService.logInfo(`No desk found for trader ${traderId}`);
                return null;
            } else {
                this.#loggerService.logError(`Failed to get desk for trader ${traderId}: ${response.status}`);
                return null;
            }
        } catch (error) {
            this.#loggerService.logError(`Error getting desk for trader ${traderId}: ${error}`);
            return null;
        }
    }
}
