import * as React from 'react';
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {formatDate, numberFormatter} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, selectedGenericGridRowState, titleBarContextShareColourState, rfqsConfigPanelOpenState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import {LoggerService} from "../services/LoggerService";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {OrderService} from "../services/OrderService";
import {OptionRequestParserService} from "../services/OptionRequestParserService";
import SnippetTitleBarComponent from "../components/SnippetTitleBarComponent";
import {BankHolidayService} from "../services/BankHolidayService";
import {ClientService} from "../services/ClientService";
import {InstrumentService} from "../services/InstrumentService";
import {BookService} from "../services/BookService";
import {AgGridReact} from "ag-grid-react";
import ErrorMessageComponent from "../components/ErrorMessageComponent";
import {TraderService} from "../services/TraderService";
import RfqsConfigPanel from "../components/RfqsConfigPanel";
import RfqActionIconsRenderer from "../components/RfqActionIconsRenderer";
import {VolatilityService} from "../services/VolatilityService";
import {RateService} from "../services/RateService";
import {OptionPricingService} from "../services/OptionPricingService";
import RfqCreationDialog from "../dialogs/RfqCreationDialog";
import {rfqCreationDialogDisplayState} from "../atoms/dialog-state";

export const RfqsApp = () =>
{
    const [rfqs, setRfqs] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const [outboundWorker, setOutboundWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [clientCode, setClientCode] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [isConfigOpen, setIsConfigOpen] = useRecoilState(rfqsConfigPanelOpenState);
    const [, setRfqCreationDialogOpen] = useRecoilState(rfqCreationDialogDisplayState);
    const windowId = useMemo(() => window.command.getWindowId("RFQs"), []);
    const loggerService = useRef(new LoggerService(RfqsApp.name)).current;
    const orderService = useRef(new OrderService()).current;
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const volatilityService = useRef(new VolatilityService()).current;
    const rateService = useRef(new RateService()).current;
    const traderService = useRef(new TraderService()).current;
    const optionRequestParserService = useRef(new OptionRequestParserService()).current;
    const bankHolidayService = useRef(new BankHolidayService()).current;
    const clientService = useRef(new ClientService()).current;
    const bookService = useRef(new BookService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const optionPricingService = useRef(new OptionPricingService()).current;
    const [clients, setClients] = useState([]);
    const [books, setBooks] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [dayCountConventions, setDayCountConventions] = useState([]);
    const [statusEnums, setStatusEnums] = useState([]);
    const [hedgeTypeEnums, setHedgeTypeEnums] = useState([]);
    const [exerciseType, setExerciseType] = useState('EUROPEAN');
    const [config, setConfig] = useState({
        defaultSettlementCurrency: 'USD',
        defaultSettlementDays: 2,
        decimalPrecision: 3,
        defaultSpread: 1,
        defaultSalesCreditPercentage: 0.5,
        defaultVolatility: 20,
        defaultDayConvention: 250
    });
    const [selectedRFQ, setSelectedRFQ] = useState({
        rfqId: '',
        client: '',
        bookCode: '',
        notionalCurrency: '',
        premiumSettlementCurrency: '',
        premiumSettlementDate: '',
        hedgeType: '',
        hedgePrice: ''
    });

    const [selectedRow, setSelectedRow] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageToBeSent, setMessageToBeSent] = useState('');
    const [selectedInitiator, setSelectedInitiator] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [salesCommentary, setSalesCommentary] = useState('Sales\' comment...');
    const [tradersCommentary, setTradersCommentary] = useState('Trader\'s comment...');
    const [clientCommentary, setClientCommentary] = useState('Client\'s feedback...');

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await exchangeRateService.loadExchangeRates();
            await clientService.loadClients();
            await bookService.loadBooks();
            await instrumentService.loadInstruments();
            await traderService.loadTraders();
            await volatilityService.loadVolatilities();
            await rateService.loadRates();

            setClients(clientService.getClients());
            setBooks(bookService.getBooks());
            setInstruments(instrumentService.getInstruments());

            setCurrencies(exchangeRateService.getCurrencyCodes());
            setDayCountConventions([360, 365, 250]);
            setStatusEnums([
                { value: 'PENDING', description: 'Pending' },
                { value: 'APPROVED', description: 'Approved' },
                { value: 'REJECTED', description: 'Rejected' },
                { value: 'COMPLETED', description: 'Completed' }
            ]);
            setHedgeTypeEnums([
                { value: 'NONE', description: 'None' },
                { value: 'FULL', description: 'Full' },
                { value: 'PARTIAL', description: 'Partial' }
            ]);
        };
        loadData().then(() => loggerService.logInfo("Reference loaded in RfqsApp"));
    }, [exchangeRateService, bookService, clientService, loggerService, instrumentService, traderService, volatilityService, rateService]);



    useEffect(() =>
    {
        // const webWorker = new Worker(new URL("../workers/order-reader.js", import.meta.url));
        // setInboundWorker(webWorker);
        // return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        // const webWorker = new Worker(new URL("../workers/manage-order.js", import.meta.url));
        // setOutboundWorker(webWorker);
        // return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        if(selectedGenericGridRow)
            window.messenger.sendMessageToMain(FDC3Service.createOrderMenuContext({rfqId: selectedGenericGridRow.rfqId, orderState: selectedGenericGridRow.state}), null, windowId);

    }, [selectedGenericGridRow, windowId]);

    useEffect(() =>
    {
        const handler = ((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.context")
            {
                if(fdc3Message.contextShareColour)
                    setTitleBarContextShareColour(fdc3Message.contextShareColour);

                if(fdc3Message.instruments?.[0]?.id.ticker)
                    setInstrumentCode(fdc3Message.instruments[0].id.ticker);
                else
                    setInstrumentCode(null);

                if(fdc3Message.clients?.[0]?.id.name)
                    setClientCode(fdc3Message.clients[0].id.name);
                else
                    setClientCode(null);
            }
         });

        window.messenger.handleMessageFromMain(handler);

        return () => window.messenger.removeHandlerForMessageFromMain(handler);

    }, [selectedGenericGridRow]);

    const getValueInUSD = useCallback((value, settlementCurrency) =>
    {
        if(settlementCurrency === 'USD')
            return value;
        else
            return exchangeRateService.convert(value, settlementCurrency, 'USD');

    }, [exchangeRateService]);

    const filterOrdersUsingContext = useMemo(() =>
    {
        if(instrumentCode && clientCode)
            return rfqs.filter((order) => order.instrumentCode === instrumentCode && order.clientCode === clientCode);
        else if(instrumentCode)
            return rfqs.filter((order) => order.instrumentCode === instrumentCode);
        else if(clientCode)
            return rfqs.filter((order) => order.clientCode === clientCode);
        else
            return rfqs;
    }, [rfqs, instrumentCode, clientCode]);

    const handleWorkerMessage = useCallback((event) =>
    {
        const incomingOrder = event.data.order;

        setRfqs((prevData) =>
        {
            //incomingOrder.executedNotionalValueInUSD = exchangeRateService.convert(incomingOrder.executedNotionalValueInLocal, incomingOrder.settlementCurrency, 'USD').toFixed(2);

            const index = prevData.findIndex((element) => element.orderId === incomingOrder.orderId);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = incomingOrder;
                return updatedData;
            }
            else
                return [...prevData, incomingOrder];
        });

    }, [exchangeRateService, orderService]);

    const handleSendSlice = (childOrders) =>
    {
        childOrders.forEach((childOrder) =>
        {
            loggerService.logInfo(`Sending child order with Id: ${childOrder.orderId} to OMS`)
            outboundWorker.postMessage(childOrder);
        });
    }

    const handleSendChatMessage = () =>
    {
        if (messageToBeSent.trim() && selectedInitiator)
        {
            const newMessage = {
                sequenceId: chatMessages.length + 1,
                owner: selectedInitiator.userId,
                content: messageToBeSent,
                timeStamp: new Date(),
                isInitiator: true
            };
            setChatMessages([...chatMessages, newMessage]);
            setMessageToBeSent('');
        }
    };

    const handleKeyPress = (e) =>
    {
        if (e.key === 'Enter')
            handleSendChatMessage();
    };

    const handleRFQFieldChange = (field, value) => setSelectedRFQ(prev => ({...prev, [field]: value}));

    const openConfig = useCallback(() =>
    {
        setIsConfigOpen(true);
    }, [setIsConfigOpen]);

    const closeConfig = useCallback(() => setIsConfigOpen(false), [setIsConfigOpen]);

    const applyConfig = useCallback((newConfig) =>
    {
        setConfig(newConfig);
        setIsConfigOpen(false);
    }, [setIsConfigOpen]);

    const calculateOptionMetrics = useCallback(async (rfqData) =>
    {
        const { notionalFXRate, interestRate, volatility, dayCountConvention, multiplier, contracts, legs, underlyingPrice = 80 } = rfqData;
        
        const totalQuantity = contracts;
        const strike = legs?.[0]?.strike || 100;
        const notionalInLocal = totalQuantity * multiplier * strike;
        const notionalInUSD = (notionalInLocal / notionalFXRate).toFixed(config.decimalPrecision);
        
        const optionType = legs?.[0]?.optionType || 'CALL';
        const isEuropean = rfqData.exerciseType === "EUROPEAN";
        const isCall = (optionType === 'CALL');
        
        let daysToExpiry = rfqData.daysToExpiry;
        if (rfqData.maturityDate && !daysToExpiry)
        {
            const maturityDate = new Date(rfqData.maturityDate);
            const today = new Date();
            daysToExpiry = Math.ceil((maturityDate - today) / (1000 * 60 * 60 * 24));
        }
        
        const {delta, gamma, theta, rho, vega, price} = await optionPricingService.calculateOptionPrice({
            strike, volatility: volatility, underlyingPrice, daysToExpiry,
            interestRate: interestRate, isCall, isEuropean, dayCountConvention
        });
        
        const deltaNumber = Number(delta);
        const gammaNumber = Number(gamma);
        const thetaNumber = Number(theta);
        const vegaNumber = Number(vega);
        const rhoNumber = Number(rho);
        
        const shares = totalQuantity * multiplier;
        const notionalShares = shares * underlyingPrice;
        
        return {
            notionalInLocal,
            notionalInUSD,
            daysToExpiry,
            price,
            deltaNumber,
            gammaNumber,
            thetaNumber,
            vegaNumber,
            rhoNumber,
            shares,
            notionalShares
        };
    }, [config, optionPricingService]);

    const calculateDerivedValues = useCallback((metrics, rfqData) =>
    {
        const { notionalInUSD, price, deltaNumber, gammaNumber, thetaNumber, vegaNumber, rhoNumber, shares, notionalShares } = metrics;
        const { underlyingPrice = 80, spread, salesCreditPercentage, notionalFXRate } = rfqData;
        
        const askPremium = (price + spread/2);
        const bidPremium = (price - spread/2);
        const salesCreditAmount = (salesCreditPercentage * notionalInUSD / 100).toFixed(config.decimalPrecision);
        
        return {
            askPremium: askPremium.toFixed(config.decimalPrecision),
            bidPremium: bidPremium.toFixed(config.decimalPrecision),
            salesCreditAmount,
            askImpliedVol: (rfqData.volatility / 100),
            impliedVol: (rfqData.volatility / 100),
            bidImpliedVol: (rfqData.volatility / 100),
            premiumInUSD: (price / notionalFXRate).toFixed(config.decimalPrecision),
            premiumInLocal: price.toFixed(config.decimalPrecision),
            askPremiumInLocal: askPremium.toFixed(config.decimalPrecision),
            bidPremiumInLocal: bidPremium.toFixed(config.decimalPrecision),
            askPremiumPercentage: ((askPremium * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            premiumPercentage: ((price * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            bidPremiumPercentage: ((bidPremium * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            deltaShares: (deltaNumber * shares).toFixed(config.decimalPrecision),
            deltaNotional: (deltaNumber * notionalShares).toFixed(config.decimalPrecision),
            delta: deltaNumber.toFixed(config.decimalPrecision),
            deltaPercent: ((deltaNumber * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            gammaShares: (gammaNumber * shares).toFixed(config.decimalPrecision),
            gammaNotional: (gammaNumber * notionalShares).toFixed(config.decimalPrecision),
            gamma: gammaNumber.toFixed(config.decimalPrecision),
            gammaPercent: ((gammaNumber * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            thetaShares: (thetaNumber * shares).toFixed(config.decimalPrecision),
            thetaNotional: (thetaNumber * notionalShares).toFixed(config.decimalPrecision),
            theta: thetaNumber.toFixed(config.decimalPrecision),
            thetaPercent: ((thetaNumber * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            vegaShares: (vegaNumber * shares).toFixed(config.decimalPrecision),
            vegaNotional: (vegaNumber * notionalShares).toFixed(config.decimalPrecision),
            vega: vegaNumber.toFixed(config.decimalPrecision),
            vegaPercent: ((vegaNumber * 100) / underlyingPrice).toFixed(config.decimalPrecision),
            rhoShares: (rhoNumber * shares).toFixed(config.decimalPrecision),
            rhoNotional: (rhoNumber * notionalShares).toFixed(config.decimalPrecision),
            rho: rhoNumber.toFixed(config.decimalPrecision),
            rhoPercent: ((rhoNumber * 100) / underlyingPrice).toFixed(config.decimalPrecision)
        };
    }, [config]);

    const createRFQFromOptions = useCallback(async (snippet, parsedOptions) =>
    {
        const totalQuantity = parsedOptions.reduce((sum, option) => sum + option.quantity, 0);
        const {currency, strike, underlying, maturityDate, daysToExpiry} = parsedOptions[0];
        const fxRate = exchangeRateService.getExchangeRate(currency || 'USD');
        const multiplier = 100;
        const dayCountConvention = config.defaultDayConvention;
        const volatility = volatilityService.getVolatility(underlying);
        const interestRate = rateService.getInterestRate(currency);
        const underlyingPrice = 80;
        
        const rfqData =
        {
            notionalFXRate: fxRate,
            interestRate: interestRate,
            volatility: volatility,
            dayCountConvention: dayCountConvention,
            multiplier: multiplier,
            contracts: totalQuantity,
            spread: config.defaultSpread,
            underlyingPrice: underlyingPrice,
            exerciseType: exerciseType,
            maturityDate: maturityDate,
            daysToExpiry: daysToExpiry,
            legs: parsedOptions
        };
        
        const metrics = await calculateOptionMetrics(rfqData);
        const derivedValues = calculateDerivedValues(metrics, rfqData);
        
        const rfq =
        {
            arrivalTime: new Date().toLocaleTimeString(),
            rfqId: crypto.randomUUID(),
            request: snippet,
            client:  'Select Client',
            status: 'Pending',
            bookCode: 'Select Book',
            notionalInUSD: metrics.notionalInUSD,
            notionalInLocal: metrics.notionalInLocal,
            notionalCurrency: currency || config.defaultSettlementCurrency,
            notionalFXRate: fxRate,
            volatility: volatility,
            interestRate: interestRate,
            exerciseType: exerciseType,
            dayCountConvention: dayCountConvention,
            tradeDate: new Date().toLocaleDateString(),
            maturityDate: maturityDate,
            daysToExpiry: metrics.daysToExpiry,
            multiplier: multiplier,
            contracts: totalQuantity,
            salesCreditPercentage: config.defaultSalesCreditPercentage,
            salesCreditAmount: derivedValues.salesCreditAmount,
            premiumSettlementFXRate: 1.0,
            premiumSettlementDaysOverride: config.defaultSettlementDays,
            premiumSettlementCurrency: config.defaultSettlementCurrency,
            premiumSettlementDate: optionRequestParserService.calculateSettlementDate(maturityDate, config.defaultSettlementDays),
            hedgeType: 'Full',
            hedgePrice: strike || 100.0,
            askImpliedVol: derivedValues.askImpliedVol,
            impliedVol: derivedValues.impliedVol,
            bidImpliedVol: derivedValues.bidImpliedVol,
            spread: config.defaultSpread,
            askPremiumInLocal: derivedValues.askPremiumInLocal,
            premiumInUSD: derivedValues.premiumInUSD,
            premiumInLocal: derivedValues.premiumInLocal,
            bidPremiumInLocal: derivedValues.bidPremiumInLocal,
            askPremiumPercentage: derivedValues.askPremiumPercentage,
            premiumPercentage: derivedValues.premiumPercentage,
            bidPremiumPercentage: derivedValues.bidPremiumPercentage,
            deltaShares: derivedValues.deltaShares,
            deltaNotional: derivedValues.deltaNotional,
            delta: derivedValues.delta,
            deltaPercent: derivedValues.deltaPercent,
            gammaShares: derivedValues.gammaShares,
            gammaNotional: derivedValues.gammaNotional,
            gamma: derivedValues.gamma,
            gammaPercent: derivedValues.gammaPercent,
            thetaShares: derivedValues.thetaShares,
            thetaNotional: derivedValues.thetaNotional,
            theta: derivedValues.theta,
            thetaPercent: derivedValues.thetaPercent,
            vegaShares: derivedValues.vegaShares,
            vegaNotional: derivedValues.vegaNotional,
            vega: derivedValues.vega,
            vegaPercent: derivedValues.vegaPercent,
            rhoShares: derivedValues.rhoShares,
            rhoNotional: derivedValues.rhoNotional,
            rho: derivedValues.rho,
            rhoPercent: derivedValues.rhoPercent,
            legs: parsedOptions
        };
        
        return rfq;
    }, [config, optionRequestParserService, volatilityService, rateService, exerciseType, exchangeRateService, calculateOptionMetrics, calculateDerivedValues]);

    const handleSnippetSubmit = useCallback((snippetInput) =>
    {
        try
        {
            const snippet = snippetInput.toUpperCase().trim();
            if(!snippet || snippet === '')
            {
                return {success: false, error: "Snippet cannot be empty!\n\nExamples of valid formats:\n\n1. +1C 100 15AUG2025 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2p 50 20Dec24 9988.hk\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150 10jan2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]"};
            }

            if(!optionRequestParserService.isValidOptionRequest(snippet))
            {
                loggerService.logError(`Invalid RFQ snippet format: ${snippet}`);
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1c 100 15ayg2025 0700.hk\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC24 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150 10jan2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]" };
            }

            const parsedOptions = optionRequestParserService.parseRequest(snippet);
            loggerService.logInfo(`Parsed RFQ from snippet: ${JSON.stringify(parsedOptions)}`);
            
            if (!parsedOptions || parsedOptions.length === 0)
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1c 100 15Aug25 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC2024 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150 10jan2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]" };

            createRFQFromOptions(snippet, parsedOptions).then(newRFQ =>
            {
                setRfqs(prevOrders => [newRFQ, ...prevOrders]);
                loggerService.logInfo(`Successfully created RFQ from snippet: ${snippet}`);
            });

            return { success: true };
        }
        catch (error)
        {
            loggerService.logError(`Failed to parse snippet: ${error.message}`);
            return { success: false, error: `Failed to parse snippet: ${error.message}` };
        }
    }, [optionRequestParserService, loggerService, createRFQFromOptions]);

    const handleRfqCreation = useCallback((snippet) =>
    {
        loggerService.logInfo('Creating RFQ from snippet:', snippet);
        if (snippet && snippet.trim() !== '')
            handleSnippetSubmit(snippet);
    }, [handleSnippetSubmit, loggerService]);

    const handleDeleteRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Deleting RFQ: ${rfqData.rfqId}`);
        setRfqs(prevRfqs => prevRfqs.filter(rfq => rfq.rfqId !== rfqData.rfqId));
        loggerService.logInfo(`Successfully deleted RFQ: ${rfqData.rfqId}`);
    }, [loggerService, setRfqs]);

    const handleCloneRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Cloning RFQ: ${rfqData.rfqId}`);
        const clonedRfq = {...rfqData, rfqId: crypto.randomUUID(), arrivalTime: new Date().toLocaleTimeString(), status: 'Pending' };
        setRfqs(prevRfqs => [clonedRfq, ...prevRfqs]);
        loggerService.logInfo(`Successfully cloned RFQ: ${rfqData.rfqId} to new RFQ: ${clonedRfq.rfqId}`);
    }, [loggerService, setRfqs]);

    const handleEditRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Opening RFQ for editing: ${rfqData.rfqId}`);
        // TODO: Implement edit dialog
        loggerService.logInfo(`Edit dialog for RFQ ${rfqData.rfqId} - to be implemented`);
    }, [loggerService]);

    const handleSaveRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Saving RFQ to OMS: ${rfqData.rfqId}`);
        // TODO: Implement web worker to send to OMS
        loggerService.logInfo(`Save to OMS for RFQ ${rfqData.rfqId} - to be implemented`);
    }, [loggerService]);

    const handleChartRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Opening chart dialog for RFQ: ${rfqData.rfqId}`);
        // TODO: Implement option pricing scenario charting dialog
        loggerService.logInfo(`Chart dialog for RFQ ${rfqData.rfqId} - to be implemented`);
    }, [loggerService]);

    const handleViewRfq = useCallback((rfqData) =>
    {
        loggerService.logInfo(`Opening RFQ details window for RFQ: ${rfqData.rfqId}`);

        const launchRfqDetailsApp = () =>
            window.launchPad.openApp({url: 'http://localhost:3000/rfq-details',title: `RFQ Details: ${rfqData.rfqId}`, modalFlag: true});

        launchRfqDetailsApp();
    }, []);

    const handleRfqAction = useCallback((action, rfqData) =>
    {
        switch (action)
        {
            case "delete":
                handleDeleteRfq(rfqData);
                break;
            case "clone":
                handleCloneRfq(rfqData);
                break;
            case "edit":
                handleEditRfq(rfqData);
                break;
            case "save":
                handleSaveRfq(rfqData);
                break;
            case "chart":
                handleChartRfq(rfqData);
                break;
            case "view":
                handleViewRfq(rfqData);
                break;
            default:
                loggerService.logError(`Unknown RFQ action: ${action}`);
        }
    }, [handleDeleteRfq, handleCloneRfq, handleEditRfq, handleSaveRfq, handleChartRfq, handleViewRfq, loggerService]);

    const recalculateRFQ = useCallback(async (rfqData) =>
    {
        try
        {
            loggerService.logInfo(`Recalculating RFQ: ${rfqData.rfqId}`);
            
            const metrics = await calculateOptionMetrics(rfqData);
            const derivedValues = calculateDerivedValues(metrics, rfqData);
            
            const premiumSettlementDate = optionRequestParserService.calculateSettlementDate(rfqData.maturityDate, rfqData.premiumSettlementDaysOverride);
            
            const updatedRFQ = {
                ...rfqData,
                notionalInUSD: metrics.notionalInUSD,
                notionalInLocal: metrics.notionalInLocal,
                salesCreditAmount: derivedValues.salesCreditAmount,
                premiumSettlementDate: premiumSettlementDate,
                askImpliedVol: derivedValues.askImpliedVol,
                impliedVol: derivedValues.impliedVol,
                bidImpliedVol: derivedValues.bidImpliedVol,
                askPremiumInLocal: derivedValues.askPremiumInLocal,
                premiumInUSD: derivedValues.premiumInUSD,
                premiumInLocal: derivedValues.premiumInLocal,
                bidPremiumInLocal: derivedValues.bidPremiumInLocal,
                askPremiumPercentage: derivedValues.askPremiumPercentage,
                premiumPercentage: derivedValues.premiumPercentage,
                bidPremiumPercentage: derivedValues.bidPremiumPercentage,
                deltaShares: derivedValues.deltaShares,
                deltaNotional: derivedValues.deltaNotional,
                delta: derivedValues.delta,
                deltaPercent: derivedValues.deltaPercent,
                gammaShares: derivedValues.gammaShares,
                gammaNotional: derivedValues.gammaNotional,
                gamma: derivedValues.gamma,
                gammaPercent: derivedValues.gammaPercent,
                thetaShares: derivedValues.thetaShares,
                thetaNotional: derivedValues.thetaNotional,
                theta: derivedValues.theta,
                thetaPercent: derivedValues.thetaPercent,
                vegaShares: derivedValues.vegaShares,
                vegaNotional: derivedValues.vegaNotional,
                vega: derivedValues.vega,
                vegaPercent: derivedValues.vegaPercent,
                rhoShares: derivedValues.rhoShares,
                rhoNotional: derivedValues.rhoNotional,
                rho: derivedValues.rho,
                rhoPercent: derivedValues.rhoPercent
            };
            
            setRfqs(prevRfqs => prevRfqs.map(rfq => rfq.rfqId === rfqData.rfqId ? updatedRFQ : rfq ));
            loggerService.logInfo(`Successfully recalculated RFQ: ${rfqData.rfqId}`);
        }
        catch (error)
        {
            loggerService.logError(`Failed to recalculate RFQ ${rfqData.rfqId}: ${error.message}`);
            setErrorMessage(`Failed to recalculate RFQ ${rfqData.rfqId}: ${error.message}`)
        }
    }, [config, optionPricingService, optionRequestParserService, loggerService, setRfqs, calculateOptionMetrics, calculateDerivedValues]);

    const handleCellValueChanged = useCallback((params) =>
    {
        const { data: rfqData, colDef, oldValue, newValue } = params;
        const fieldsRequiringRecalculation =
        [
            'notionalFXRate', 'interestRate', 'volatility', 'dayCountConvention', 'multiplier',
            'salesCreditPercentage', 'premiumSettlementDaysOverride', 'spread', 'contracts'
        ];
        
        if (fieldsRequiringRecalculation.includes(colDef.field))
            recalculateRFQ(rfqData).then(() => loggerService.logInfo(`Field ${colDef.field} changed from ${oldValue} to ${newValue} for RFQ: ${rfqData.rfqId} this will trigger a recalculation.`));
    }, [recalculateRFQ, loggerService]);

    const handleSaveRequest = (isSave) =>
    {
        if (isSave)
            loggerService.logInfo('Saving RFQ:', selectedRFQ);
        else
            loggerService.logInfo('Cancelling RFQ changes');
    };

    useEffect(() =>
    {
        if (inboundWorker)
            inboundWorker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (inboundWorker)
                inboundWorker.onmessage = null;
        };
    }, [inboundWorker]);

    useEffect(() =>
    {
        if(selectedContextShare.length === 1)
        {
            if(selectedContextShare[0].contextShareKey === 'instrumentCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length === 2)
        {
            const instrumentCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'instrumentCode').contextShareValue;
            const clientCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'clientCode').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(instrumentCode, clientCode), null, windowId);
        }
    }, [selectedContextShare, windowId]);

    const getUniqueClientNames = useCallback(() =>
    {
        return clients.map(c => c.clientName).sort();
    }, [clients]);

    const getUniqueBookCodes = useCallback(() =>
    {
        return books.map(b => b.bookCode).sort();
    }, [books]);

    const columnDefs = useMemo(() => 
    {
        const clientDropdownValues = getUniqueClientNames();
        
        return ([
            // Actions Column
            {
                headerName: 'Actions',
                field: 'actions',
                sortable: false,
                width: 140,
                filter: false,
                hide: true,
                cellRenderer: RfqActionIconsRenderer
            },
            // Basic RFQ Information
             {headerName: "Arrival Time", field: "arrivalTime", sortable: true, minWidth: 130, width: 130, filter: true, editable: false},
             {headerName: "Request", field: "request", sortable: true, minWidth: 250, width: 250, filter: true, editable: false},
             {headerName: "Client", field: "client", sortable: true, minWidth: 200, width: 200, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: clientDropdownValues }, editable: true},
             {headerName: "Status", field: "status", sortable: true, minWidth: 120, width: 120, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: statusEnums.map(s => s.description) }},
             {headerName: "Book", field: "bookCode", sortable: true, minWidth: 100, width: 100, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: getUniqueBookCodes() }, editable: true},

            {headerName: "Notional$", field: "notionalInUSD", sortable: true, minWidth: 120, width: 140, filter: true, headerTooltip: 'Notional amount in USD',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Notional in Local", field: "notionalInLocal", sortable: true, minWidth: 120, width: 140, filter: true, headerTooltip: 'Notional amount in local currency',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Currency", field: "notionalCurrency", sortable: true, minWidth: 100, width: 100, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies }},
            {headerName: "FX Rate", field: "notionalFXRate", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Interest Rate%", field: "interestRate", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Risk free interest rate for the option currency',
                editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Volatility%", field: "volatility", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Annualized volatility of the underlying asset',
                editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            
            // Trading Details
            {headerName: "Exercise Type" , field: "exerciseType", sortable: false, minWidth: 100, width: 100, editable: false, filter: false,
                headerTooltip: "EUROPEAN exercise type means that the option can only be exercised at maturity. This option pricing model does NOT support AMERICAN exercise type."},
             {headerName: "Day Count", field: "dayCountConvention", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Day count convention used for interest calculations',
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: dayCountConventions }, editable: true},
             {headerName: "Trade Date", field: "tradeDate", sortable: true, minWidth: 120, width: 120, filter: true, valueFormatter: (params) => formatDate(params.value),
                 editable: false, cellEditor: 'agDateInputCellEditor'},
            {headerName: "Maturity Date", field: "maturityDate", sortable: true, minWidth: 130, width: 130, filter: true, valueFormatter: (params) => formatDate(params.value),
                editable: false, cellEditor: 'agDateInputCellEditor'},
            {headerName: "Days to Expiry", field: "daysToExpiry", sortable: true, minWidth: 120, width: 120, filter: true},
            {headerName: "Multiplier", field: "multiplier", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Contract multiplier defining the number of units of the underlying asset per option contract',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Contracts", field: "contracts", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Number of option contracts in the RFQ',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Legs", field: "legs", sortable: true, minWidth: 80, width: 80, filter: true, headerTooltip: 'Number of legs in the option strategy',
                editable: false, valueFormatter: (params) => params.value ? params.value.length : 0},

            // Sales Credit
            {headerName: "S.Credit %", field: "salesCreditPercentage", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Sales credit as a percentage of the notional amount',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "S.Credit$", field: "salesCreditAmount", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Amount of sales credit in USD',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},

            // Settlement
            {headerName: "Stt.Days", field: "premiumSettlementDaysOverride", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Override the standard premium settlement days',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Stt.Curr", field: "premiumSettlementCurrency", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Currency in which the option premium is settled',
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies }},
            {headerName: "Stt.Date", field: "premiumSettlementDate", sortable: true, minWidth: 120, width: 120, filter: true, valueFormatter: (params) => formatDate(params.value), headerTooltip: 'Date on which the option premium is settled',
              editable: true, cellEditor: 'agDateInputCellEditor'},

            // Hedge
            {headerName: "Hedge Type", field: "hedgeType", sortable: true, minWidth: 120, width: 120, filter: true,
             cellEditor: 'agSelectCellEditor', cellEditorParams: { values: hedgeTypeEnums.map(h => h.description) }},
            {headerName: "Hedge Price", field: "hedgePrice", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},

            // Implied Volatility
            {headerName: "Ask Impl Vol%", field: "askImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the ask price of the option',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Impl Vol%", field: "impliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the theoretical (model-driven) value of the option',
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Impl Vol%", field: "bidImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the bid price of the option',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Premium Amounts
            {headerName: "Spread", field: "spread", sortable: false, minWidth: 100, width: 100, filter: true, editable: true, headerTooltip: 'Difference between the ask and bid premium amounts in local currency'},
            {headerName: "Fair Premium", field: "premiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theoretical price of the option based on the option model in local currency',
                editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Premium$", field: "premiumInUSD", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theoretical price of the option based on the option model in USD',
                editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Ask Premium", field: "askPremiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Price at which sellers are willing to sell the option in local currency',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Premium", field: "bidPremiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Price at which buyers are willing to buy the option in local currency',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Premium Percentages
            {headerName: "Ask Premium%", field: "askPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Ask premium as a percentage of the underlying price in local currency',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Premium%", field: "premiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Fair premium as a percentage of the underlying price in local currency',
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Premium%", field: "bidPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Bid premium as a percentage of the underlying price in local currency',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Delta
            {headerName: "Option Delta", field: "delta", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option delta (rate of change of option price with respect to changes in the underlying price)',
                editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Delta Shares", field: "deltaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option delta × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Delta Notional", field: "deltaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Delta shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Delta %", field: "deltaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option delta expressed a percentage of the underlying price.',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Gamma
            {headerName: "Option Gamma", field: "gamma", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option gamma (rate of change of option delta with respect to changes in the underlying price)',
                editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Gamma Shares", field: "gammaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option gamma × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Gamma Notional", field: "gammaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Gamma shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Gamma %", field: "gammaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option gamma expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Theta
            {headerName: "Option Theta", field: "theta", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option theta (rate of change of option price with respect to time decay)',
                editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Theta Shares", field: "thetaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option theta × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Theta Notional", field: "thetaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theta shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Theta %", field: "thetaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option theta expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Vega
            {headerName: "Option Vega", field: "vega", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option vega (rate of change of option price with respect to changes in volatility)',
                editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Vega Shares", field: "vegaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option vega × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Vega Notional", field: "vegaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Vega shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Vega %", field: "vegaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option vega expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Rho
            {headerName: "Option Rho", field: "rho", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option rho (rate of change of option price with respect to changes in interest rates)',
                editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Rho Shares", field: "rhoShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option rho × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Rho Notional", field: "rhoNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Rho shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Rho %", field: "rhoPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option rho expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)}
        ]);
    }, [clients, books, currencies, dayCountConventions, statusEnums, hedgeTypeEnums, getUniqueClientNames, getUniqueBookCodes]);

    const onGridReady = (params) =>
    {
        const sortModel = { colId: 'arrivalTime', sort: 'desc' }
        if(sortModel !== undefined && sortModel !== null)
            params.columnApi.applyColumnState({state: [sortModel], applyOrder: true});
    };

    const onRowSelected = (event) =>
    {
        console.log('onRowSelected event:', event);
        if (event.node.isSelected())
        {
            console.log('Setting selectedRow to:', event.data);
            setSelectedRow(event.data);
        }
        else
        {
            console.log('Clearing selectedRow');
            setSelectedRow(null);
        }
    };

    const onSelectionChanged = (event) =>
    {
        console.log('onSelectionChanged event:', event);
        const selectedNodes = event.api.getSelectedNodes();
        console.log('Selected nodes:', selectedNodes);
        if (selectedNodes.length > 0)
        {
            console.log('Setting selectedRow to:', selectedNodes[0].data);
            setSelectedRow(selectedNodes[0].data);
        }
        else
        {
            console.log('Clearing selectedRow');
            setSelectedRow(null);
        }
    };

    const handleTitleBarAction = useCallback((action) =>
    {
        console.log('handleTitleBarAction called with:', action, 'selectedRow:', selectedRow);
        if (!selectedRow)
        {
            console.log('No selected row, action ignored');
            return;
        }
        handleRfqAction(action, selectedRow);
    }, [selectedRow, handleRfqAction]);

    return (<>
        <SnippetTitleBarComponent 
            title="Request For Quote" 
            windowId={windowId} 
            addButtonProps={{ handler: () => setRfqCreationDialogOpen({open: true, clear: true}), tooltipText: "Add new RFQ...", clearContent: true }} 
            showChannel={true}
            showTools={false} 
            showConfig={{ handler: openConfig }} 
            snippetPrompt={"Enter RFQ snippet..."} 
            onSnippetSubmit={handleSnippetSubmit}
            actionButtonsProps={{
                selectedRow: selectedRow,
                onAction: handleTitleBarAction
            }}
        />

        <div className="rfqs-app" style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <div className="ag-theme-alpine notional-limits-grid" style={{ height: '100%', width: '100%' }}>
                <AgGridReact 
                    rowData={rfqs} 
                    columnDefs={columnDefs} 
                    rowHeight={22} 
                    headerHeight={22} 
                    getRowId={params => params.data.rfqId} 
                    onGridReady={onGridReady}
                    onCellValueChanged={handleCellValueChanged}
                    onRowSelected={onRowSelected}
                    onSelectionChanged={onSelectionChanged}
                    rowSelection="single"
                    context={{ handleRfqAction }}
                    enableCellChangeFlash={true}
                    cellFlashDelay={2000}
                    animateRows={true}
                    defaultColDef={{
                        resizable: true,
                        sortable: true,
                        filter: true,
                        floatingFilter: false
                    }}
                />
            </div>
            {errorMessage ? (<ErrorMessageComponent message={errorMessage} duration={3000} onDismiss={() => setErrorMessage(null)} position="bottom-right" maxWidth="900px"/>): null}
            <RfqsConfigPanel isOpen={isConfigOpen} config={config} onClose={closeConfig} onApply={applyConfig} />
            <RfqCreationDialog closeHandler={handleRfqCreation} instruments={instruments} />
        </div>
    </>)

}
