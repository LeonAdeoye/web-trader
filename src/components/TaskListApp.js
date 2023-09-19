import React, { useState, useEffect, useCallback } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, Accordion, AccordionSummary, AccordionDetails, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Send, VisibilityOff, SwapHorizontalCircle, NewReleases, CircleNotifications } from '@mui/icons-material';
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
    }, [searchValue, searchType]);

    const selectTaskHandler = (task) =>
    {
        loggerService.logInfo(`Selected task in TaskListApp for context sharing with main: ${JSON.stringify(task)}`);
        window.contextSharer.sendContextToMain(task);
    };

    const filterTaskTypes = (task) =>
    {
        if (searchType === 'Completed' && task.isCompleted === true) return true;

        if (searchType === 'All' && task.isCompleted === false) return true;

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
                        <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <List>
                {tasks
                    .sort((first, second) => second.ranking - first.ranking)
                    .map((task, index) => (
                        <Accordion key={index}>
                            <AccordionSummary className="task-list-item" onClick={() => selectTaskHandler(task)}>
                                <ListItemIcon className="task-icon">
                                    {task.type === 'Desk Cross' && <SwapHorizontalCircle style={{ color: '#404040' }} />}
                                    {task.type === 'Potential Cross' && <VisibilityOff style={{ color: '#404040' }} />}
                                    {task.type === 'Alert' && <CircleNotifications style={{ color: '#404040' }} />}
                                    {task.type === 'Blast' && <Send style={{ color: '#404040' }} />}
                                    {task.type === 'Order' && <NewReleases style={{ color: '#404040' }} />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <>
                                            <span className="task-stock-code">{task.stockCode}</span>
                                            <span className="task-type-label">{task.type.toUpperCase()}</span>
                                        </>}
                                    secondary={
                                        <>
                                            <span className="task-metadata">{task.metadata}</span>
                                        </>}
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
                            <AccordionDetails>
                                <ListItemText
                                    primary={
                                        <>
                                            <>
                                                <span className="task-stock-code">{task.stockCode}</span>
                                                <Typography className="task-stock-description" component="span" variant="body2" color="textPrimary">{task.stockDescription}</Typography>
                                            </>
                                        </>}
                                    secondary={
                                        <>
                                            <span className="task-ranking-number">Task Ranking: {task.ranking}</span>
                                            <span className="task-metadata-detail">{task.metadata}</span>
                                        </>}
                                />
                            </AccordionDetails>
                        </Accordion>
                    ))}
            </List>
        </div>
    );
};

export default TaskListApp;

