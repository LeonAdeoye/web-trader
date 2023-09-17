import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { Work, Info, Alarm, CheckCircle } from '@mui/icons-material';
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
                <TextField label="Search by RIC or Stock Description"
                    variant="outlined" fullWidth value={searchRIC}
                    onChange={(e) => setSearchRIC(e.target.value)}/>
                <FormControl variant="outlined" style={{ minWidth: '200px' }}>
                    <InputLabel>Type of Task</InputLabel>
                    <Select label="Type of Task" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="blasts">Blasts</MenuItem>
                        <MenuItem value="orders">Orders</MenuItem>
                        <MenuItem value="crosses">Crosses</MenuItem>
                        <MenuItem value="potential-crosses">Potential Crosses</MenuItem>
                        <MenuItem value="alerts">Alerts</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <List>
                {tasks.map((task, index) => (
                    <ListItem className="task-list-item" key={index} alignItems="flex-start">
                        <ListItemIcon>
                            {task.type === 'crosses' && <Work color="primary"/>}
                            {task.type === 'potential-crosses' && <Info color="secondary" />}
                            {task.type === 'alerts' && <Alarm color="error" />}
                        </ListItemIcon>
                        <ListItemText
                            primary={task.stockCode}
                            secondary={
                                <>
                                    {task.stockDescription}
                                    <Typography component="span" variant="body2" color="textPrimary">{formatTimestamp(task.timestamp)}</Typography>
                                    {task.isCompleted && <CheckCircle style={{ color: 'green' }} />}
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default TaskListApp;
