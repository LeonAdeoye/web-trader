import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Typography} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";

const BlastConfigurationDialogComponent = ({ onCloseHandler }) =>
{
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);

    const handleCancel = () =>
    {
        setBlastConfigDialogOpenFlag(false);
    }

    const handleValueChange = (event) =>
    {

    }

    const handleSubmit = () =>
    {
        setBlastConfigDialogOpenFlag(false);
    }

    const handleClear = () =>
    {

    }

    // {selectedGenericGridRow !== undefined ? "Update Existing Configuration" : "Add New Configuration"}

    return (
        <Dialog aria-labelledby='dialog-title' open={Boolean(blastConfigDialogOpenFlag)} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>See comment above</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the configuration value' value={'hello'} onChange={handleValueChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '-18px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={false} variant='contained' onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary"variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={false} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default BlastConfigurationDialogComponent;
