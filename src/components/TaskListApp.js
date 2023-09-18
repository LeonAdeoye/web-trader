import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { Send, VisibilityOff, SwapHorizontalCircle, NewReleases, NotificationsIcon, CircleNotifications } from '@mui/icons-material';
import {MockDataService} from "../services/MockDataService";
import '../styles/css/main.css';

const TaskListApp = () =>
{
    const [searchRIC, setSearchRIC] = useState('');
    const [searchType, setSearchType] = useState('');
    const [tasks, setTasks] = useState([]);
    const [dataService] = useState(new MockDataService());

    useEffect(() =>
    {
        setTasks(dataService.get("task_list"));
    }, [searchRIC, searchType]);

    const formatTimestamp = timestamp =>
    {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="task-list-app">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <TextField className="task-search" size='small' label="Search stock or market code"
                    variant="outlined" fullWidth value={searchRIC}
                    onChange={(e) => setSearchRIC(e.target.value)}/>
                <FormControl size='small' variant="outlined" style={{ minWidth: '180px' }}>
                    <InputLabel>Type of Task</InputLabel>
                    <Select label="Type of Task" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Blasts">Blasts</MenuItem>
                        <MenuItem value="Orders">Orders</MenuItem>
                        <MenuItem value="Desk Cross">Crosses</MenuItem>
                        <MenuItem value="Potential Cross">Potential Crosses</MenuItem>
                        <MenuItem value="Alerts">Alerts</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <List>
                {tasks.map((task, index) => (
                    <ListItem className="task-list-item" key={index} alignItems="flex-start">
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
                                <Typography className="task-timestamp" component="span" variant="body2" color="textPrimary">{formatTimestamp(task.timestamp)}</Typography>
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
