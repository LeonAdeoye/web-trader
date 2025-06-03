import {LoggerService} from "./LoggerService";
import {isEmptyString} from "../utilities";

export class AlertConfigurationsService
{
    #alertConfigurations;
    #alertTypes;
    #loggerService;

    constructor()
    {
        this.#alertConfigurations = [];
        this.#alertTypes = [];
        this.#loggerService = new LoggerService(this.constructor.name);
    };

    loadAlertConfigurations = async (ownerId) =>
    {
        if(isEmptyString(ownerId))
            return;

        await fetch(`http://localhost:20012/alert/configuration?ownerId=${ownerId}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#alertConfigurations = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} alert configurations for owner: ${ownerId}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero alert configurations for owner: ${ownerId}`);
            })
            .catch(err => this.#loggerService.logError(err));
    };

    loadAlertTypes = async () =>
    {
        await fetch(`http://localhost:20012/alert/type`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#alertTypes = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} alert types.`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero alert types`);
            })
            .catch(err => this.#loggerService.logError(err));
    };

    addNewAlertConfiguration = async (newAlertConfigurationsConfiguration) =>
    {
        this.#loggerService.logInfo(`Saving alert configuration: ${JSON.stringify(newAlertConfigurationsConfiguration)}.`);
        return await fetch("http://localhost:20012/alert/configuration", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newAlertConfigurationsConfiguration)})
            .then(response => response.json())
            .then((alertConfigurationsResponse) =>
            {
                this.#alertConfigurations.push(alertConfigurationsResponse);
                this.#loggerService.logInfo(`Successfully saved alert configuration: ${JSON.stringify(alertConfigurationsResponse)}.`);
                return alertConfigurationsResponse;
            })
            .catch(error => this.#loggerService.logError(error));
    };

    clear = () =>
    {
        this.#alertConfigurations.clear();
    };

    deleteAlertConfiguration = async (ownerId, alertConfigurationsId) =>
    {
        fetch(`http://localhost:20012/alert/configuration/${alertConfigurationsId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#alertConfigurations)
                {
                    if(current.alertConfigurationsId === alertConfigurationsId)
                    {
                        this.#alertConfigurations.splice(this.#alertConfigurations.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted alert configuration with ownerId: ${ownerId} and Id: ${alertConfigurationsId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    };

    updateAlertConfiguration = async (updatedAlertConfigurationsConfiguration) =>
    {
        this.#loggerService.logInfo(`Updating alert configuration: ${JSON.stringify(updatedAlertConfigurationsConfiguration)}`);
        return await fetch("http://localhost:20012/alert/configuration", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updatedAlertConfigurationsConfiguration)})
            .then(response => response.json())
            .then((alertConfigurationsResponse) =>
            {
                for(const current of this.#alertConfigurations)
                {
                    if(current.alertConfigurationsId === updatedAlertConfigurationsConfiguration.alertConfigurationsId)
                    {
                        this.#alertConfigurations[this.#alertConfigurations.indexOf(current)] = alertConfigurationsResponse;
                        break;
                    }
                }

                this.#loggerService.logInfo(`Successfully updated alert configuration: ${JSON.stringify(updatedAlertConfigurationsConfiguration)}.`);
            })
            .catch(error => this.#loggerService.logError(error));
    };

    getAlertConfigurations = () =>
    {
        return this.#alertConfigurations;
    };

    getTypes = () =>
    {
        return this.#alertTypes;
    };
}
