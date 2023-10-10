import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography, Autocomplete} from "@mui/material";
import React, {useState, useMemo, useEffect, useCallback} from "react";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState} from "../atoms/dialog-state";
import {AgGridReact} from "ag-grid-react";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {numberFormatter} from "../utilities";

const BlastConfigurationDialog = ({ onCloseHandler , clientService }) =>
{
    const defaultBlastConfiguration =
    {
        blastName: '',
        clientName: '',
        markets: [],
        contents: [],
        blastId: null,
        triggerTime: '',
        rowMarketData: []
    };

    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [blastConfiguration, setBlastConfiguration] = useState(defaultBlastConfiguration);
    const [blastConfigDialogOpenFlag, setBlastConfigDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);

    const columnDefs = useMemo(() => ([
        { headerName: "Market", field: "market", width: 140},
        { headerName: "ADV%", field: "adv" , width:90, editable: true},
        { headerName: "Notional", field: "notional", width: 110, editable: true, valueFormatter: numberFormatter}
    ]), []);

    const handleInputChange = useCallback((name, value) =>
    {
        setBlastConfiguration(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const handleMarketsChange = (event) =>
    {
        const selectedMarkets = event.target.value;
        handleInputChange('markets', selectedMarkets);
        setBlastConfiguration(prevState =>
        {
            const updatedRowMarketData = selectedMarkets.map(market =>
            {
                const existingRow = prevState.rowMarketData.find(row => row.market === market);
                return existingRow ? existingRow : { market };
            });

            return {
                ...prevState,
                rowMarketData: updatedRowMarketData
            };
        });
    };

    const handleCancel = () => setBlastConfigDialogOpenFlag(false);

    const convertToFilters = (rows) =>
    {
        const advFilter = {};
        const notionalValueFilter = {};
        for(let row of rows)
        {
            if(!row.market)
                continue;

            if (row.adv)
                advFilter[row.market] = row.adv;

            if (row.notional)
                notionalValueFilter[row.market] = row.notional;
        }

        return {
            advFilter,
            notionalValueFilter
        };
    }

    const handleSubmit = useCallback(() =>
    {
        setBlastConfigDialogOpenFlag(false);
        const { blastName, clientName, markets, contents, rowMarketData, triggerTime, blastId } = blastConfiguration;
        const { advFilter, notionalValueFilter } = convertToFilters(rowMarketData);
        const clientId = clientService.getClients().find(client => client.clientName === clientName).clientId;
        onCloseHandler(blastName, clientId, markets, contents, advFilter, notionalValueFilter, triggerTime, blastId);
    }, [blastConfiguration]);

    const handleContentsChange = useCallback((event) =>
    {
        const value = event.target.value;
        handleInputChange('contents', typeof value === 'string' ? value.split(',') : value);
    }, []);

    const canClear = useCallback(() =>
    {
        return Object.values(blastConfiguration).some(value =>
        {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value !== '';
            return value !== null;
        });
    }, [blastConfiguration]);

    const canSubmit = useCallback(() =>
    {
        return blastConfiguration.blastName !== '' && blastConfiguration.clientName !== '' && blastConfiguration.markets.length > 0 && blastConfiguration.contents.length > 0;
    }, [blastConfiguration]);

    const handleClear = () => setBlastConfiguration(defaultBlastConfiguration);

    useEffect(() =>
    {
        if (selectedGenericGridRow && blastConfigDialogOpenFlag)
        {
            const client = clientService.getClients().find(client => client.clientId === selectedGenericGridRow.clientId);
            const data =
            {
                clientName: client ? client.clientName : '',
                contents: selectedGenericGridRow.contents || [],
                blastName: selectedGenericGridRow.blastName || '',
                markets: selectedGenericGridRow.markets || [],
                triggerTime: selectedGenericGridRow.triggerTime || '',
                blastId: selectedGenericGridRow.blastId || null,
                rowMarketData: selectedGenericGridRow.markets
                    ? selectedGenericGridRow.markets.map(market => ({
                        market,
                        adv: selectedGenericGridRow.advFilter[market],
                        notional: selectedGenericGridRow.notionalValueFilter[market]
                    }))
                    : []
            };
            setBlastConfiguration(data);
        }
        else
            setBlastConfiguration(defaultBlastConfiguration);

        return () => setBlastConfiguration(defaultBlastConfiguration);

    }, [blastConfigDialogOpenFlag]);

    const getTitle = () =>
    {
        if(!selectedGenericGridRow)
            return "Add New Blast Configuration";

        if(selectedGenericGridRow?.blastId)
            return "Update Existing Blast Configuration";

        return "Clone Blast Configuration";
    }

    return (
        <Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={blastConfigDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField className="blast-name" size='small' label='Enter the blast name' value={blastConfiguration.blastName} onChange={(e) => handleInputChange('blastName', e.target.value)} fullWidth margin='normal' style={{marginTop: '35px', marginBottom: '5px'}} required/>
                        <Autocomplete className="blast-client" size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px'}}
                                      getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                                      value={blastConfiguration.clientName} onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />
                        <TextField className="blast-contents" size='small' label='Select the contents' select value={blastConfiguration.contents} onChange={handleContentsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '5px', marginBottom: '5px'}}>
                            <MenuItem value='NEWS'>News</MenuItem>
                            <MenuItem value='FLOWS'>Flows</MenuItem>
                            <MenuItem value='IOIs'>IOIs</MenuItem>
                        </TextField>
                        <TextField className="blast-trigger-time" size='small' id="time" label="Schedule Run Time" type="time" value={blastConfiguration.triggerTime} style={{marginTop: '5px', marginBottom: '5px', width: '400px'}}
                                   InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }} onChange={(e) => handleInputChange('triggerTime', e.target.value)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className="blast-trigger-time" size='small' label='Select applicable markets...' select value={blastConfiguration.markets} onChange={handleMarketsChange} fullWidth SelectProps={{multiple: true}} style={{marginTop: '35px', marginBottom: '5px'}}>
                            <MenuItem value='HK'>Hong Kong</MenuItem>
                            <MenuItem value='JP'>Japan</MenuItem>
                            <MenuItem value='SG'>Singapore</MenuItem>
                            <MenuItem value='IN'>India</MenuItem>
                            <MenuItem value='AU'>Australia</MenuItem>
                            <MenuItem value='KR'>Korea</MenuItem>
                        </TextField>
                        <div className="ag-theme-alpine" style={{ height: '140px', width: '400px', marginTop: '5px'}}>
                            <AgGridReact columnDefs={columnDefs} rowData={blastConfiguration.rowMarketData} rowHeight={25} headerHeight={25}/>
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

export default BlastConfigurationDialog;
