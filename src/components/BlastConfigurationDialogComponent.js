import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import React, {useState, useMemo, useEffect} from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";
import {Autocomplete} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import {selectedGenericGridRowState} from "../atoms/component-state";

const BlastConfigurationDialogComponent = ({ onCloseHandler , clientService, blastService}) =>
{
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [nameOfBlast, setNameOfBlast] = useState( '');
    const [client, setClient] = useState( '');
    const [markets, setMarkets] = useState([]);
    const [contents, setContents] = useState( [] );
    const [, setBlastId] = useState( );
    const [scheduledTime, setScheduledTime] = useState( '' );
    const [, setGridApi] = useState(null);
    const [, setGridColumnApi] = useState(null);
    const [rowMarketData, setRowMarketData] = useState([]);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

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
            setRowMarketData([...newRows]);
        }
    }, [markets]);

    useEffect(() =>
    {
        if(selectedGenericGridRow !== undefined)
        {
            setClient(clientService.getClients().find(client => client.clientId === selectedGenericGridRow.clientId).clientName);
            setContents(selectedGenericGridRow.contents);
            setNameOfBlast(selectedGenericGridRow.blastName);
            setScheduledTime(selectedGenericGridRow.triggerTime);
            setBlastId(selectedGenericGridRow.blastId);
            setMarkets(selectedGenericGridRow.markets);
            const marketRows = blastService.getBlasts().find(blast => blast.blastId === selectedGenericGridRow.blastId).markets;
            if(marketRows.length > 0)
            {
                const gridRows = marketRows.map(market => ({ market, adv: selectedGenericGridRow.advFilter[market] , notional: (selectedGenericGridRow.notionalValueFilter[market]) ? String((selectedGenericGridRow.notionalValueFilter[market]/1000000)) + "m" : ""}));
                setRowMarketData([...gridRows]);
            }
        }
        else
            cleanUp();

    }, [blastConfigDialogOpenFlag]);

    const validValues = () =>
    {
        return (nameOfBlast !== '' && client !== '' && markets.length > 0 && contents.length > 0);
    }

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={Boolean(blastConfigDialogOpenFlag)} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{selectedGenericGridRow !== undefined ? "Update Existing Blast Configuration" : "Add New Blast Configuration"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField size='small' label='Enter the blast name' value={nameOfBlast} onChange={handleNameOfBlastChange} fullWidth margin='normal' style={{marginTop: '35px', marginBottom: '5px', width:'400px'}} required/>
                        <Autocomplete size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                      options={clientService.getClients().map(client => client.clientName)} value={client} onChange={(event, newValue) => setClient(newValue)} freeSolo required />
                        <TextField size='small' label='Select the contents' select value={contents} onChange={handleContentsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}>
                            <MenuItem value='NEWS'>News</MenuItem>
                            <MenuItem value='FLOWS'>Flows</MenuItem>
                            <MenuItem value='HOLDINGS'>Holdings</MenuItem>
                            <MenuItem value='IOIs'>IOIs</MenuItem>
                            <MenuItem value='BLOCKS'>Blocks</MenuItem>
                        </TextField>
                        <TextField size='small' id="time" label="Schedule Run Time" type="time" value={scheduledTime} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                   InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }} onChange={(e) => setScheduledTime(e.target.value)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField size='small' label='Select applicable markets...' select value={markets} onChange={handleMarketsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '35px', marginBottom: '5px', width:'400px'}}>
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
                        <Button className="dialog-action-button" disabled={validValues()} variant='contained' onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={!validValues()} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default BlastConfigurationDialogComponent;
