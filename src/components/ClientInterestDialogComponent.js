import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {SideWidget} from "../widgets/SideWidget";

const ClientInterestDialogComponent = ({ closeHandler , instrumentService }) =>
{
    const defaultClientInterest =
    {
        notes: '',
        instrumentCode: '',
        instrumentDescription: '',
        side: 'Buy',
        clientInterestId: ''
    };

    const [clientInterestDialogOpenFlag, setClientInterestDialogOpenFlag] = useRecoilState(clientInterestDialogDisplayState)
    const [clientInterest, setClientInterest] = useState(defaultClientInterest);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const canClear = () => clientInterest.instrumentCode !== '' || clientInterest.notes !== '';

    const canSubmit = () => clientInterest.instrumentCode !== '' && clientInterest.side !== '';

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

    useEffect( () =>
    {
        if(selectedGenericGridRow)
        {
            const clientInterest = selectedGenericGridRow;
            setClientInterest(clientInterest);
        }
        else
            setClientInterest(defaultClientInterest);

    }, [clientInterestDialogOpenFlag, selectedGenericGridRow]);

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={clientInterestDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: { width: '383px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={1} direction="column">
                    <Grid item container spacing={1}>
                        <Grid item>
                            {/*<ClientAutoCompleteWidget instrumentService={instrumentService} handleInputChange={handleInputChange} instrumentCode={clientInterest.instrumentCode} className={"client-interest-symbol"} />*/}
                            <Autocomplete
                                className="client-interest-symbol"
                                size='small'
                                renderInput={(params) => <TextField {...params} label='Select instrument' />}
                                style={{ width: '203px', marginTop: '15px'}}
                                value={clientInterest.instrumentCode || null}
                                options={(instrumentService.getInstruments() || []).map(instrument => instrument.instrumentCode)}
                                onChange={(_, newValue) => handleInputChange("instrumentCode", newValue)}
                                required
                                isOptionEqualToValue={(option, value) => option === value} />
                        </Grid>
                        <Grid item>
                            <SideWidget handleSideChange={handleSideChange} sideValue={clientInterest.side} className={"client-interest-side"}/>
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
