import { LoggerService } from './LoggerService';
import { DeskService } from './DeskService';
import { TraderService } from './TraderService';

class RfqService
{
    constructor()
    {
        this.loggerService = new LoggerService(RfqService.name);
        this.deskService = new DeskService();
        this.traderService = new TraderService();
        this.rfqs = new Map();
        this.workflowEvents = new Map();
        this.comments = new Map();
    }

    async getRfqById(rfqId)
    {
        let rfq = this.rfqs.get(rfqId);
        if (rfq)
        {
            this.loggerService.logInfo(`Found RFQ in local cache: ${rfqId}`);
            return rfq;
        }

        this.loggerService.logInfo(`Fetching RFQ from backend service: ${rfqId}`);
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/${rfqId}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });

            if (response.status === 404)
            {
                this.loggerService.logInfo(`RFQ not found: ${rfqId}`);
                return null;
            }

            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to get RFQ: ${response.status} - ${errorText}`);
                return null;
            }

            const fetchedRfq = await response.json();
            this.loggerService.logInfo(`Successfully fetched RFQ from backend: ${fetchedRfq.rfqId}`);
            this.rfqs.set(fetchedRfq.rfqId, fetchedRfq);
            return fetchedRfq;
        }
        catch (error)
        {
            this.loggerService.logError(`Error fetching RFQ: ${error.message}`);
            return null;
        }
    }

    getAllRfqs()
    {
        return Array.from(this.rfqs.values());
    }

    async createRfq(rfqData)
    {
        const rfq =
        {
            ...rfqData,
            rfqId: rfqData.rfqId,
            lastActivity: new Date().toLocaleTimeString(),
            createdBy: rfqData.createdBy || 'Unknown User'
        };
        await this.saveRfq(rfq);
        return rfq;
    }

    async getWorkflowEvents(rfqId)
    {
        this.loggerService.logInfo(`Fetching workflow events from backend service: ${rfqId}`);
        
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/workflow/events/${rfqId}`, {method: 'GET', headers: {'Content-Type': 'application/json'}});
            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to get workflow events: ${response.status} - ${errorText}`);
                return [];
            }
            const events = await response.json();
            this.loggerService.logInfo(`Successfully fetched ${events.length} workflow events for RFQ: ${rfqId}`);
            events.forEach(event => this.workflowEvents.set(event.id, event));
            return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        catch (error)
        {
            this.loggerService.logError(`Error fetching workflow events: ${error.message}`);
            return [];
        }
    }

    async addWorkflowEvent(eventData)
    {
        this.loggerService.logInfo(`Adding workflow event to backend service for RFQ: ${eventData.rfqId}`);
        
        try
        {
            const eventPayload = {
                id: eventData.id || crypto.randomUUID(),
                rfqId: eventData.rfqId,
                eventType: eventData.eventType,
                fromStatus: eventData.fromStatus,
                toStatus: eventData.toStatus,
                userId: eventData.userId,
                timestamp: eventData.timestamp || new Date().toISOString(),
                comment: eventData.comment,
                fieldChanges: eventData.fieldChanges || {}
            };

            const response = await fetch('http://localhost:20020/rfq/workflow/event', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(eventPayload)});
            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to add workflow event: ${response.status} - ${errorText}`);
                throw new Error(`Failed to add workflow event: ${response.status} - ${errorText}`);
            }

            const addedEvent = await response.json();
            this.loggerService.logInfo(`Successfully added workflow event: ${addedEvent.id} for RFQ: ${addedEvent.rfqId}`);
            this.workflowEvents.set(addedEvent.id, addedEvent);
            return addedEvent;
        }
        catch (error)
        {
            this.loggerService.logError(`Error adding workflow event: ${error.message}`);
            throw error;
        }
    }

    getValidStatusTransitions(currentStatus)
    {
        const transitions =
        {
            'PENDING': ['ACCEPTED', 'REJECTED'],
            'ACCEPTED': ['PRICING'],
            'PRICING': ['PRICED'],
            'PRICED': ['TRADED_AWAY', 'TRADE_COMPLETED'],
            'REJECTED': [],
            'TRADED_AWAY': [],
            'TRADE_COMPLETED': []
        };
        return transitions[currentStatus.toUpperCase()] || [];
    }

    async getAvailableTraders()
    {
        try
        {
            await this.deskService.loadDesks();
            await this.traderService.loadTraders();
            const desks = this.deskService.getDesks();
            const traders = this.traderService.getTraders();
            const deltaOneDesk = desks.find(desk => desk.deskName === 'Delta One Desk');
            const deltaOneTraderIds = deltaOneDesk ? deltaOneDesk.traders || [] : [];
            const availableTraders = traders.map(trader => 
            {
                const isRT = deltaOneTraderIds.includes(trader.traderId);
                return {
                    id: trader.traderId,
                    name: `${trader.firstName} ${trader.lastName} (${isRT ? 'RT' : 'ST'})`,
                    role: isRT ? 'RT' : 'ST'
                };
            });
            this.loggerService.logInfo(`Generated ${availableTraders.length} available traders: ${JSON.stringify(availableTraders)}`);
            return availableTraders;
        }
        catch (error)
        {
            this.loggerService.logError(`Error loading available traders: ${error.message}`);
            return [];
        }
    }

    async processWorkflowAction(rfqId, action, userId, comment = null, fieldChanges = {})
    {
        const rfq = await this.getRfqById(rfqId);
        if (!rfq)
            throw new Error(`RFQ not found: ${rfqId}`);

        let updates = {};
        switch (action)
        {
            case 'ACCEPTED':
                updates = { status: 'ACCEPTED' };
                break;
            case 'REJECTED':
                updates = { status: 'REJECTED' };
                break;
            case 'PRICING':
                updates = { status: 'PRICING' };
                break;
            case 'PRICED':
                updates = { status: 'PRICED' };
                break;
            case 'TRADED_AWAY':
                updates = { status: 'TRADED_AWAY' };
                break;
            case 'TRADE_COMPLETED':
                updates = { status: 'TRADE_COMPLETED' };
                break;
        }

        const updatedRfq = await this.updateRfq(rfqId, updates);
        const workflowEvent = await this.addWorkflowEvent({
            rfqId,
            eventType: 'STATUS_CHANGE',
            fromStatus: rfq.status,
            toStatus: updatedRfq.status,
            userId,
            comment,
            fieldChanges
        });

        return { updatedRfq, workflowEvent };
    }

    async loadRfqs()
    {
        // TODO: Implement API call to rfq-service
        this.loggerService.logInfo('Loading RFQs from backend service...');
        return this.getAllRfqs();
    }

    async saveRfq(rfqData)
    {
        this.loggerService.logInfo(`Saving RFQ to backend service: ${rfqData.rfqId}`);
        
        try
        {
            const response = await fetch('http://localhost:20020/rfq', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(rfqData)
            });

            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to save RFQ: ${response.status} - ${errorText}`);
            }

            const savedRfq = await response.json();
            this.loggerService.logInfo(`Successfully saved RFQ: ${savedRfq.rfqId}`);
            this.rfqs.set(savedRfq.rfqId, savedRfq);
            return savedRfq;
        }
        catch (error)
        {
            this.loggerService.logError(`Error saving RFQ: ${error.message}`);
            throw error;
        }
    }

    async updateRfq(rfqId, updates)
    {
        this.loggerService.logInfo(`Updating RFQ in backend service: ${rfqId}`);
        
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/${rfqId}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updates)});
            if (response.status === 404)
            {
                this.loggerService.logInfo(`RFQ not found: ${rfqId}`);
                return null;
            }
            
            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to update RFQ: ${response.status} - ${errorText}`);
                return null;
            }
            
            const updatedRfq = await response.json();
            this.loggerService.logInfo(`Successfully updated RFQ in backend: ${updatedRfq.rfqId}`);
            this.rfqs.set(updatedRfq.rfqId, updatedRfq);
            return updatedRfq;
        }
        catch (error)
        {
            this.loggerService.logError(`Error updating RFQ: ${error.message}`);
            return null;
        }
    }

    async deleteRfq(rfqId)
    {
        this.loggerService.logInfo(`Deleting RFQ from backend service: ${rfqId}`);
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/${rfqId}`, {method: 'DELETE', headers: {'Content-Type': 'application/json'}});
            if (response.status === 404)
            {
                this.loggerService.logInfo(`RFQ not found: ${rfqId}`);
                return false;
            }
            
            if (!response.ok)
            {
                const errorText = await response.text();
                this.loggerService.logError(`Failed to delete RFQ: ${response.status} - ${errorText}`);
                return false;
            }
            
            this.loggerService.logInfo(`Successfully deleted RFQ from backend: ${rfqId}`);
            this.rfqs.delete(rfqId);
            return true;
        }
        catch (error)
        {
            this.loggerService.logError(`Error deleting RFQ: ${error.message}`);
            return false;
        }
    }
}

export { RfqService };
