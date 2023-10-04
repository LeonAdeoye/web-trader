import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import React, {useState, useMemo, useEffect} from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";
import {Autocomplete} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {isEmptyString, numberFormatter} from "../utilities";

const BlastConfigurationDialogComponent = ({ onCloseHandler , clientService }) =>
{
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [blastName, setBlastName] = useState( '');
    const [clientName, setClientName] = useState( '');
    const [markets, setMarkets] = useState([]);
    const [contents, setContents] = useState( [] );
    const [blastId, setBlastId] = useState(null);
    const [triggerTime, setTriggerTime] = useState( '' );
    const [, setGridApi] = useState(null);
    const [, setGridColumnApi] = useState(null);
    const [rowMarketData, setRowMarketData] = useState([]);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const columnDefs = useMemo(() => ([
        { headerName: "Market", field: "market", width: 140},
        { headerName: "ADV%", field: "adv" , width:90, editable: true},
        { headerName: "Notional", field: "notional", width: 110, editable: true, valueFormatter: numberFormatter}
    ]), []);

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const handleMarketsChange = (event) =>
    {
        const selectedMarkets = event.target.value;
        setMarkets(selectedMarkets);
        setRowMarketData(previousRowMarketData =>
        {
            const newRows = [];
            for(let market of selectedMarkets)
            {
                const row = previousRowMarketData.find(row => row.market === market);
                if(row)
                    newRows.push(row);
                else
                    newRows.push({market: market});
            }
            return newRows;
        });
    }

    const handleCancel = () =>
    {
        setBlastConfigDialogOpenFlag(false);
    }

    const handleBlastNameChange = (event) =>
    {
        setBlastName(event.target.value);
    }

    const handleClientChange = (event) =>
    {
        setClientName(event.target.value);
    }

    const convertToFilters = (rows) =>
    {
        let advFilter = {};
        let notionalValueFilter = {};

        for(let row of rows)
        {
            if (row.market && row.adv)
                advFilter[row.market] = row.adv;

            if (row.market && row.notional)
                notionalValueFilter[row.market] = row.notional;
        }

        return {
            advFilter: advFilter,
            notionalValueFilter: notionalValueFilter
        };
    }

    const handleSubmit = () =>
    {
        setBlastConfigDialogOpenFlag(false);
        const {advFilter, notionalValueFilter} = convertToFilters(rowMarketData);
        const clientId = clientService.getClients().find(client => client.clientName === clientName).clientId;
        onCloseHandler(blastName, clientId, markets, contents, advFilter, notionalValueFilter, triggerTime, blastId);
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
        setBlastName('');
        setClientName('');
        setMarkets([]);
        setContents([]);
        setRowMarketData([]);
        setTriggerTime('');
        setBlastId(null);
    }

    useEffect(() =>
    {
        if(selectedGenericGridRow && blastConfigDialogOpenFlag)
        {
            setClientName(clientService.getClients().find(client => client.clientId === selectedGenericGridRow.clientId).clientName);
            setContents(selectedGenericGridRow.contents);
            setBlastName(selectedGenericGridRow.blastName);
            setMarkets(selectedGenericGridRow.markets);

            if(selectedGenericGridRow.markets.length > 0)
                setRowMarketData(selectedGenericGridRow.markets.map(market => ({ market, adv: selectedGenericGridRow.advFilter[market] , notional: selectedGenericGridRow.notionalValueFilter[market]})));

            if(!isEmptyString(selectedGenericGridRow.triggerTime))
                setTriggerTime(selectedGenericGridRow.triggerTime);

            if(!isEmptyString(selectedGenericGridRow.blastId))
                setBlastId(selectedGenericGridRow.blastId);
        }
        else
            cleanUp();

    }, [blastConfigDialogOpenFlag]);

    const canClear = () =>
    {
        return (blastName !== '' || clientName !== '' || markets.length > 0 || contents.length > 0 || rowMarketData.length > 0 || triggerTime !== '');
    }

    const canSubmit = () =>
    {
        return (blastName !== '' && clientName !== '' && markets.length > 0 && contents.length > 0);
    }

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={Boolean(blastConfigDialogOpenFlag)} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{selectedGenericGridRow ? "Update Existing Blast Configuration" : "Add New Blast Configuration"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField size='small' label='Enter the blast name' value={blastName} onChange={handleBlastNameChange} fullWidth margin='normal' style={{marginTop: '35px', marginBottom: '5px', width:'400px'}} required/>
                        <Autocomplete size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                      options={clientService.getClients().map(client => client.clientName)} value={clientName} onChange={handleClientChange} freeSolo required />
                        <TextField size='small' label='Select the contents' select value={contents} onChange={handleContentsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}>
                            <MenuItem value='NEWS'>News</MenuItem>
                            <MenuItem value='FLOWS'>Flows</MenuItem>
                            <MenuItem value='HOLDINGS'>Holdings</MenuItem>
                            <MenuItem value='IOIs'>IOIs</MenuItem>
                            <MenuItem value='BLOCKS'>Blocks</MenuItem>
                        </TextField>
                        <TextField size='small' id="time" label="Schedule Run Time" type="time" value={triggerTime} style={{marginTop: '5px', marginBottom: '5px' , width:'400px'}}
                                   InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }} onChange={(e) => setTriggerTime(e.target.value)}/>
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
                        <Button className="dialog-action-button" disabled={!canClear()} variant='contained' onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
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

export default BlastConfigurationDialogComponent;
