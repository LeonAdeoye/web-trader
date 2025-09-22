import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import { LoggerService } from '../services/LoggerService';
import { ServiceRegistry } from '../services/ServiceRegistry';
import TitleBarComponent from "../components/TitleBarComponent";
import {Button, Paper, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Tooltip} from "@mui/material";

const RfqWorkflowsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("rfq-workflows"), []);
    const loggerService = useRef(new LoggerService(RfqWorkflowsApp.name)).current;
    const rfqService = useRef(ServiceRegistry.getRfqService()).current;
    const [rfqData, setRfqData] = useState(null);
    const [activityFeed, setActivityFeed] = useState([]);
    const [availableTraders, setAvailableTraders] = useState([]);
    const [validTransitions, setValidTransitions] = useState([]);
    const [newStatus, setNewStatus] = useState('');
    const [newAssignee, setNewAssignee] = useState('');
    const [newComment, setNewComment] = useState('');
    const [ownerId, setOwnerId] = useState('');

    useEffect(() =>
    {
        const loadOwner = async () => setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner().then(() => loggerService.logInfo(`Logged in user ID: ${ownerId}`));
    }, []);

    useEffect(() =>
    {
        try
        {
            const urlParams = new URLSearchParams(window.location.search);
            const rfqDataParam = urlParams.get('rfqData');
            if (rfqDataParam)
            {
                const parsedRfqData = JSON.parse(decodeURIComponent(rfqDataParam));
                setRfqData(parsedRfqData);
            }
            else
                loggerService.logError("No rfqData parameter found in URL");
        }
        catch (error)
        {
            loggerService.logError(`Error parsing RFQ data: ${error.message}`);
        }
    },[]);

    useEffect(() =>
    {
        const loadInitialData = async () =>
        {
            if (!rfqData)
                return;

            // const events = rfqService.getWorkflowEvents('RFQ-2024-001');
            const events = rfqService.getWorkflowEvents(rfqData.rfqId);
            setActivityFeed(events);
            const transitions = rfqService.getValidStatusTransitions(rfqData.status); // TODO
            setValidTransitions(transitions);
            const traders = await rfqService.getAvailableTraders();
            setAvailableTraders(traders);
        };

        loadInitialData().then(() => loggerService.logInfo("RFQs initial data has been loaded."));
    }, [rfqData]);

    const handleWorkflowAction =  useCallback(async () =>
    {
        try
        {
            if (newStatus)
            {
                const updatedRfq = await rfqService.processWorkflowAction(rfqData.rfqId, newStatus, ownerId, newComment);
                setRfqData(updatedRfq);
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
                const transitions = rfqService.getValidStatusTransitions(updatedRfq.status);
                setValidTransitions(transitions);
            }
            
            if (newAssignee)
            {
                const updatedRfq = rfqService.updateRfq(rfqData.rfqId, { assignedTo: newAssignee });
                setRfqData(updatedRfq);
                rfqService.addWorkflowEvent({rfqId: rfqData.rfqId, eventType: 'ASSIGNMENT', userId: ownerId, comment: `Assigned to ${newAssignee}`});
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
            }
            
            if (newComment && !newStatus)
            {
                rfqService.addComment({rfqId: rfqData.rfqId, userId: ownerId, comment: newComment}); // Not sure if needed.
                rfqService.addWorkflowEvent({rfqId: rfqData.rfqId, eventType: 'COMMENT', userId: ownerId, comment: newComment});
                const events = rfqService.getWorkflowEvents(rfqData.rfqId);
                setActivityFeed(events);
            }
            
            loggerService.logInfo(`Workflow action completed: Status=${newStatus}, Assignee=${newAssignee}, Comment=${newComment}`);
            setNewStatus('');
            setNewAssignee('');
            setNewComment('');
        }
        catch (error)
        {
            loggerService.logError(`Workflow action failed: ${error.message}`);
            alert(`Workflow action failed: ${error.message}`);
        }
    }, [rfqData, newStatus, newAssignee, newComment, ownerId]);

    const handleClear = useCallback(() =>
    {
        setNewStatus('');
        setNewAssignee('');
        setNewComment('');
    }, []);

    const getStatusColor = useCallback((status) =>
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
    }, []);

    const getActivityIcon = useCallback((eventType) =>
    {
        switch (eventType)
        {
            case 'COMMENT': return '💬';
            case 'STATUS_CHANGE': return '🔵';
            case 'ASSIGNMENT': return '👤';
            case 'ARRIVAL': return '📥';
            default: return '📝';
        }
    }, []);

    const formatActivityMessage = useCallback((event) =>
    {
        if (event.eventType === 'STATUS_CHANGE')
            return `Status changed: ${event.fromStatus} → ${event.toStatus}`;
        else if (event.eventType === 'ASSIGNMENT')
            return `Assigned RFQ for pricing`;
        else if (event.eventType === 'COMMENT')
            return event.comment;
        else
            return event.comment || 'Workflow event';
    }, []);

    const canClear = () => !(newStatus || newAssignee || newComment);

    if (!rfqData)
    {
        return (
            <>
                <TitleBarComponent title="RFQ Workflow - No Data" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        No RFQ data provided
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                        Please ensure you're accessing this page with valid RFQ data in the URL parameters.
                    </Typography>
                </div>
            </>
        );
    }

    return (
        <>
            <TitleBarComponent title={`RFQ Workflow: ${rfqData.request} (Arrived: ${rfqData.arrivalTime})`} windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin: '45px 0px 0px 0px'}}>
                <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <TextField
                                size="small"
                                label="Client"
                                value={rfqData.client}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Notional value in USD"
                                value={rfqData.notionalInUSD}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Underlying instrument code"
                                value={rfqData.underlying}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Underlying Price"
                                value={rfqData.underlyingPrice}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
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
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Assigned To"
                                value={rfqData.assignedTo}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Sales Credit in USD"
                                value={rfqData.salesCreditAmount}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                            <TextField
                                size="small"
                                label="Strike"
                                value={rfqData.strike}
                                InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '230px' }}/>
                        </div>
                    </div>
                </Paper>
                <Paper elevation={4} style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <FormControl size="small" style={{ width: '190px' }}>
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
                            <FormControl size="small" style={{ width: '190px' }}>
                                <InputLabel style={{ fontSize: '0.75rem' }}>Assign To</InputLabel>
                                <Select
                                    value={newAssignee}
                                    onChange={(e) => setNewAssignee(e.target.value)}
                                    style={{ fontSize: '0.75rem' }}>
                                    {availableTraders.map(trader => (
                                        <MenuItem key={trader.id} value={trader.name} style={{ fontSize: '0.75rem' }}>
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
                                style={{ width: '382px' }}
                                placeholder="Type your comment..."/>
                            <Tooltip title={<Typography fontSize={12}>Apply changes for all entered workflow values.</Typography>}>
                                <span>
                                    <Button className="dialog-action-button" style={{ fontSize: '0.75rem', marginRight: '5px' }} disabled={canClear()} variant='contained' onClick={handleWorkflowAction}>Apply</Button>
                                </span>
                            </Tooltip>
                            <Tooltip title={<Typography fontSize={12}>Clear all entered workflow values.</Typography>}>
                                <span>
                                    <Button className="dialog-action-button" style={{ fontSize: '0.75rem', marginRight: '5px' }} disabled={canClear()} variant='contained' onClick={handleClear}>Clear</Button>
                                </span>
                            </Tooltip>
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
