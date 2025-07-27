import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid} from '@mui/material';
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {ClientAutoCompleteWidget} from "../widgets/ClientAutoCompleteWidget";
import {TraderAutoCompleteWidget} from "../widgets/TraderAutoCompleteWidget";
import {ClientService} from "../services/ClientService";
import {TraderService} from "../services/TraderService";
import {ReferenceDataService} from "../services/ReferenceDataService";
import {LoggerService} from "../services/LoggerService";
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {tradeHistoryDialogDisplayState} from "../atoms/dialog-state";

const TradeHistorySearchDialog = () =>
{
    const [tradeHistoryDialogDisplay, setTradeHistoryDialogDisplay] = useRecoilState(tradeHistoryDialogDisplayState);
    const clientService = useRef(new ClientService()).current;
    const traderService = useRef(new TraderService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const [traders, setTraders] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [clients, setClients] = useState([]);
    const loggerService = useRef(new LoggerService(TradeHistorySearchDialog.name)).current;
    const [clientCode, setClientCode] = useState('');
    const [instrumentCode, setInstrumentCode] = useState('');
    const [userId, setUserId] = useState('');

    const handleInputChange = useCallback((field, value) =>
    {
        switch (field)
        {
            case 'instrumentCode':
                setInstrumentCode(value);
                break;
            case 'userId':
                setUserId(value);
                break;
            case 'clientCode':
                setClientCode(value);
                break;
            default:
                loggerService.logError(`Trade History Search Dialog - Unknown field: ${field}`);
        }
    }, [loggerService]);


    useEffect(() =>
    {
        const loadData = async () =>
        {
            await traderService.loadTraders()
            await referenceDataService.loadInstruments();
            await clientService.loadClients();

            setTraders(traderService.getTraders());
            setInstruments(referenceDataService.getInstruments());
            setClients(clientService.getClients());
        };
        loadData().then(() => loggerService.logInfo('TradeHistorySearchDialog search input data loaded successfully.'))
    }, [ referenceDataService, clientService, traderService, loggerService]);

    const handleSearch = useCallback(() =>
    {
        setTradeHistoryDialogDisplay(false);
    }, []);

    const handleCancel = useCallback(() =>
    {
        setUserId('');
        setClientCode('');
        setInstrumentCode('');
        setTradeHistoryDialogDisplay(false);
    }, []);

    const handleClear = useCallback(() =>
    {
        setUserId('');
        setClientCode('');
        setInstrumentCode('');
    }, []);

    const canDisable = useCallback(() =>
    {
        return userId === '' && clientCode === '' && instrumentCode === '';
    }, [userId, clientCode, instrumentCode])

    return (
        <Dialog aria-labelledby='dialog-title' open={tradeHistoryDialogDisplay}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Search Trade History</DialogTitle>
            <DialogContent style={{width: '300px'}}>
                <Grid container spacing={0.5} direction="column" alignItems="flex-start">
                    <Grid item style={{marginLeft: '-15px', marginTop: '10px', marginBottom: '5px' }}>
                        <InstrumentAutoCompleteWidget instruments={instruments} handleInputChange={handleInputChange} instrumentCode={instrumentCode}/>
                    </Grid>
                    <Grid item style={{marginLeft: '-15px', marginBottom: '5px' }}>
                        <ClientAutoCompleteWidget  clients={clients} handleInputChange={handleInputChange} clientCode={clientCode}/>
                    </Grid>
                    <Grid item style={{marginLeft: '-15px', marginBottom: '0px' }}>
                        <TraderAutoCompleteWidget traders={traders} handleInputChange={handleInputChange} userId={userId}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '0px', fontSize: '0.75rem'}} variant='contained' disabled={false} onClick={handleCancel}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleSearch}>Search</Button>
            </DialogActions>
        </Dialog>);
};

export default TradeHistorySearchDialog;

