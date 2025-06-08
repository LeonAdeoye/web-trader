import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import {Button,Grid,Paper,TextField,MenuItem,FormControl,InputLabel,Select,Checkbox,FormControlLabel} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {SideWidget} from "../widgets/SideWidget";
import {AccountAutoCompleteWidget} from "../widgets/AccountAutoCompleteWidget";
import {BrokerAutoCompleteWidget} from "../widgets/BrokerAutoCompleteWidget";
import {IOIQualifierWidget} from "../widgets/IOIQualifierWidget";
import {LoggerService} from "../services/LoggerService";
import {AccountService} from "../services/AccountService";
import {BrokerService} from "../services/BrokerService";
import {ReferenceDataService} from "../services/ReferenceDataService";
import '../styles/css/main.css';
import {assetTypeConverter, settlementTypeConverter} from "../utilities";


export const NewOrderApp = () => {
    const loggerService = useRef(new LoggerService(NewOrderApp.name)).current;
    const accountService = useRef(new AccountService()).current;
    const brokerService = useRef(new BrokerService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const windowId = useMemo(() => window.command.getWindowId("newOrder"), []);

    const [accounts, setAccounts] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [instruments, setInstruments] = useState([]);

    const [order, setOrder] = useState({
        instrumentCode: '',
        instrumentDescription: '',
        assetType: '',
        blgCode: '',
        ric: '',
        settlementCurrency: '',
        settlementType: '',
        exchangeAcronym: '',
        side: 'BUY',
        quantity: '',
        priceType: 'LIMIT',
        price: '',
        tif: 'GTC',
        traderInstruction: '',
        qualifier: 'C:2',
        destination: 'DMA',
        accountMnemonic: '',
        accountName: '',
        legalEntity: '',
        isFirmAccount: false,
        isRiskAccount: false,
        customFlags: '',
        brokerAcronym: '',
        brokerDescription: '',
        handlingInstruction: '',
        algoType: '',
        facilConsent: false,
        facilConsentDetails: '',
        facilInstructions: '',
        lotSize: 0
    });

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await accountService.loadAccounts();
            await brokerService.loadBrokers();
            await referenceDataService.loadInstruments();

            setAccounts(accountService.getAccounts());
            setBrokers(brokerService.getBrokers());
            setInstruments(referenceDataService.getInstruments());
        };
        loadData();
    }, [brokerService, accountService, referenceDataService]);

    const handleInputChange = useCallback((name, value) => {
        setOrder(prevData => {
            const newData = { ...prevData, [name]: value };
            if (name === 'instrumentCode' && value) {
                const instrument = referenceDataService.getInstrumentByCode(value);
                if (instrument)
                {
                    newData.instrumentDescription = instrument.instrumentDescription;
                    newData.assetType = instrument.assetType;
                    newData.blgCode = instrument.blgCode;
                    newData.ric = instrument.ric;
                    newData.settlementCurrency = instrument.settlementCurrency;
                    newData.settlementType = instrument.settlementType;
                    newData.exchangeAcronym = instrument.exchangeAcronym;
                    newData.lotSize = instrument.lotSize;
                }
            }

            if (name === 'accountMnemonic' && value)
            {
                const account = accountService.getAccountByMnemonic(value);
                if (account)
                {
                    newData.accountName = account.accountName;
                    newData.legalEntity = account.legalEntity;
                    newData.isFirmAccount = account.isFirmAccount;
                    newData.isRiskAccount = account.isRiskAccount;
                    newData.customFlags = account.customFlags;
                }
            }

            if (name === 'brokerAcronym' && value)
            {
                const broker = brokerService.getBrokerByAcronym(value);
                if (broker)
                {
                    newData.brokerDescription = broker.brokerDescription;
                    newData.handlingInstruction = broker.handlingInstruction;
                }
            }
            return newData;
        });
    }, [accountService, brokerService, referenceDataService]);

    const canSend = () => order.instrumentCode !== '' && order.side !== '' && order.quantity !== '' && (order.priceType === 'MARKET' || (order.priceType === 'LIMIT' && order.price !== ''));
    const canClear = () => order.instrumentCode !== '' || order.quantity !== '';

    const handleClear = () =>
    {
        setOrder({
            instrumentCode: '',
            instrumentDescription: '',
            assetType: '',
            blgCode: '',
            ric: '',
            settlementCurrency: '',
            settlementType: '',
            exchangeAcronym: '',
            side: 'BUY',
            quantity: '',
            priceType: 'LIMIT',
            price: '',
            tif: 'GTC',
            traderInstruction: '',
            qualifier: 'C:2',
            destination: 'DMA',
            accountMnemonic: '',
            accountName: '',
            legalEntity: '',
            isFirmAccount: false,
            isRiskAccount: false,
            customFlags: '',
            brokerAcronym: '',
            brokerDescription: '',
            handlingInstruction: '',
            algoType: '',
            facilConsent: false,
            facilConsentDetails: '',
            facilInstructions: '',
            lotSize: 0
        });
    };
    const handleSend = () => { };
    const handleFacilConsent = (event) =>
    {
        setOrder(prevData => ({
            ...prevData,
            facilConsent: event.target.checked
        }));
        loggerService.log(`Facilitation consent changed to ${event.target.checked}`);
    }

    return (
        <div>
            <TitleBarComponent title="New Order" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ padding: '10px', marginTop: '40px' }}>
                <Grid container spacing={0.5} justifyContent="flex-end">
                    <Grid item style={{ marginRight: '1px' }}>
                        <Button
                            className="dialog-action-button submit"
                            variant="contained"
                            disabled={!canSend()}
                            onClick={handleSend}
                            style={{ marginRight: '2px', marginBottom: '10px', fontSize: '0.75rem' }}>
                            Send
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            className="dialog-action-button"
                            variant="contained"
                            disabled={!canClear()}
                            onClick={handleClear}
                            style={{ marginRight: '2px', marginBottom: '10px', fontSize: '0.75rem' }}>
                            Clear
                        </Button>
                    </Grid>
                </Grid>
                <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} alignItems="flex-start">
                        <Grid item style={{ marginRight: '1px' }}>
                            <InstrumentAutoCompleteWidget 
                                instruments={instruments}
                                handleInputChange={handleInputChange}
                                instrumentCode={order.instrumentCode}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Instrument Description"
                                value={order.instrumentDescription}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '200px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Asset Type"
                                value={assetTypeConverter(order.assetType)}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="BLG Code"
                                value={order.blgCode}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="RIC"
                                value={order.ric}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Currency"
                                value={order.settlementCurrency}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '80px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Settlement"
                                value={settlementTypeConverter(order.settlementType)}
                                InputProps={{
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '95px' }}/>
                        </Grid>
                        <Grid item>
                            <TextField
                                size="small"
                                label="Exchange"
                                value={order.exchangeAcronym}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '80px' }}/>
                        </Grid>
                        <Grid item>
                            <TextField
                                size="small"
                                label="Lot size"
                                value={order.lotSize}
                                InputProps={{
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '80px' }}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={4} style={{ paddingLeft: '10px', paddingBottom: '10px', paddingTop: '10px', marginBottom:'10px' }}>
                    <Grid container spacing={0.5}>
                        <Grid item xs={12}>
                            <Grid container spacing={0.5}>
                                <Grid item style={{ marginTop: '-15px'}}>
                                    <SideWidget
                                        handleSideChange={(e) => handleInputChange('side', e.target.value)}
                                        sideValue={order.side}/>
                                    <TextField
                                        size="small"
                                        label="Quantity"
                                        type="number"
                                        value={order.quantity}
                                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                                        InputProps={{ style: { fontSize: '0.75rem' } }}
                                        InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                        style={{ width: '120px', marginLeft: '5px', marginTop: '15px' }}/>
                                    <FormControl size="small" style={{ width: '160px', marginLeft: '5px', marginTop: '15px' }}>
                                        <InputLabel style={{ fontSize: '0.75rem' }}>Price Type</InputLabel>
                                        <Select
                                            value={order.priceType}
                                            label="Price Type"
                                            onChange={(e) => handleInputChange('priceType', e.target.value)}
                                            style={{ fontSize: '0.75rem' }}>
                                            <MenuItem value="MARKET" style={{ fontSize: '0.75rem' }}>Market</MenuItem>
                                            <MenuItem value="LIMIT" style={{ fontSize: '0.75rem' }}>Limit</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {order.priceType === 'LIMIT' && (
                                        <TextField
                                            size="small"
                                            label="Price"
                                            type="number"
                                            value={order.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            InputProps={{ style: { fontSize: '0.75rem' } }}
                                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                            style={{ width: '120px', marginTop: '15px', marginLeft: '5px'}}/>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={0.5}>
                                <Grid item style={{ marginRight: '1px', marginTop: '-10px'}}>
                                    <FormControl size="small" style={{ width: '120px', marginTop: '15px' }}>
                                        <InputLabel style={{ fontSize: '0.75rem' }}>TIF</InputLabel>
                                        <Select
                                            value={order.tif}
                                            label="TIF"
                                            onChange={(e) => handleInputChange('tif', e.target.value)}
                                            style={{ fontSize: '0.75rem' }}>
                                            <MenuItem value="GTC" style={{ fontSize: '0.75rem' }}>GTC</MenuItem>
                                            <MenuItem value="GTD" style={{ fontSize: '0.75rem' }}>GTD</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" style={{ width: '120px', marginTop: '15px', marginLeft: '5px' , marginRight: '5px'}}>
                                        <InputLabel style={{ fontSize: '0.75rem' }}>Destination</InputLabel>
                                        <Select
                                            value={order.destination}
                                            label="Destination"
                                            onChange={(e) => handleInputChange('destination', e.target.value)}
                                            style={{ fontSize: '0.75rem' }}>
                                            <MenuItem value="DSA" style={{ fontSize: '0.75rem' }}>DSA</MenuItem>
                                            <MenuItem value="DMA" style={{ fontSize: '0.75rem' }}>DMA</MenuItem>
                                            <MenuItem value="INTERNAL" style={{ fontSize: '0.75rem' }}>Internal</MenuItem>
                                            <MenuItem value="BROKER" style={{ fontSize: '0.75rem' }}>Broker</MenuItem>
                                            <MenuItem value="CROSS" style={{ fontSize: '0.75rem' }}>Cross</MenuItem>
                                            <MenuItem value="FACIL" style={{ fontSize: '0.75rem' }}>Facilitation</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <IOIQualifierWidget
                                        handleQualifierChange={(e) => handleInputChange('qualifier', e.target.value)}
                                        qualifierValue={order.qualifier}/>
                                    <TextField
                                        size="small"
                                        label="Trader Instruction"
                                        value={order.traderInstruction}
                                        onChange={(e) => handleInputChange('traderInstruction', e.target.value)}
                                        InputProps={{ style: { fontSize: '0.75rem' } }}
                                        InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                        style={{ width: '250px', marginTop: '15px', marginLeft: '5px' , marginRight: '5px' }}/>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} alignItems="flex-start">
                        <Grid item style={{ marginRight: '1px' }}>
                            <AccountAutoCompleteWidget
                                accounts={accounts}
                                handleInputChange={handleInputChange}
                                accountMnemonic={order.accountMnemonic}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Account Name"
                                value={order.accountName}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '200px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Legal Entity"
                                value={order.legalEntity}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '150px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Firm Account"
                                value={order.isFirmAccount ? 'Yes' : 'No'}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}/>
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Risk Account"
                                value={order.isRiskAccount ? 'Yes' : 'No'}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}/>
                        </Grid>
                        <Grid item>
                            <TextField
                                size="small"
                                label="Custom Flags"
                                value={order.customFlags}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '160px' }}/>
                        </Grid>
                    </Grid>
                </Paper>
                {order.destination === 'BROKER' && (
                    <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                        <Grid container spacing={0.5} alignItems="flex-start">
                            <Grid item style={{ marginTop: '0px', marginRight: '1px' }}>
                                <BrokerAutoCompleteWidget
                                    brokers={brokers}
                                    handleInputChange={handleInputChange}
                                    brokerAcronym={order.brokerAcronym}/>
                            </Grid>
                            <Grid item style={{ marginRight: '1px' }}>
                                <TextField
                                    size="small"
                                    label="Description"
                                    value={order.brokerDescription}
                                    InputProps={{ 
                                        readOnly: true,
                                        style: { fontSize: '0.75rem' }
                                    }}
                                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                    style={{ width: '200px' }}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    size="small"
                                    label="Handling Instruction"
                                    value={order.handlingInstruction}
                                    InputProps={{ 
                                        readOnly: true,
                                        style: { fontSize: '0.75rem' }
                                    }}
                                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                    style={{ width: '200px' }}/>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
                {order.destination === 'DSA' && (
                    <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                        <Grid container spacing={0.5} alignItems="flex-start">
                            <Grid item>
                                <FormControl size="small" style={{ width: '120px' }}>
                                    <InputLabel style={{ fontSize: '0.75rem' }}>Algo Type</InputLabel>
                                    <Select
                                        value={order.algoType}
                                        label="Algo Type"
                                        onChange={(e) => handleInputChange('algoType', e.target.value)}
                                        style={{ fontSize: '0.75rem' }}>
                                        <MenuItem value="VWAP" style={{ fontSize: '0.75rem' }}>VWAP</MenuItem>
                                        <MenuItem value="TWAP" style={{ fontSize: '0.75rem' }}>TWAP</MenuItem>
                                        <MenuItem value="POV" style={{ fontSize: '0.75rem' }}>POV</MenuItem>
                                        <MenuItem value="IS" style={{ fontSize: '0.75rem' }}>IS</MenuItem>
                                        <MenuItem value="PI" style={{ fontSize: '0.75rem' }}>PI</MenuItem>
                                        <MenuItem value="MOC" style={{ fontSize: '0.75rem' }}>MC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
                {order.destination === 'FACIL' && (
                    <Paper elevation={4} style={{ paddingLeft: '10px', marginBottom: '10px', paddingTop: "10px"}}>
                        <Grid container spacing={0.5} alignItems="flex-start">
                            <Grid item>
                                <FormControlLabel control={<Checkbox size="small" color="default" onChange={handleFacilConsent}/>} label={<span style={{ fontSize: '0.75rem' }}>Facil consent received</span>} />
                                <TextField
                                    size="small"
                                    label="Facil consent details"
                                    value={order.facilConsentDetails}
                                    onChange={(e) => handleInputChange('facilConsentDetails', e.target.value)}
                                    InputProps={{ style: { fontSize: '0.75rem' } }}
                                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                    style={{ width: '250px', marginBottom: '10px', marginTop: '5px' }}/>
                                <TextField
                                    size="small"
                                    label="Facil instructions"
                                    value={order.facilInstructions}
                                    onChange={(e) => handleInputChange('facilInstructions', e.target.value)}
                                    InputProps={{ style: { fontSize: '0.75rem' } }}
                                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                    style={{ width: '250px', marginLeft:'5px', marginBottom: '10px', marginTop: '5px' }}/>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </div>
        </div>
    );
};
