import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import {Button,Grid,Paper,TextField,MenuItem,FormControl,InputLabel,Select,Checkbox,FormControlLabel,Tooltip} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {SideWidget} from "../widgets/SideWidget";
import {AccountAutoCompleteWidget} from "../widgets/AccountAutoCompleteWidget";
import {BrokerAutoCompleteWidget} from "../widgets/BrokerAutoCompleteWidget";
import {IOIQualifierWidget} from "../widgets/IOIQualifierWidget";
import {ClientAutoCompleteWidget} from "../widgets/ClientAutoCompleteWidget";
import {LoggerService} from "../services/LoggerService";
import {AccountService} from "../services/AccountService";
import {BrokerService} from "../services/BrokerService";
import {ReferenceDataService} from "../services/ReferenceDataService";
import {ClientService} from "../services/ClientService";
import {ExchangeRateService} from "../services/ExchangeRateService";
import '../styles/css/main.css';
import {assetTypeConverter, settlementTypeConverter} from "../utilities";
import StrategyComponent from "../components/StrategyComponent";
import {extractStrategyName} from "../fixatdl";
import {useRecoilState} from "recoil";
import {algoErrorsState} from "../atoms/component-state";

export const NewOrderApp = () =>
{
    const strategyRef = useRef();
    const loggerService = useRef(new LoggerService(NewOrderApp.name)).current;
    const accountService = useRef(new AccountService()).current;
    const brokerService = useRef(new BrokerService()).current;
    const clientService = useRef(new ClientService()).current;
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const windowId = useMemo(() => window.command.getWindowId("New Order"), []);

    const [accounts, setAccounts] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [clients, setClients] = useState(clientService.getClients());
    const [ownerId, setOwnerId] = useState('');
    const [worker, setWorker] = useState(null);
    const [selectedAlgo, setSelectedAlgo] = useState("VWAP");
    const [algoNames, setAlgoNames] = useState([]);
    const [algoErrors] = useRecoilState(algoErrorsState);

    const blankOrder = useMemo(() => ({
        instrumentCode: '',
        instrumentDescription: '',
        assetType: '',
        blgCode: '',
        ric: '',
        arrivalTime: '',
        tradeDate : '',
        settlementCurrency: '',
        settlementType: '',
        exchangeAcronym: '',
        side: 'BUY',
        quantity: '',
        priceType: '2',
        price: '',
        tif: '0',
        orderId: '',
        parentOrderId: '',
        percentageOfParentOrder: 0.00,
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
        lotSize: 0,
        clientCode: '',
        clientDescription:'',
        ownerId:'',
        state:''
    }), []);

    const [order, setOrder] = useState(blankOrder);

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await accountService.loadAccounts();
            await brokerService.loadBrokers();
            await referenceDataService.loadInstruments();
            await clientService.loadClients();
            await exchangeRateService.loadExchangeRates();

            setAccounts(accountService.getAccounts());
            setBrokers(brokerService.getBrokers());
            setInstruments(referenceDataService.getInstruments());
            setClients(clientService.getClients());
        };
        loadData();
    }, [brokerService, accountService, referenceDataService, clientService, exchangeRateService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/send-order.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const getClientDescription = (clientCode) => {
        const client = clients.find(client => client.clientCode === clientCode);
        return client ? client.clientName : "";
    };

    const handleStrategyChange = (event) =>
    {
        setSelectedAlgo(event.target.value);
    };

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
            if(name === 'priceType' && value === '1')
                newData.price = '';
            return newData;
        });
    }, [accountService, brokerService, referenceDataService]);

    const canCreateOrder = () => order.clientCode !== "" && order.instrumentCode !== '' && order.side !== '' && order.quantity !== ''
        && (order.priceType === '1' || (order.priceType !== '1' && order.price !== ''));

    const canClear = () => order.instrumentCode !== '' || order.quantity !== '' || order.priceType !== '2'  || order.price !== '' || order.traderInstruction !== ''
        || order.accountMnemonic !== '' || order.brokerAcronym !== '' || order.clientCode !== '' || order.destination !== 'DMA';

    const handleClear = () =>
    {
        setOrder(blankOrder);
    };

    const handleCancel = () =>
    {
        handleClear();
        window.command.close(windowId);
    }

    const handleCreateOrder = () =>
    {
        if (strategyRef.current) {
            strategyRef.current.handleValidation();
        }

        if (algoErrors.length > 0)
        {
            alert(`Order cannot be sent due to ALGO strategy validation errors. Please check the console for details: ${algoErrors.join(', ')}`);
            loggerService.logError("Order cannot be sent due to validation errors:", algoErrors);
            return;
        }

        const usdPrice = order.settlementCurrency === 'USD' ? order.price : exchangeRateService.convert(order.price, order.settlementCurrency, 'USD');

        const parentOrderId = crypto.randomUUID();

        setOrder(prevData => {
            prevData.ownerId = ownerId;
            prevData.state = 'NEW_ORDER';
            prevData.arrivalTime = new Date().toLocaleTimeString();
            prevData.tradeDate = new Date().toLocaleDateString();
            prevData.arrivalPrice = prevData.priceType === '2' ? order.price : '0';
            prevData.pending = prevData.quantity;
            prevData.executed = '0';
            prevData.executedNotionalValueInUSD = '0';
            prevData.traderInstruction = prevData.traderInstruction === '' ? 'None' : prevData.traderInstruction;
            prevData.orderNotionalValueInUSD = (prevData.priceType === '2' && prevData.price !== '') ? (prevData.quantity * usdPrice).toFixed(2) : '0';
            prevData.orderNotionalValueInLocal = (prevData.priceType === '2' && prevData.price !== '') ? (prevData.quantity * prevData.price).toFixed(2) : '0';
            prevData.residualNotionalValueInLocal = prevData.orderNotionalValueInLocal;
            prevData.residualNotionalValueInUSD = prevData.orderNotionalValueInUSD;
            prevData.clientDescription = getClientDescription(prevData.clientCode);
            prevData.averagePrice = '0';
            prevData.parentOrderId = parentOrderId;
            prevData.orderId = parentOrderId;
            prevData.actionEvent = 'SUBMIT_TO_OMS';
            return prevData;
        });
        worker.postMessage({order});
        handleClear();
    }

    const handleFacilConsent = (event) =>
    {
        setOrder(prevData => ({
            ...prevData,
            facilConsent: event.target.checked
        }));
        loggerService.logInfo(`Facilitation consent changed to ${event.target.checked}`);
    }

    const getAlgoNames = async () =>
    {
        try
        {
            const xmlFiles = await window.strategyLoader.getStrategyXML();
            const algoNames = xmlFiles.map(xml => extractStrategyName(xml)).filter(name => name !== null);
            return algoNames;
        }
        catch (err)
        {
            LoggerService.logError("Error fetching algorithm names:", err);
            return [];
        }
    };

    useEffect(() =>
    {
        const fetchAlgoNames = async () => setAlgoNames(await getAlgoNames());
        fetchAlgoNames();
    }, []);

    return (
        <div>
            <TitleBarComponent title="New Order" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ padding: '10px', marginTop: '40px' }}>
                <Paper elevation={4} style={{ padding: '10px', marginBottom: '10px' }}>
                    <Grid container spacing={0.5} justifyContent="space-between">
                        <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <ClientAutoCompleteWidget
                                clients={clients}
                                handleInputChange={handleInputChange}
                                clientCode={order.clientCode}
                            />
                            {order.clientCode !== '' && (
                            <TextField
                                size="small"
                                label="Client Description"
                                value={getClientDescription(order.clientCode)}
                                InputProps={{
                                    readOnly: true,
                                    style: { fontSize: '0.75rem', height: '32px'}
                                }}
                                InputLabelProps={{ style: { fontSize: '0.75rem'} }}
                                style={{ width: '250px', marginLeft: '5px'}}/>)}
                        </Grid>
                        <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title={"Creates a new order and closes the app."}>
                                <Button
                                    className="dialog-action-button submit"
                                    variant="contained"
                                    disabled={!canCreateOrder()}
                                    onClick={handleCreateOrder}
                                    style={{ marginRight: '5px', fontSize: '0.75rem' }}>
                                    Create Order
                                </Button>
                            </Tooltip>
                            <Tooltip title={"Clears all the control values but does not close the app."}>
                                <Button
                                    className="dialog-action-button"
                                    variant="contained"
                                    disabled={!canClear()}
                                    onClick={handleClear}
                                    style={{ fontSize: '0.75rem'}}>
                                    Clear
                                </Button>
                            </Tooltip>
                            <Tooltip title={"Cancels the current order and closes this app."}>
                                <Button
                                    className="dialog-action-button cancel"
                                    variant="contained"
                                    disabled={false}
                                    onClick={handleCancel}
                                    style={{ marginLeft: '5px', fontSize: '0.75rem'}}>
                                    Cancel
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Paper>
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
                                            <MenuItem value="1" style={{ fontSize: '0.75rem' }}>Market</MenuItem>
                                            <MenuItem value="2" style={{ fontSize: '0.75rem' }}>Limit</MenuItem>
                                            <MenuItem value="4" style={{ fontSize: '0.75rem' }}>Stop Limit</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {(order.priceType === '2' || order.priceType === '4') && (
                                        <TextField
                                            size="small"
                                            label= {order.priceType === '2' ? "Limit Price" : "Stop Price"}
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
                                            <MenuItem value="0" style={{ fontSize: '0.75rem' }}>DAY</MenuItem>
                                            <MenuItem value="1" style={{ fontSize: '0.75rem' }}>GTC</MenuItem>
                                            <MenuItem value="2" style={{ fontSize: '0.75rem' }}>OPG</MenuItem>
                                            <MenuItem value="3" style={{ fontSize: '0.75rem' }}>IOC</MenuItem>
                                            <MenuItem value="4" style={{ fontSize: '0.75rem' }}>FOK</MenuItem>
                                            <MenuItem value="6" style={{ fontSize: '0.75rem' }}>GTD</MenuItem>
                                            <MenuItem value="7" style={{ fontSize: '0.75rem' }}>ATC</MenuItem>
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
                                        qualifier={order.qualifier}/>
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
                                style={{ width: '300px' }}/>
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
                                <FormControl size="small" style={{ width: "120px", marginBottom: "10px" }}>
                                    <InputLabel style={{ fontSize: "0.75rem" }}>Algo Strategy Type</InputLabel>
                                    <Select
                                        value={selectedAlgo}
                                        onChange={handleStrategyChange}
                                        style={{ fontSize: "0.75rem" }}>
                                        {algoNames.map((algoName) => (
                                            <MenuItem key={algoName} value={algoName} style={{ fontSize: "0.75rem" }}>
                                                {algoName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <StrategyComponent ref={strategyRef} algoName={selectedAlgo}/>
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
