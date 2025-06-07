import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";
import {Button, Grid, Paper, TextField, MenuItem, FormControl, InputLabel, Select, Typography} from "@mui/material";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {SideWidget} from "../widgets/SideWidget";
import {AccountAutoCompleteWidget} from "../widgets/AccountAutoCompleteWidget";
import {BrokerAutoCompleteWidget} from "../widgets/BrokerAutoCompleteWidget";
import {AccountService} from "../services/AccountService";
import {BrokerService} from "../services/BrokerService";
import '../styles/css/main.css';
import {ReferenceDataService} from "../services/ReferenceDataService";

export const NewOrderApp = () => {
    const loggerService = useRef(new LoggerService(NewOrderApp.name)).current;
    const accountService = useRef(new AccountService()).current;
    const brokerService = useRef(new BrokerService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const windowId = useMemo(() => window.command.getWindowId("newOrder"), []);

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
        priceType: 'MARKET',
        price: '',
        tif: 'GTC',
        traderInstruction: '',
        destination: 'DMA',
        accountMnemonic: '',
        accountName: '',
        legalEntity: '',
        isFirmAccount: false,
        isRiskAccount: false,
        customFlags: '',
        brokerName: '',
        brokerDescription: '',
        handlingInstruction: '',
        algoType: ''
    });

    useEffect(() => {
        const loadData = async () => {
            await accountService.loadAccounts();
            await brokerService.loadBrokers();
        };
        loadData();
    }, []);

    const handleInputChange = useCallback((name, value) => {
        setOrder(prevData => {
            const newData = { ...prevData, [name]: value };
            
            // Update instrument details when instrument code changes
            if (name === 'instrumentCode' && value) {
                const instrument = referenceDataService.getInstruments().find(i => i.instrumentCode === value);
                if (instrument) {
                    newData.instrumentDescription = instrument.instrumentDescription;
                    newData.assetType = instrument.assetType;
                    newData.blgCode = instrument.blgCode;
                    newData.ric = instrument.ric;
                    newData.settlementCurrency = instrument.settlementCurrency;
                    newData.settlementType = instrument.settlementType;
                    newData.exchangeAcronym = instrument.exchangeAcronym;
                }
            }
            
            // Update account details when account mnemonic changes
            if (name === 'accountMnemonic' && value) {
                const account = accountService.getAccountByMnemonic(value);
                if (account) {
                    newData.accountName = account.accountName;
                    newData.legalEntity = account.legalEntity;
                    newData.isFirmAccount = account.isFirmAccount;
                    newData.isRiskAccount = account.isRiskAccount;
                    newData.customFlags = account.customFlags;
                }
            }
            
            // Update broker details when broker name changes
            if (name === 'brokerName' && value) {
                const broker = brokerService.getBrokerByName(value);
                if (broker) {
                    newData.brokerDescription = broker.brokerDescription;
                    newData.handlingInstruction = broker.handlingInstruction;
                }
            }
            
            return newData;
        });
    }, []);

    const canSend = () => order.instrumentCode !== '' && order.side !== '' && order.quantity !== '';
    const canClear = () => order.instrumentCode !== '' || order.quantity !== '';

    const handleClear = () => {
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
            priceType: 'MARKET',
            price: '',
            tif: 'GTC',
            traderInstruction: '',
            destination: 'DMA',
            accountMnemonic: '',
            accountName: '',
            legalEntity: '',
            isFirmAccount: false,
            isRiskAccount: false,
            customFlags: '',
            brokerName: '',
            brokerDescription: '',
            handlingInstruction: '',
            algoType: ''
        });
    };

    const handleSend = () => {
        // TODO: Implement send logic
    };

    return (
        <div>
            <TitleBarComponent title="New Order" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ padding: '10px', marginTop: '40px' }}>
                <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} justifyContent="flex-end">
                        <Grid item style={{ marginRight: '1px' }}>
                            <Button 
                                className="dialog-action-button submit" 
                                variant="contained" 
                                disabled={!canSend()}
                                onClick={handleSend}
                                style={{ marginRight: '2px', fontSize: '0.75rem' }}
                            >
                                Send
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                className="dialog-action-button" 
                                variant="contained" 
                                disabled={!canClear()}
                                onClick={handleClear}
                                style={{ marginRight: '2px', fontSize: '0.75rem' }}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} alignItems="flex-start">
                        <Grid item style={{ marginTop: '-8px', marginRight: '1px' }}>
                            <InstrumentAutoCompleteWidget 
                                instrumentService={referenceDataService}
                                handleInputChange={handleInputChange}
                                instrumentCode={order.instrumentCode}
                            />
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Description"
                                value={order.instrumentDescription}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '200px' }}
                            />
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Asset Type"
                                value={order.assetType}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}
                            />
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Bloomberg Code"
                                value={order.blgCode}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '100px' }}
                            />
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
                                style={{ width: '100px' }}
                            />
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
                                style={{ width: '80px' }}
                            />
                        </Grid>
                        <Grid item style={{ marginRight: '1px' }}>
                            <TextField
                                size="small"
                                label="Settlement"
                                value={order.settlementType}
                                InputProps={{ 
                                    readOnly: true,
                                    style: { fontSize: '0.75rem' }
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                style={{ width: '80px' }}
                            />
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
                                style={{ width: '80px' }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5}>
                        <Grid item xs={6}>
                            <Grid container spacing={0.5}>
                                <Grid item style={{ marginRight: '1px' }}>
                                    <SideWidget 
                                        handleSideChange={(e) => handleInputChange('side', e.target.value)}
                                        sideValue={order.side}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        size="small"
                                        label="Quantity"
                                        type="number"
                                        value={order.quantity}
                                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                                        InputProps={{ style: { fontSize: '0.75rem' } }}
                                        InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                        style={{ width: '120px', marginTop: '15px' }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container spacing={0.5}>
                                <Grid item style={{ marginRight: '1px' }}>
                                    <FormControl size="small" style={{ width: '120px', marginTop: '15px' }}>
                                        <InputLabel style={{ fontSize: '0.75rem' }}>Price Type</InputLabel>
                                        <Select
                                            value={order.priceType}
                                            label="Price Type"
                                            onChange={(e) => handleInputChange('priceType', e.target.value)}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            <MenuItem value="MARKET" style={{ fontSize: '0.75rem' }}>Market</MenuItem>
                                            <MenuItem value="LIMIT" style={{ fontSize: '0.75rem' }}>Limit</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {order.priceType === 'LIMIT' && (
                                    <Grid item>
                                        <TextField
                                            size="small"
                                            label="Price"
                                            type="number"
                                            value={order.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            InputProps={{ style: { fontSize: '0.75rem' } }}
                                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                            style={{ width: '120px', marginTop: '15px' }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container spacing={0.5}>
                                <Grid item style={{ marginRight: '1px' }}>
                                    <FormControl size="small" style={{ width: '120px', marginTop: '15px' }}>
                                        <InputLabel style={{ fontSize: '0.75rem' }}>TIF</InputLabel>
                                        <Select
                                            value={order.tif}
                                            label="TIF"
                                            onChange={(e) => handleInputChange('tif', e.target.value)}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            <MenuItem value="GTC" style={{ fontSize: '0.75rem' }}>GTC</MenuItem>
                                            <MenuItem value="GTD" style={{ fontSize: '0.75rem' }}>GTD</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        size="small"
                                        label="Trader Instruction"
                                        value={order.traderInstruction}
                                        onChange={(e) => handleInputChange('traderInstruction', e.target.value)}
                                        InputProps={{ style: { fontSize: '0.75rem' } }}
                                        InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                                        style={{ width: '200px', marginTop: '15px' }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl size="small" style={{ width: '120px', marginTop: '15px' }}>
                                <InputLabel style={{ fontSize: '0.75rem' }}>Destination</InputLabel>
                                <Select
                                    value={order.destination}
                                    label="Destination"
                                    onChange={(e) => handleInputChange('destination', e.target.value)}
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    <MenuItem value="DSA" style={{ fontSize: '0.75rem' }}>DSA</MenuItem>
                                    <MenuItem value="DMA" style={{ fontSize: '0.75rem' }}>DMA</MenuItem>
                                    <MenuItem value="BROKER" style={{ fontSize: '0.75rem' }}>Broker</MenuItem>
                                    <MenuItem value="INTERNAL" style={{ fontSize: '0.75rem' }}>Internal</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} alignItems="flex-start">
                        <Grid item style={{ marginTop: '-8px', marginRight: '1px' }}>
                            <AccountAutoCompleteWidget
                                accountService={accountService}
                                handleInputChange={handleInputChange}
                                accountMnemonic={order.accountMnemonic}
                            />
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
                                style={{ width: '200px' }}
                            />
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
                                style={{ width: '150px' }}
                            />
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
                                style={{ width: '100px' }}
                            />
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
                                style={{ width: '100px' }}
                            />
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
                                style={{ width: '100px' }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
                {order.destination === 'BROKER' && (
                    <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                        <Grid container spacing={0.5} alignItems="flex-start">
                            <Grid item style={{ marginTop: '-8px', marginRight: '1px' }}>
                                <BrokerAutoCompleteWidget
                                    brokerService={brokerService}
                                    handleInputChange={handleInputChange}
                                    brokerName={order.brokerName}
                                />
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
                                    style={{ width: '200px' }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                )}
                {order.destination === 'DSA' && (
                    <Paper elevation={2} style={{ padding: '10px', marginBottom: '10px' }}>
                        <Grid container spacing={0.5} alignItems="flex-start">
                            <Grid item>
                                <FormControl size="small" style={{ width: '120px' }}>
                                    <InputLabel style={{ fontSize: '0.75rem' }}>Algo Type</InputLabel>
                                    <Select
                                        value={order.algoType}
                                        label="Algo Type"
                                        onChange={(e) => handleInputChange('algoType', e.target.value)}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="VWAP" style={{ fontSize: '0.75rem' }}>VWAP</MenuItem>
                                        <MenuItem value="TWAP" style={{ fontSize: '0.75rem' }}>TWAP</MenuItem>
                                        <MenuItem value="POV" style={{ fontSize: '0.75rem' }}>POV</MenuItem>
                                        <MenuItem value="IS" style={{ fontSize: '0.75rem' }}>IS</MenuItem>
                                        <MenuItem value="PI" style={{ fontSize: '0.75rem' }}>PI</MenuItem>
                                        <MenuItem value="MC" style={{ fontSize: '0.75rem' }}>MC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </div>
        </div>
    );
};
