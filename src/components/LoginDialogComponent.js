import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import '../style_sheets/dialog-base.css';
import {useRecoilState} from "recoil";
import {loginDialogDisplayState} from "../atoms/dialog-state";

const LoginDialogComponent = () =>
{
    const [loginDialogDisplay, setLoginDialogDisplay] = useRecoilState(loginDialogDisplayState);
    const [userId, setUserId] = useState('');
    const handleUserIdChange = (event) => setUserId(event.target.value);
    const handleSubmit = () =>
    {
        window.configurations.setLoggedInUserId(userId);
        setLoginDialogDisplay(false);
    }

    return (
        <Dialog aria-labelledby='dialog-title' open={Boolean(loginDialogDisplay)}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Log on to web-trader</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the user Id' value={userId} onChange={handleUserIdChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Button className="dialog-action-button submit" color="primary" disabled={userId === ''} variant='contained' onClick={handleSubmit}>Login</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoginDialogComponent;
