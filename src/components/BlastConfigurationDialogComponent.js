import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";
import {Autocomplete} from "@mui/material";
import {DataService} from "../services/DataService";

const BlastConfigurationDialogComponent = ({ onCloseHandler , dataService}) =>
{
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [nameOfBlast, setNameOfBlast] = useState( '');
    const [client, setClient] = useState( '');
    const [markets, setMarkets] = useState([]);
    const [contents, setContents] = useState( [] );
    const [scheduledTime, setScheduledTime] = useState( null );

    const handleMarketsChange = (event) =>
    {
        const value = event.target.value;
        setMarkets(typeof value === 'string' ? value.split(',') : value);
    }

    const handleCancel = () =>
    {
        setBlastConfigDialogOpenFlag(false);
    }

    const handleNameOfBlastChange = (event) =>
    {
        setNameOfBlast(event.target.value);
    }

    const handleSubmit = () =>
    {
        setBlastConfigDialogOpenFlag(false);
    }

    const handleContentsChange = (event) =>
    {
        const value = event.target.value;
        setContents(typeof value === 'string' ? value.split(',') : value);
    }

    const handleClear = () =>
    {
        cleanUp();
    }

    const cleanUp = () =>
    {
        setNameOfBlast('');
        setClient('');
        setMarkets([]);
        setContents([]);
    }

    // {selectedGenericGridRow !== undefined ? "Update Existing Configuration" : "Add New Configuration"}

    return (
        <Dialog aria-labelledby='dialog-title' open={Boolean(blastConfigDialogOpenFlag)} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>See comment above</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the blast name' value={nameOfBlast} onChange={handleNameOfBlastChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '5px', width:'400px'}} required/>
                <Autocomplete size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px'}}
                              options={dataService.getData(DataService.CLIENTS).map(client => client.clientName)} value={client} onChange={(event, newValue) => setClient(newValue)} freeSolo required />
                <TextField size='small' label='Select applicable markets...' select value={markets} onChange={handleMarketsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px'}}>
                    <MenuItem value='HK'>Hong Kong</MenuItem>
                    <MenuItem value='JP'>Japan</MenuItem>
                    <MenuItem value='SG'>Singapore</MenuItem>
                    <MenuItem value='IN'>India</MenuItem>
                    <MenuItem value='AU'>Australia</MenuItem>
                    <MenuItem value='KR'>Korea</MenuItem>
                </TextField>
                <TextField size='small' label='Select the contents...' select value={contents} onChange={handleContentsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px'}}>
                    <MenuItem value='News'>News</MenuItem>
                    <MenuItem value='Flows'>Flows</MenuItem>
                    <MenuItem value='Holdings'>Holdings</MenuItem>
                    <MenuItem value='IOIs'>IOIs</MenuItem>
                </TextField>
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
