import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { Search, Work, Info, Alarm, CheckCircle } from '@mui/icons-material';
import {MockDataService} from "../services/MockDataService";

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

    return (
        <div>
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
                    <ListItem key={index} alignItems="flex-start" sx={{ border: '2px solid #404040', borderRadius: '4px', marginBottom: '8px' }}>
                        <ListItemIcon>
                            {task.type === 'crosses' && <Work color="primary" />}
                            {task.type === 'potential-crosses' && <Info color="secondary" />}
                            {task.type === 'alerts' && <Alarm color="error" />}
                        </ListItemIcon>
                        <ListItemText
                            primary={task.stockCode}
                            secondary={
                                <>
                                    {task.stockDescription}
                                    <Typography component="span" variant="body2" color="textPrimary">
                                        {task.timestamp}
                                    </Typography>
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
