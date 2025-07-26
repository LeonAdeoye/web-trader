import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {ClientAutoCompleteWidget} from "../widgets/ClientAutoCompleteWidget";
import {TraderAutoCompleteWidget} from "../widgets/TraderAutoCompleteWidget";
import {ClientService} from "../services/ClientService";
import {TraderService} from "../services/TraderService";
import {ReferenceDataService} from "../services/ReferenceDataService";
import {LoggerService} from "../services/LoggerService";
import '../styles/css/main.css';

const TradeHistorySearchDialog = () =>
{
    const [tradeHistoryDialogDisplay, setTradeHistoryDialogDisplay] = useState(true);
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
    }, []);


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
        loadData().then(() => loggerService.logInfo('TradeHistorySearchDialog data loaded successfully.'))
    }, [ referenceDataService, clientService, traderService]);

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
            <DialogContent>
                <InstrumentAutoCompleteWidget instruments={instruments} handleInputChange={handleInputChange} instrumentCode={instrumentCode} />
                <TraderAutoCompleteWidget traders={traders} handleInputChange={handleInputChange} userId={userId}/>
                <ClientAutoCompleteWidget  clients={clients} handleInputChange={handleInputChange} clientCode={clientCode}/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Button className="dialog-action-button submit" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" disabled={canDisable()} variant='contained' onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" disabled={canDisable()} variant='contained' onClick={handleSearch}>Search</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TradeHistorySearchDialog;

