import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";

const ClientInterestDialogComponent = ({ closeHandler , instrumentService }) =>
{
    const defaultClientInterest =
    {
        notes: '',
        stockCode: '',
        side: 'Buy'
    };

    const [clientInterestDialogOpenFlag, setClientInterestDialogOpenFlag] = useRecoilState(clientInterestDialogDisplayState)
    const [clientInterest, setClientInterest] = useState(defaultClientInterest);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const canClear = () => clientInterest.stockCode !== '' || clientInterest.notes !== '';

    const canSubmit = () => clientInterest.stockCode !== '' && clientInterest.side !== '';

    const handleInputChange = useCallback((name, value) =>
    {
        setClientInterest(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const handleSideChange = ({target}) =>
    {
        const value = target.value;
        handleInputChange('side',  value);
    }

    const getTitle = () => "Create Client Interest";

    const handleClear = () => setClientInterest(defaultClientInterest);

    const handleCancel = () => setClientInterestDialogOpenFlag(false);

    const handleSubmit = () =>
    {
        closeHandler(clientInterest);
        handleClear();
        handleCancel();
    }

    useEffect( () => {
        if(clientInterestDialogOpenFlag && selectedGenericGridRow)
        {
            const clientInterest = selectedGenericGridRow;
            setClientInterest(clientInterest);
        }
    }, [clientInterestDialogOpenFlag, selectedGenericGridRow]);

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={clientInterestDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: { width: '383px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={1} direction="column">
                    <Grid item container spacing={1}>
                        <Grid item>
                            <Autocomplete
                                className="client-interest-symbol"
                                size='small'
                                renderInput={(params) => <TextField {...params} label='Select the stock code' />}
                                style={{ width: '203px', marginTop: '15px'}}
                                value={clientInterest.stockCode || null}
                                options={(instrumentService.getInstruments() || []).map(instrument => instrument.stockCode)}
                                onChange={(_, newValue) => handleInputChange("stockCode", newValue)}
                                required
                                isOptionEqualToValue={(option, value) => option === value} />
                        </Grid>
                        <Grid item>
                            <TextField
                                className="client-interest-side"
                                size='small'
                                label='Select side'
                                select
                                value={clientInterest.side}
                                onChange={handleSideChange}
                                fullWidth
                                style={{ width: '120px', marginTop: '15px'}}>
                                <MenuItem value='BUY'>Buy</MenuItem>
                                <MenuItem value='SELL'>Sell</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* Row for Notes control */}
                    <Grid item>
                        <TextField
                            className="client-interest-notes"
                            size='small'
                            label="Notes"
                            value={clientInterest.notes}
                            style={{ width: '330px' }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            fullWidth/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={!canClear()} variant='contained' onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close client interest dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={!canSubmit()} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default ClientInterestDialogComponent;
