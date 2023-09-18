import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { Send, VisibilityOff, SwapHorizontalCircle, NewReleases, CircleNotifications } from '@mui/icons-material';
import {MockDataService} from "../services/MockDataService";
import '../styles/css/main.css';

const TaskListApp = () =>
{
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [dataService] = useState(new MockDataService());

    useEffect(() =>
    {
        setTasks(dataService.get("task_list").filter(filterTaskDetail).filter(filterTaskTypes));
    }, [searchValue, searchType]);

    const selectTaskHandler = (e) =>
    {
        const task = tasks.find(task => task.id === e.currentTarget.id);
        console.log(task);
    }

    const taskDetailHandler = (e) =>
    {
        const task = tasks.find(task => task.id === e.currentTarget.id);
        console.log(task);
    }

    const filterTaskTypes = (task) =>
    {
        if(searchType ===  'Completed' && task.isCompleted === true)
            return true;

        if(searchType ===  'All' && task.isCompleted === false)
            return true;

        return task.type === searchType;
    }

    const filterTaskDetail = (task) =>
    {
        if(searchValue.trim() === '')
            return true;

        return task.stockCode.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.market.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.stockDescription.toUpperCase().includes(searchValue.toUpperCase()) ||
            task.metadata.toUpperCase().includes(searchValue.toUpperCase());
    }

    return (
        <div className="task-list-app">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <TextField className="task-search" size='small' label="Search task details"
                    variant="outlined" fullWidth value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}/>
                <FormControl size='small' variant="outlined" style={{ minWidth: '180px' }}>
                    <InputLabel>Type of Task</InputLabel>
                    <Select label="Type of Task" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
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
                {tasks.sort((first, second) => second.ranking - first.ranking) .map((task, index) => (
                    <ListItem className="task-list-item" key={index} alignItems="flex-start" onDoubleClick={taskDetailHandler} onClick={selectTaskHandler}>
                        <ListItemIcon>
                            {task.type === 'Desk Cross' && <SwapHorizontalCircle style={{ color: '#404040' }} />}
                            {task.type === 'Potential Cross' && <VisibilityOff style={{ color: '#404040' }} />}
                            {task.type === 'Alert' && <CircleNotifications style={{ color: '#404040' }} />}
                            {task.type === 'Blast' && <Send style={{ color: '#404040' }} />}
                            {task.type === 'Order' && <NewReleases style={{ color: '#404040' }} />}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                            <>
                                <span className="stock-code">{task.stockCode}</span>
                                <Typography className="stock-description" component="span" variant="body2" color="textPrimary">{task.stockDescription}</Typography>
                            </>}
                            secondary={
                            <>
                                <span className="task-type-label">{task.type.toUpperCase()}</span>
                                <span className="task-metadata">{task.metadata}</span>
                            </>}
                        />
                        {task.isLive &&  <span className="task-live-label">LIVE</span>}
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default TaskListApp;
