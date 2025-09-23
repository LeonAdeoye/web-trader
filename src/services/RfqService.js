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
        this.initializeDummyData();
    }

    initializeDummyData()
    {
        const dummyRfq = {
            rfqId: 'RFQ-2024-001',
            client: 'Goldman Sachs',
            underlying: 'AAPL',
            strike: '150.00',
            quantity: '100 contracts',
            status: 'PRICING',
            assignedTo: 'John Smith (RT)',
            priority: 'HIGH',
            lastActivity: '2 min ago',
            createdBy: 'Sarah Johnson (ST)',
            arrivalTime: '14:18:32',
            impliedVol: '22.5%',
            notionalInUSD: '15000.00',
            notionalInLocal: '15000.00',
            notionalCurrency: 'USD',
            maturityDate: '2024-12-20',
            daysToExpiry: 45,
            exerciseType: 'EUROPEAN',
            dayCountConvention: 250,
            multiplier: 100,
            contracts: 100,
            salesCreditPercentage: 0.5,
            salesCreditAmount: '75.00',
            premiumSettlementCurrency: 'USD',
            premiumSettlementDate: '2024-12-22',
            legs: [
                {
                    quantity: 100,
                    strike: 150.00,
                    optionType: 'CALL',
                    side: 'BUY',
                    volatility: 22.5,
                    interestRate: 5.25
                }
            ]
        };

        this.rfqs.set(dummyRfq.rfqId, dummyRfq);

        const dummyEvents = [
            {
                id: '1',
                rfqId: 'RFQ-2024-001',
                eventType: 'STATUS_CHANGE',
                fromStatus: 'PRICING',
                toStatus: 'PRICED',
                userId: 'John Smith (RT)',
                timestamp: '14:32',
                comment: 'Pricing complete. Spread tightened to 0.25',
                fieldChanges: {
                    status: { fieldName: 'status', oldValue: 'PRICING', newValue: 'PRICED', changeType: 'UPDATED' }
                }
            },
            {
                id: '2',
                rfqId: 'RFQ-2024-001',
                eventType: 'COMMENT',
                fromStatus: null,
                toStatus: null,
                userId: 'Sarah Johnson (ST)',
                timestamp: '14:28',
                comment: 'Client is asking for better pricing on the spread',
                fieldChanges: {}
            },
            {
                id: '3',
                rfqId: 'RFQ-2024-001',
                eventType: 'ASSIGNMENT',
                fromStatus: null,
                toStatus: null,
                userId: 'John Smith (RT)',
                timestamp: '14:25',
                comment: 'Assigned RFQ for pricing',
                fieldChanges: {
                    assignedTo: { fieldName: 'assignedTo', oldValue: null, newValue: 'John Smith (RT)', changeType: 'UPDATED' }
                }
            },
            {
                id: '4',
                rfqId: 'RFQ-2024-001',
                eventType: 'STATUS_CHANGE',
                fromStatus: 'ACCEPTED',
                toStatus: 'PRICING',
                userId: 'Sarah Johnson (ST)',
                timestamp: '14:20',
                comment: 'Please price this RFQ - client is very interested',
                fieldChanges: {
                    status: { fieldName: 'status', oldValue: 'ACCEPTED', newValue: 'PRICING', changeType: 'UPDATED' }
                }
            },
            {
                id: '5',
                rfqId: 'RFQ-2024-001',
                eventType: 'STATUS_CHANGE',
                fromStatus: 'PENDING',
                toStatus: 'ACCEPTED',
                userId: 'Sarah Johnson (ST)',
                timestamp: '14:18',
                comment: 'Good client, worth pricing',
                fieldChanges: {
                    status: { fieldName: 'status', oldValue: 'PENDING', newValue: 'ACCEPTED', changeType: 'UPDATED' }
                }
            }
        ];

        dummyEvents.forEach(event => this.workflowEvents.set(event.id, event));

        const dummyComments = [
            {
                id: '1',
                rfqId: 'RFQ-2024-001',
                userId: 'Sarah Johnson (ST)',
                timestamp: '14:28',
                comment: 'Client is asking for better pricing on the spread',
                type: 'COMMENT'
            },
            {
                id: '2',
                rfqId: 'RFQ-2024-001',
                userId: 'John Smith (RT)',
                timestamp: '14:32',
                comment: 'Pricing complete. Spread tightened to 0.25',
                type: 'COMMENT'
            }
        ];

        dummyComments.forEach(comment => this.comments.set(comment.id, comment));
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

    async updateRfq(rfqId, updates)
    {
        return await this.updateRfqBackend(rfqId, updates);
    }

    async deleteRfq(rfqId)
    {
        return await this.deleteRfqBackend(rfqId);
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

    getComments(rfqId)
    {
        return Array.from(this.comments.values())
            .filter(comment => comment.rfqId === rfqId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    addComment(commentData)
    {
        const comment =
        {
            id: crypto.randomUUID(),
            rfqId: commentData.rfqId,
            userId: commentData.userId,
            timestamp: commentData.timestamp || new Date().toLocaleTimeString(),
            comment: commentData.comment,
            type: commentData.type || 'COMMENT'
        };
        this.comments.set(comment.id, comment);
        this.loggerService.logInfo(`Added comment with Id: ${comment.id} for RFQ with id: ${comment.rfqId}`);
        return comment;
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
        await this.addWorkflowEvent({
            rfqId,
            eventType: 'STATUS_CHANGE',
            fromStatus: rfq.status,
            toStatus: updatedRfq.status,
            userId,
            comment,
            fieldChanges
        });

        return updatedRfq;
    }

    async getUserRole(userId)
    {
        try
        {
            const availableTraders = await this.getAvailableTraders();
            const trader = availableTraders.find(t => t.id === userId);
            return trader ? trader.role : 'UNKNOWN';
        }
        catch (error)
        {
            this.loggerService.logError(`Error getting user role for ${userId}: ${error.message}`);
            return 'UNKNOWN';
        }
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

    async updateRfqBackend(rfqId, updates)
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
            
            // Update local cache
            this.rfqs.set(updatedRfq.rfqId, updatedRfq);
            
            return updatedRfq;
        }
        catch (error)
        {
            this.loggerService.logError(`Error updating RFQ: ${error.message}`);
            return null;
        }
    }

    async deleteRfqBackend(rfqId)
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
