import React, { useState, useEffect, useCallback } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon, Typography, Accordion, AccordionSummary, AccordionDetails, Tooltip, Button } from '@mui/material';
import { Send, VisibilityOff, SwapHorizontalCircle, NewReleases, CircleNotifications, Podcasts } from '@mui/icons-material';
import { MockDataService } from '../services/MockDataService';
import '../styles/css/main.css';
import { LoggerService } from '../services/LoggerService';
import {Sparklines, SparklinesBars} from "react-sparklines";
import {createArrayFromScore} from "../utilities";

const TaskListApp = () =>
{
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [dataService] = useState(new MockDataService());
    const [loggerService] = useState(new LoggerService(TaskListApp.name));
    const [worker, setWorker] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [expandedAccordion, setExpandedAccordion] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(
            new URL('../workers/task-reader.js', import.meta.url)
        );
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const newTask = event.data.task;
        setTasks((prevData) => [...prevData, newTask]);
    }, []);

    useEffect(() =>
    {
        if (worker) worker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (worker) worker.onmessage = null;
        };
    }, [worker]);

    useEffect(() =>
    {
        setTasks(dataService.get("task_list").filter(filterTaskDetail).filter(filterTaskTypes));
        setExpandedAccordion(null);
    }, [searchValue, searchType]);

    useEffect(() =>
    {
        //setSelectedTask(tasks[0]);
    }, [searchValue, searchType, tasks]);

    const selectTaskHandler = (task) =>
    {
        loggerService.logInfo(`Selected task in TaskListApp for context sharing with main: ${JSON.stringify(task)}`);
        setSelectedTask(task);
        window.contextSharer.sendContextToMain(task);
    };

    const filterTaskTypes = (task) =>
    {
        if (searchType === 'Completed' && task.status === "completed") return true;

        if (searchType === 'Dismissed' && task.status === "dismissed") return true;

        if (searchType === 'All' && task.status === "pending") return true;

        return task.type === searchType;
    };

    const filterTaskDetail = (task) =>
    {
        if (searchValue.trim() === '')
            return true;

        return (
            task.stockCode.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.market.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.stockDescription.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.metadata.toUpperCase().includes(searchValue.toUpperCase())
        );
    };

    const handleComplete = (completedTask) =>
    {
        loggerService.logInfo(`Completed task: ${JSON.stringify(completedTask)}`);
        completedTask.status = "completed";
        setTasks(prevTasks =>
        {
                return prevTasks.map(task => task.id === completedTask.id ? completedTask : task);
        });
        setSearchType(prevValue => prevValue);
    }

    const handleDismiss = (dismissedTask) =>
    {
        loggerService.logInfo(`Dismissed task: ${JSON.stringify(dismissedTask)}`);
        dismissedTask.status = "dismissed";
        setTasks(prevTasks =>
        {
            return prevTasks.map(task => task.id === dismissedTask.id ? dismissedTask : task);
        });
        setSearchType(prevValue => prevValue);
    }

    const handleAccordionChange = (panel) => (_, isExpanded) =>
    {
        if (isExpanded)
           setExpandedAccordion(panel);
        else
            setExpandedAccordion(null);
    };

    return (
        <div className="task-list-app">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <TextField className="task-search" size='small' label="Search task details"
                           variant="outlined" fullWidth value={searchValue}
                           onChange={(e) => setSearchValue(e.target.value)}/>
                <FormControl size="small" variant="outlined" style={{ minWidth: '174px' }}>
                    <InputLabel>Type of Task</InputLabel>
                    <Select label="Type of Task" value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ minWidth: '174px', width: '174px'}}>
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Blast">Blasts</MenuItem>
                        <MenuItem value="Order">Orders</MenuItem>
                        <MenuItem value="Desk Cross">Desk Crosses</MenuItem>
                        <MenuItem value="Potential Cross">Potential Crosses</MenuItem>
                        <MenuItem value="Alert">Alerts</MenuItem>
                        <MenuItem value="IOI Cross">IOI Cross</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Dismissed">Dismissed</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <List>
                {tasks.sort((first, second) => second.ranking - first.ranking).map((task, index) => (
                        <Accordion disableGutters key={index}
                                   expanded={expandedAccordion === `panel${index}`}
                                   onChange={handleAccordionChange(`panel${index}`)}>
                            <AccordionSummary className="task-list-summary" onClick={() => selectTaskHandler(task)}>
                                <ListItemIcon className="task-icon">
                                    {task.type === 'Desk Cross' && <SwapHorizontalCircle style={{ color: '#404040' }} />}
                                    {task.type === 'Potential Cross' && <VisibilityOff style={{ color: '#404040' }} />}
                                    {task.type === 'Alert' && <CircleNotifications style={{ color: '#404040' }} />}
                                    {task.type === 'Blast' && <Send style={{ color: '#404040' }} />}
                                    {task.type === 'IOI Cross' && <Podcasts style={{ color: '#404040' }} />}
                                    {task.type === 'Order' && <NewReleases style={{ color: '#404040' }} />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <div>
                                            <span className="task-stock-code">{task.stockCode}</span>
                                            <span className="task-type-label">{task.type.toUpperCase()}</span>
                                        </div>}
                                    secondary={
                                        <div>
                                            <span className="task-metadata">{task.metadata}</span>
                                        </div>}
                                />
                                {task.isLive && (
                                    <span className="task-live-label">LIVE</span>
                                )}
                                <div className="task-ranking-sparklines">
                                    <Sparklines data={createArrayFromScore(task.ranking)} limit={13} margin={5}>
                                        <SparklinesBars/>
                                    </Sparklines>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails className="task-list-detail">
                                <ListItemText
                                    primary={
                                        <div>
                                            <div>
                                                <span className="task-stock-code">{task.stockCode}</span>
                                                <Typography className="task-stock-description" component="span" variant="body2" color="textPrimary">{task.stockDescription}</Typography>
                                            </div>
                                        </div>}
                                    secondary={
                                        <div>
                                            <span className="task-ranking-number">Task Ranking: {task.ranking}</span>
                                            <span className="task-metadata-detail">{task.metadata}</span>
                                            <span className={`task-status ${task.status}`}>{task.status}</span>
                                            <div>
                                                {task.type === "Desk Cross"  && <span className="task-detail">Trader: {task.trader}</span>}
                                                {task.type === "Desk Cross"  && <span className="task-detail">Quantity: {task.quantity.toLocaleString()}</span>}
                                                {task.type === "Desk Cross"  && <span className="task-detail">Side: {task.side}</span>}
                                                {task.type === "Desk Cross"  && <span className="task-detail">Order Id: {task.orderId}</span>}
                                                {task.type === "IOI Cross"  && <span className="task-detail">Trader: {task.trader}</span>}
                                                {task.type === "IOI Cross"  && <span className="task-detail">Quantity: {task.quantity.toLocaleString()}</span>}
                                                {task.type === "IOI Cross"  && <span className="task-detail">Side: {task.side}</span>}
                                                {task.type === "IOI Cross"  && <span className="task-detail">Client: {task.client}</span>}
                                                {task.type === "Potential Cross"  && <span className="task-detail">Side: {task.side}</span>}
                                                {task.type === "Potential Cross"  && <span className="task-detail">Quantity: {task.quantity.toLocaleString()}</span>}
                                                {task.type === "Potential Cross"  && <span className="task-detail">Desk: {task.desk}</span>}
                                                {task.type === "Order"  && <span className="task-detail">New order has arrived from client: {task.client}</span>}
                                                {task.type === "Order"  && <span className="task-detail">Quantity: {task.quantity.toLocaleString()}</span>}
                                                {task.type === "Order"  && <span className="task-detail">Side: {task.side}</span>}
                                                {task.type === "Order"  && <span className="task-detail">Order ID: {task.orderId}</span>}
                                                {task.type === "Alert"  && <span className="task-detail">Client: {task.client}</span>}
                                                {task.type === "Alert"  && <span className="task-detail">Quantity: {task.quantity.toLocaleString()}</span>}
                                                {task.type === "Alert"  && <span className="task-detail">Side: {task.side}</span>}
                                                {task.type === "Alert"  && <span className="task-detail">Order ID: {task.orderId}</span>}
                                            </div>
                                            {(task.status === "pending") &&
                                            <div>
                                                <Tooltip title={<Typography fontSize={12}>Mark the task as completed.</Typography>}>
                                                    <span>
                                                        <Button className="task-action-button" color="primary" variant='contained' onClick={() => handleComplete(task)}>Complete</Button>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title={<Typography fontSize={12}>Dismiss the task as it not applicable or relevant.</Typography>}>
                                                    <span>
                                                        <Button className="task-action-button" color="primary" variant='contained' onClick={() => handleDismiss(task)}>Dismiss</Button>
                                                    </span>
                                                </Tooltip>
                                            </div>}
                                        </div>}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}
            </List>
        </div>
    );
};

export default TaskListApp;

