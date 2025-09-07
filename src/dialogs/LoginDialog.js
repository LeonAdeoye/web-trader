import React, {useState, useCallback} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import '../styles/css/main.css';

const LoginDialog = ({ onLoginSuccess }) =>
{
    const [loginDialogDisplay, setLoginDialogDisplay] = useState(true);
    const [userId, setUserId] = useState('');

    const handleUserIdChange = (event) => setUserId(event.target.value);

    const handleSubmit = useCallback(() =>
    {
        window.configurations.setLoggedInUserId(userId);
        setLoginDialogDisplay(false);
        
        // Call the login success callback if provided
        if (onLoginSuccess) 
        {
            onLoginSuccess();
        }
    }, [userId, onLoginSuccess]);

    const handleKeyDown = (event) =>
    {
        if (event.key === 'Enter' && userId !== '')
            handleSubmit();
    };

    return (
        <Dialog aria-labelledby='dialog-title' open={loginDialogDisplay}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Log on to web-trader</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter your user Id' value={userId} onKeyDown={handleKeyDown} onChange={handleUserIdChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Button className="dialog-action-button submit" color="primary" disabled={userId === ''} variant='contained' onClick={handleSubmit}>Login</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoginDialog;

