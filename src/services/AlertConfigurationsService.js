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
        this.#alertTypes =
        [
            {type: "Order Not Complete", classification: "Order", explanation: "Live order quantity more than cumulative quantity after reference time.", expression: "OrderState === 'LIVE' && orderQuantity > cumulativeQuantity && currentTime > referenceTime", messageTemplate: "After reference time: #{referenceTime} the order: #{orderId} for #{stockCode} with size: #{quantity} at price: #{price} is NOT complete. There are #{remainingQuantity} remaining."},
            {type: "Algo Expired With Executions Outstanding", classification: "Order", explanation: "Order with order quantity more than cumulative quantity after Algo expiry", expression: "OrderState === 'LIVE' && orderQuantity > cumulativeQuantity && currentTime > algoEndTime", messageTemplate: "After Algo end time: #{algoEndTime} the order: #{orderId} for #{stockCode} with size: #{quantity} at price: #{price} is NOT complete. There are #{remainingQuantity} remaining."},
            {type: "Order Rejections", classification: "Order", explanation: "Order rejection before ", expression: "OrderState === 'REJ' && orderQuantity > 0 & cumulativeQuantity === 0", messageTemplate: "The order: #{orderId} for #{stockCode} with size: #{quantity} at price: #{price} is rejected."},
            {type: "Amendment Rejections", classification: "Order", explanation: "Amendment rejection before after order accepted", expression: "OrderState === 'REJ' && cumulativeQuantity > 0", messageTemplate: "The amendment of the order: #{orderId} for #{stockCode} with size: #{quantity} at price: #{price} is rejected."}
        ];
        this.#loggerService = new LoggerService(this.constructor.name);
    };

    loadAlertConfigurations = async (ownerId) =>
    {
        if(isEmptyString(ownerId))
            return;

        await fetch(`http://localhost:20011/alertConfigurations?ownerId=${ownerId}`)
            .then(response => response.json())
            .then(data =>
            {
                if(data.length > 0)
                {
                    this.#alertConfigurations = data;
                    this.#loggerService.logInfo(`Loaded ${data.length} alertConfigurations for owner: ${ownerId}`);
                }
                else
                    this.#loggerService.logInfo(`Loaded zero alertConfigurations for owner: ${ownerId}`);
            })
            .catch(err => this.#loggerService.logError(err));
    };

    loadAlertTypes = async () =>
    {
        await fetch(`http://localhost:20011/alertConfigurations/alertTypes`)
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
        this.#loggerService.logInfo(`Saving alertConfigurations configuration: ${JSON.stringify(newAlertConfigurationsConfiguration)}.`);
        return await fetch("http://localhost:20011/alertConfigurations", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newAlertConfigurationsConfiguration)})
            .then(response => response.json())
            .then((alertConfigurationsResponse) =>
            {
                this.#alertConfigurations.push(alertConfigurationsResponse);
                this.#loggerService.logInfo(`Successfully saved alertConfigurations configuration: ${JSON.stringify(alertConfigurationsResponse)}.`);
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
        fetch(`http://localhost:20011/alertConfigurations?ownerId=${ownerId}&alertConfigurationsId=${alertConfigurationsId}`, {method: "DELETE"})
            .then(() =>
            {
                for(const current of this.#alertConfigurations)
                {
                    if(current.alertConfigurationsId === alertConfigurationsId)
                    {
                        this.#alertConfigurations.splice(this.#alertConfigurations.indexOf(current), 1);
                        this.#loggerService.logInfo(`Successfully deleted alertConfigurations configuration with ownerId: ${ownerId} and alertConfigurations Id: ${alertConfigurationsId}`);
                        break;
                    }
                }
            })
            .catch(error => this.#loggerService.logError(error));
    };

    updateAlertConfiguration = async (updatedAlertConfigurationsConfiguration) =>
    {
        this.#loggerService.logInfo(`Updating alertConfigurations configuration: ${JSON.stringify(updatedAlertConfigurationsConfiguration)}`);
        return await fetch("http://localhost:20011/alertConfigurations", {
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

                this.#loggerService.logInfo(`Successfully updated alertConfigurations configuration: ${JSON.stringify(updatedAlertConfigurationsConfiguration)}.`);
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
