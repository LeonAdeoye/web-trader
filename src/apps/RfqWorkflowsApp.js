import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { selectedContextShareState } from '../atoms/component-state';
import { LoggerService } from '../services/LoggerService';
import { ServiceRegistry } from '../services/ServiceRegistry';
import TitleBarComponent from "../components/TitleBarComponent";
import { Button, Paper, TextField, Typography, MenuItem, FormControl, InputLabel, Select } from "@mui/material";

const RfqWorkflowsApp = () =>
{
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const windowId = useMemo(() => window.command.getWindowId("rfq-workflows"), []);
    const loggerService = useRef(new LoggerService(RfqWorkflowsApp.name)).current;
    const rfqService = useRef(ServiceRegistry.getRfqService()).current;
    
    // RFQ data from service
    const [rfqData, setRfqData] = useState(null);
    const [activityFeed, setActivityFeed] = useState([]);
    const [availableTraders, setAvailableTraders] = useState([]);
    const [validTransitions, setValidTransitions] = useState([]);

    // Workflow state
    const [newStatus, setNewStatus] = useState('');
    const [newAssignee, setNewAssignee] = useState('');
    const [newComment, setNewComment] = useState('');


    // Load initial data - force recompile
    useEffect(() =>
    {
        const loadInitialData = () =>
        {
            // Get the first RFQ for demo purposes
            const rfqs = rfqService.getAllRfqs();
            if (rfqs.length > 0)
            {
                const firstRfq = rfqs[0];
                setRfqData(firstRfq);
                
                // Load workflow events for this RFQ
                const events = rfqService.getWorkflowEvents(firstRfq.rfqId);
                setActivityFeed(events);
                
                // Get valid transitions for current status
                const transitions = rfqService.getValidStatusTransitions(firstRfq.status, 'RT');
                setValidTransitions(transitions);
            }
            
            // Load available traders
            const traders = rfqService.getAvailableTraders();
            setAvailableTraders(traders);
        };

        loadInitialData();
    }, [rfqService]);

    const handleWorkflowAction = () =>
    {
        if (!rfqData)
            return;

        try
        {
            if (newStatus)
            {
                // Process status change
                const updatedRfq = rfqService.processWorkflowAction(
                    rfqData.rfqId, 
                    newStatus, 
                    'current-user', // TODO: Get actual user ID
                    newComment
                );
                setRfqData(updatedRfq);
                
                // Refresh activity feed
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
                
                // Update valid transitions
                const transitions = rfqService.getValidStatusTransitions(updatedRfq.status, 'RT');
                setValidTransitions(transitions);
            }
            
            if (newAssignee)
            {
                // Process assignment change
                const updatedRfq = rfqService.updateRfq(rfqData.rfqId, { assignedTo: newAssignee });
                setRfqData(updatedRfq);
                
                // Add workflow event for assignment
                rfqService.addWorkflowEvent({
                    rfqId: rfqData.rfqId,
                    eventType: 'ASSIGNMENT',
                    userId: 'current-user',
                    comment: `Assigned to ${newAssignee}`
                });
                
                // Refresh activity feed
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
            }
            
            if (newComment && !newStatus)
            {
                // Add comment only
                rfqService.addComment({
                    rfqId: rfqData.rfqId,
                    userId: 'current-user',
                    comment: newComment
                });
                
                // Refresh activity feed
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
            }
            
            loggerService.logInfo(`Workflow action completed: Status=${newStatus}, Assignee=${newAssignee}, Comment=${newComment}`);
            
            // Reset form
            setNewStatus('');
            setNewAssignee('');
            setNewComment('');
        }
        catch (error)
        {
            loggerService.logError(`Workflow action failed: ${error.message}`);
            alert(`Workflow action failed: ${error.message}`);
        }
    };

    const handleCancel = () =>
    {
        setNewStatus('');
        setNewAssignee('');
        setNewComment('');
    };

    const getStatusColor = (status) =>
    {
        switch (status)
        {
            case 'PENDING': return '#ffa726';
            case 'ACCEPTED': return '#66bb6a';
            case 'PRICING': return '#ab47bc';
            case 'PRICED': return '#42a5f5';
            case 'TRADED_AWAY': return '#ff7043';
            case 'TRADE_COMPLETED': return '#26a69a';
            default: return '#9e9e9e';
        }
    };

    const getActivityIcon = (eventType) =>
    {
        switch (eventType)
        {
            case 'COMMENT': return '💬';
            case 'STATUS_CHANGE': return '🔵';
            case 'ASSIGNMENT': return '👤';
            default: return '📝';
        }
    };

    const formatActivityMessage = (event) =>
    {
        if (event.eventType === 'STATUS_CHANGE')
            return `Status changed: ${event.fromStatus} → ${event.toStatus}`;
        else if (event.eventType === 'ASSIGNMENT')
            return `Assigned RFQ for pricing`;
        else if (event.eventType === 'COMMENT')
            return event.comment;
        else
            return event.comment || 'Workflow event';
    };

    // Show loading state if no RFQ data
    if (!rfqData)
    {
        return (
            <>
                <TitleBarComponent 
                    title="RFQ Workflow: Loading..."
                    windowId={windowId} 
                    addButtonProps={undefined}
                    showChannel={false} 
                    showTools={false}
                />
                <div style={{ 
                    width: '100%', 
                    height: 'calc(100vh - 65px)', 
                    float: 'left', 
                    padding: '20px', 
                    margin: '45px 0px 0px 0px',
                    textAlign: 'center'
                }}>
                    <Typography variant="h6">Loading RFQ data...</Typography>
                </div>
            </>
        );
    }

    return (
        <>
            <TitleBarComponent 
                title={`RFQ Workflow: ${rfqData.rfqId}`}
                windowId={windowId} 
                addButtonProps={undefined}
                showChannel={false} 
                showTools={false}/>
            
            <div style={{ 
                width: '100%', 
                height: 'calc(100vh - 65px)', 
                float: 'left', 
                padding: '0px',
                margin: '45px 0px 0px 0px'
            }}>
                <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <TextField 
                                size="small"
                                label="RFQ ID" 
                                value={rfqData.rfqId} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Client" 
                                value={rfqData.client} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Underlying" 
                                value={rfqData.underlying} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Strike" 
                                value={rfqData.strike} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <TextField 
                                size="small"
                                label="Current Status"
                                value={rfqData.status} 
                                InputProps={{ 
                                    readOnly: true, 
                                    style: { 
                                        fontSize: '0.75rem',
                                        color: getStatusColor(rfqData.status),
                                        fontWeight: 'bold'
                                    } 
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Assigned To" 
                                value={rfqData.assignedTo} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Priority" 
                                value={rfqData.priority} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                            <TextField 
                                size="small"
                                label="Last Activity" 
                                value={rfqData.lastActivity} 
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '180px' }}/>
                        </div>
                    </div>
                </Paper>

                {/* Activity Feed */}
                <Paper elevation={4} style={{ padding: '10px' }}>
                    {/* Workflow Controls */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <FormControl size="small" style={{ width: '150px' }}>
                                <InputLabel style={{ fontSize: '0.75rem' }}>Change Status</InputLabel>
                                <Select 
                                    value={newStatus} 
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    style={{ fontSize: '0.75rem' }}>
                                    {validTransitions.map(status => (
                                        <MenuItem key={status} value={status} style={{ fontSize: '0.75rem' }}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" style={{ width: '150px' }}>
                                <InputLabel style={{ fontSize: '0.75rem' }}>Assign To</InputLabel>
                                <Select 
                                    value={newAssignee} 
                                    onChange={(e) => setNewAssignee(e.target.value)}
                                    style={{ fontSize: '0.75rem' }}>
                                    {availableTraders.map(trader => (
                                        <MenuItem key={trader.id} value={trader.id} style={{ fontSize: '0.75rem' }}>
                                            {trader.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                label="Add Comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                InputProps={{ style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '200px' }}
                                placeholder="Type your comment..."
                            />
                            <Button 
                                variant="contained" 
                                size="small"
                                onClick={handleWorkflowAction}
                                style={{ fontSize: '0.75rem', marginRight: '5px' }}>
                                Apply Changes
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={handleCancel}
                                style={{ fontSize: '0.75rem' }}>
                                Cancel
                            </Button>
                        </div>
                    
                    <div style={{ height: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                        {activityFeed.map(event => (
                            <div key={event.id} style={{ 
                                padding: '8px', 
                                borderBottom: '1px solid #eee',
                                backgroundColor: event.eventType === 'COMMENT' ? '#f5f5f5' : '#fff'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>{getActivityIcon(event.eventType)}</span>
                                    <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.75rem' }}>
                                        {event.timestamp} - {event.userId}
                                    </Typography>
                                </div>
                                <Typography variant="body1" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                                    {formatActivityMessage(event)}
                                </Typography>
                                {event.comment && event.eventType !== 'COMMENT' && (
                                    <Typography variant="body2" style={{ 
                                        fontSize: '0.75rem', 
                                        marginTop: '4px', 
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}>
                                        "{event.comment}"
                                    </Typography>
                                )}
                            </div>
                        ))}
                    </div>
                </Paper>

            </div>
        </>
    );
};

export default RfqWorkflowsApp;
