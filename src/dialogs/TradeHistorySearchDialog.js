import React, {useState, useCallback, useRef, useEffect} from "react";
import {Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import {LoggerService} from "../services/LoggerService";
import {ClientService} from "../services/ClientService";
import {TraderService} from "../services/TraderService";
import {InstrumentService} from "../services/InstrumentService";
import {useRecoilState} from "recoil";
import {tradeHistoryDialogDisplayState} from "../atoms/dialog-state";
import {ClientAutoCompleteWidget} from "../widgets/ClientAutoCompleteWidget";
import {TraderIdAutoCompleteWidget} from "../widgets/TraderIdAutoCompleteWidget";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import '../styles/css/main.css';

const TradeHistorySearchDialog = ({ onSearch }) =>
{
    const [tradeHistoryDialogDisplay, setTradeHistoryDialogDisplay] = useRecoilState(tradeHistoryDialogDisplayState);
    const clientService = useRef(new ClientService()).current;
    const traderService = useRef(new TraderService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const [traders, setTraders] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [clients, setClients] = useState([]);
    const loggerService = useRef(new LoggerService(TradeHistorySearchDialog.name)).current;
    const [clientCode, setClientCode] = useState('');
    const [instrumentCode, setInstrumentCode] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const handleInputChange = useCallback((field, value) =>
    {
        switch (field)
        {
            case 'instrumentCode':
                setInstrumentCode(value);
                break;
            case 'ownerId':
                setOwnerId(value);
                break;
            case 'clientCode':
                setClientCode(value);
                break;
            default:
                loggerService.logError(`Trade History Search Dialog - Unknown field: ${field}`);
        }
    }, [loggerService]);

    const handleSearch = useCallback(() =>
    {
        if (onSearch)
            onSearch({ clientCode, instrumentCode, ownerId });

        setTradeHistoryDialogDisplay(false);

    }, [onSearch, clientCode, instrumentCode, ownerId]);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await traderService.loadTraders()
            await instrumentService.loadInstruments();
            await clientService.loadClients();

            setTraders(traderService.getTraders());
            setInstruments(instrumentService.getInstruments());
            setClients(clientService.getClients());
        };
        loadData().then(() => loggerService.logInfo('TradeHistorySearchDialog search input data loaded successfully.'))
    }, [ instrumentService, clientService, traderService, loggerService]);

    const handleCancel = useCallback(() =>
    {
        setOwnerId('');
        setClientCode('');
        setInstrumentCode('');
        setTradeHistoryDialogDisplay(false);
    }, []);

    const handleClear = useCallback(() =>
    {
        setOwnerId('');
        setClientCode('');
        setInstrumentCode('');
    }, []);

    const canDisable = useCallback(() =>
    {
        return ownerId === '' && clientCode === '' && instrumentCode === '';
    }, [ownerId, clientCode, instrumentCode])

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
                        <TraderIdAutoCompleteWidget traders={traders} handleInputChange={handleInputChange} ownerId={ownerId}/>
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

