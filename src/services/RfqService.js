import { LoggerService } from './LoggerService';

class RfqService
{
    constructor()
    {
        this.loggerService = new LoggerService(RfqService.name);
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

    getRfqById(rfqId)
    {
        return this.rfqs.get(rfqId);
    }

    getAllRfqs()
    {
        return Array.from(this.rfqs.values());
    }

    createRfq(rfqData)
    {
        const rfq =
        {
            ...rfqData,
            rfqId: rfqData.rfqId || `RFQ-${Date.now()}`,
            lastActivity: new Date().toLocaleTimeString(),
            createdBy: rfqData.createdBy || 'Unknown User'
        };
        
        this.rfqs.set(rfq.rfqId, rfq);
        this.loggerService.logInfo(`Created RFQ: ${rfq.rfqId}`);
        return rfq;
    }

    updateRfq(rfqId, updates)
    {
        const existingRfq = this.rfqs.get(rfqId);
        if (!existingRfq)
            throw new Error(`RFQ not found: ${rfqId}`);

        const updatedRfq =
        {
            ...existingRfq,
            ...updates,
            lastActivity: new Date().toLocaleTimeString()
        };

        this.rfqs.set(rfqId, updatedRfq);
        this.loggerService.logInfo(`Updated RFQ: ${rfqId}`);
        return updatedRfq;
    }

    deleteRfq(rfqId)
    {
        const deleted = this.rfqs.delete(rfqId);
        if (deleted)
            this.loggerService.logInfo(`Deleted RFQ: ${rfqId}`);
        return deleted;
    }

    getWorkflowEvents(rfqId)
    {
        return Array.from(this.workflowEvents.values())
            .filter(event => event.rfqId === rfqId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    addWorkflowEvent(eventData)
    {
        const event =
        {
            id: eventData.id || `event-${Date.now()}`,
            rfqId: eventData.rfqId,
            eventType: eventData.eventType,
            fromStatus: eventData.fromStatus,
            toStatus: eventData.toStatus,
            userId: eventData.userId,
            timestamp: eventData.timestamp || new Date().toLocaleTimeString(),
            comment: eventData.comment,
            fieldChanges: eventData.fieldChanges || {}
        };

        this.workflowEvents.set(event.id, event);
        this.loggerService.logInfo(`Added workflow event: ${event.id} for RFQ: ${event.rfqId}`);
        return event;
    }

    getComments(rfqId)
    {
        return Array.from(this.comments.values())
            .filter(comment => comment.rfqId === rfqId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    addComment(commentData)
    {
        const comment = {
            id: commentData.id || `comment-${Date.now()}`,
            rfqId: commentData.rfqId,
            userId: commentData.userId,
            timestamp: commentData.timestamp || new Date().toLocaleTimeString(),
            comment: commentData.comment,
            type: commentData.type || 'COMMENT'
        };

        this.comments.set(comment.id, comment);
        this.loggerService.logInfo(`Added comment: ${comment.id} for RFQ: ${comment.rfqId}`);
        return comment;
    }

    // Status and workflow management
    getValidStatusTransitions(currentStatus, userRole)
    {
        const transitions =
        {
            'PENDING': userRole === 'ST' ? ['ACCEPTED', 'REJECTED'] : [],
            'ACCEPTED': userRole === 'ST' ? ['PRICING'] : [],
            'PRICING': userRole === 'RT' ? ['PRICED'] : [],
            'PRICED': userRole === 'ST' ? ['TRADED_AWAY', 'TRADE_COMPLETED'] : [],
            'REJECTED': [],
            'TRADED_AWAY': [],
            'TRADE_COMPLETED': []
        };
        return transitions[currentStatus] || [];
    }

    getAvailableTraders()
    {
        return [
            { id: 'john-smith', name: 'John Smith (RT)', role: 'RT' },
            { id: 'jane-doe', name: 'Jane Doe (RT)', role: 'RT' },
            { id: 'mike-wilson', name: 'Mike Wilson (RT)', role: 'RT' },
            { id: 'sarah-johnson', name: 'Sarah Johnson (ST)', role: 'ST' },
            { id: 'alex-brown', name: 'Alex Brown (ST)', role: 'ST' }
        ];
    }

    // Workflow action processing
    processWorkflowAction(rfqId, action, userId, comment = null, fieldChanges = {})
    {
        const rfq = this.getRfqById(rfqId);
        if (!rfq)
            throw new Error(`RFQ not found: ${rfqId}`);

        const userRole = this.getUserRole(userId);
        const validTransitions = this.getValidStatusTransitions(rfq.status, userRole);
        
        if (!validTransitions.includes(action))
            throw new Error(`Invalid workflow action: ${action} for status: ${rfq.status} by user role: ${userRole}`);

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

        const updatedRfq = this.updateRfq(rfqId, updates);
        this.addWorkflowEvent({
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

    getUserRole(userId)
    {
        const trader = this.getAvailableTraders().find(t => t.id === userId);
        return trader ? trader.role : 'UNKNOWN';
    }

    async loadRfqs()
    {
        // TODO: Implement API call to rfq-service
        this.loggerService.logInfo('Loading RFQs from backend service...');
        return this.getAllRfqs();
    }

    async saveRfq(rfqData)
    {
        // TODO: Implement API call to rfq-service
        this.loggerService.logInfo(`Saving RFQ to backend service: ${rfqData.rfqId}`);
        return this.createRfq(rfqData);
    }

    async updateRfqBackend(rfqId, updates)
    {
        // TODO: Implement API call to rfq-service
        this.loggerService.logInfo(`Updating RFQ in backend service: ${rfqId}`);
        return this.updateRfq(rfqId, updates);
    }

    async deleteRfqBackend(rfqId)
    {
        // TODO: Implement API call to rfq-service
        this.loggerService.logInfo(`Deleting RFQ from backend service: ${rfqId}`);
        return this.deleteRfq(rfqId);
    }
}

export { RfqService };
