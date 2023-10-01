import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import React, {useState, useMemo, useEffect} from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";
import {Autocomplete} from "@mui/material";
import {DataService} from "../services/DataService";
import {AgGridReact} from "ag-grid-react";

const BlastConfigurationDialogComponent = ({ onCloseHandler , dataService}) =>
{
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [nameOfBlast, setNameOfBlast] = useState( '');
    const [client, setClient] = useState( '');
    const [markets, setMarkets] = useState([]);
    const [contents, setContents] = useState( [] );
    const [scheduledTime, setScheduledTime] = useState( null );
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowMarketData, setRowMarketData] = useState([]);

    const columnDefs = useMemo(() => ([
        { headerName: "Market", field: "market", width: 150},
        { headerName: "ADV%", field: "adv" , width:90, editable: true},
        { headerName: "Notional", field: "notional", width: 90, editable: true}
    ]), []);

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

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
        setRowMarketData([]);
    }

    useEffect(() =>
    {
        if(markets.length > 0)
        {
            const newRows = markets.map(market => ({ market, adv: '', notional: '' }));
            setRowMarketData([...rowMarketData, ...newRows]);
        }
    }, [markets]);

    // {selectedGenericGridRow !== undefined ? "Update Existing Configuration" : "Add New Configuration"}

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={Boolean(blastConfigDialogOpenFlag)} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Blast Configuration</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField size='small' label='Enter the blast name' value={nameOfBlast} onChange={handleNameOfBlastChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '5px', width:'400px'}} required/>
                        <Autocomplete size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                      options={dataService.getData(DataService.CLIENTS).map(client => client.clientName)} value={client} onChange={(event, newValue) => setClient(newValue)} freeSolo required />
                        <TextField size='small' label='Select the contents...' select value={contents} onChange={handleContentsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}>
                            <MenuItem value='News'>News</MenuItem>
                            <MenuItem value='Flows'>Flows</MenuItem>
                            <MenuItem value='Holdings'>Holdings</MenuItem>
                            <MenuItem value='IOIs'>IOIs</MenuItem>
                        </TextField>
                        <TextField size='small' id="time" label="Schedule Run Time" type="time" defaultValue="" style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                   InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }} onChange={(e) => setScheduledTime(e.target.value)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField size='small' label='Select applicable markets...' select value={markets} onChange={handleMarketsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '10px', marginBottom: '5px', width:'400px'}}>
                            <MenuItem value='HK'>Hong Kong</MenuItem>
                            <MenuItem value='JP'>Japan</MenuItem>
                            <MenuItem value='SG'>Singapore</MenuItem>
                            <MenuItem value='IN'>India</MenuItem>
                            <MenuItem value='AU'>Australia</MenuItem>
                            <MenuItem value='KR'>Korea</MenuItem>
                        </TextField>
                        <div className="ag-theme-alpine" style={{ height: '140px', width: '400px', marginTop: '5px'}}>
                            <AgGridReact onGridReady={onGridReady} columnDefs={columnDefs} rowData={rowMarketData} rowHeight={25} headerHeight={25}/>
                        </div>
                    </Grid>
                </Grid>
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
