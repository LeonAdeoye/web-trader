import * as React from 'react';
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {formatDate, numberFormatter} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, selectedGenericGridRowState, titleBarContextShareColourState, rfqsConfigPanelOpenState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import {LoggerService} from "../services/LoggerService";
import {OptionRequestParserService} from "../services/OptionRequestParserService";
import SnippetTitleBarComponent from "../components/SnippetTitleBarComponent";
import {BookService} from "../services/BookService";
import {AgGridReact} from "ag-grid-react";
import ErrorMessageComponent from "../components/ErrorMessageComponent";
import RfqsConfigPanel from "../components/RfqsConfigPanel";
import RfqActionIconsRenderer from "../components/RfqActionIconsRenderer";
import StatusRenderer from "../components/StatusRenderer";
import {OptionPricingService} from "../services/OptionPricingService";
import RfqCreationDialog from "../dialogs/RfqCreationDialog";
import {rfqCreationDialogDisplayState} from "../atoms/dialog-state";
import { ServiceRegistry } from '../services/ServiceRegistry';

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
    const exchangeRateService = useRef(ServiceRegistry.getExchangeRateService()).current;
    const volatilityService = useRef(ServiceRegistry.getVolatilityService()).current;
    const priceService = useRef(ServiceRegistry.getPriceService()).current;
    const rateService = useRef(ServiceRegistry.getRateService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const traderService = useRef(ServiceRegistry.getTraderService()).current;
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const optionRequestParserService = useRef(new OptionRequestParserService()).current;
    const bookService = useRef(new BookService()).current;
    const optionPricingService = useRef(new OptionPricingService()).current;
    const configurationService = useRef(ServiceRegistry.getConfigurationService()).current;
    const [clients, setClients] = useState([]);
    const [books, setBooks] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [dayCountConventions, setDayCountConventions] = useState([]);
    const [statusEnums, setStatusEnums] = useState([]);
    const [hedgeTypeEnums, setHedgeTypeEnums] = useState([]);
    const [exerciseType] = useState('EUROPEAN');
    const [config, setConfig] = useState({
        defaultSettlementCurrency: 'USD',
        defaultSettlementDays: 2,
        decimalPrecision: 3,
        defaultSpread: 1,
        defaultSalesCreditPercentage: 0.5,
        defaultVolatility: 20,
        defaultDayConvention: 250,
        defaultOptionModel: 'european'
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
    const [ownerId, setOwnerId] = useState(null);

    // Define RFQ-specific config keys with prefix
    const RFQ_CONFIG_KEYS = [
        'rfq_defaultSettlementCurrency',
        'rfq_defaultSettlementDays',
        'rfq_decimalPrecision',
        'rfq_defaultSpread',
        'rfq_defaultSalesCreditPercentage',
        'rfq_defaultVolatility',
        'rfq_defaultDayConvention',
        'rfq_defaultOptionModel'
    ];



    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);



    // Load configuration from service
    const loadConfiguration = useCallback(async () => 
    {
        try 
        {
            if (!ownerId)
                return;

            await configurationService.loadConfigurations(ownerId);
            const allConfigs = configurationService.getConfigsBelongingToOwner(ownerId);
            const rfqConfigs = allConfigs.filter(config => 
                RFQ_CONFIG_KEYS.includes(config.key)
            );
            
            if (rfqConfigs && rfqConfigs.length > 0) 
            {
                const loadedConfig = {};
                rfqConfigs.forEach(config => 
                {
                    if (config.key && config.value !== null) 
                    {
                        const localKey = config.key.replace('rfq_', '');
                        if (['defaultSettlementDays', 'decimalPrecision', 'defaultSpread', 'defaultSalesCreditPercentage', 'defaultVolatility', 'defaultDayConvention'].includes(localKey)) 
                            loadedConfig[localKey] = parseFloat(config.value);
                        else 
                            loadedConfig[localKey] = config.value;
                    }
                });

                setConfig(prevConfig => ({...prevConfig, ...loadedConfig}));
                loggerService.logInfo(`Loaded RFQ configuration for owner: ${ownerId}`, loadedConfig);
            } 
            else
                loggerService.logInfo(`No RFQ configuration found for owner: ${ownerId}, using defaults`);
        } 
        catch (error) 
        {
            loggerService.logError(`Failed to load configuration: ${error.message}`);
        }
    }, [configurationService, ownerId, loggerService]);

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
            await priceService.loadPrices();
            await loadConfiguration(); // Load configuration from service

            setClients(clientService.getClients());
            setBooks(bookService.getBooks());
            setInstruments(instrumentService.getInstruments());
            setCurrencies(exchangeRateService.getCurrencyCodes());
            setDayCountConventions([360, 365, 250]);
            setStatusEnums([
                { value: 'PENDING', description: 'Pending' },
                { value: 'ACCEPTED', description: 'Accepted' },
                { value: 'REJECTED', description: 'Rejected' },
                { value: 'PRICING', description: 'Pricing' },
                { value: 'PRICED', description: 'Priced' },
                { value: 'TRADED_AWAY', description: 'Traded Away' },
                { value: 'TRADE_COMPLETED', description: 'Trade Completed' }
            ]);
            setHedgeTypeEnums([
                { value: 'NONE', description: 'None' },
                { value: 'FULL', description: 'Full' },
                { value: 'PARTIAL', description: 'Partial' }
            ]);
        };
        loadData().then(() => loggerService.logInfo("Reference loaded in RfqsApp"));
    }, [exchangeRateService, bookService, clientService, loggerService, instrumentService, traderService, volatilityService, rateService, loadConfiguration]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/read-rfq.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

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
        const webWorker = new Worker(new URL("../workers/send-rfq.js", import.meta.url));
        setOutboundWorker(webWorker);
        return () => webWorker.terminate();
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
        const incomingRfq = event.data.rfq;
        setRfqs((prevData) =>
        {
            const index = prevData.findIndex((element) => element.rfqId === incomingRfq.rfqId);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = incomingRfq;
                return updatedData;
            }
            else
                return [...prevData, incomingRfq];
        });

    }, []);

    const handleSendSlice = (childOrders) =>
    {
        childOrders.forEach((childOrder) =>
        {
            loggerService.logInfo(`Sending child order with Id: ${childOrder.orderId} to OMS`)
            outboundWorker.postMessage(childOrder);
        });
    }

    const handleRFQFieldChange = (field, value) => setSelectedRFQ(prev => ({...prev, [field]: value}));

    const openConfig = useCallback(() =>
    {
        setIsConfigOpen(true);
    }, [setIsConfigOpen]);

    const closeConfig = useCallback(() => setIsConfigOpen(false), [setIsConfigOpen]);
    const applyConfig = useCallback(async (newConfig) =>
    {
        try 
        {
            setConfig(newConfig);
            setIsConfigOpen(false);
            const rfqConfigToSave = {};
            RFQ_CONFIG_KEYS.forEach(key =>
            {
                const localKey = key.replace('rfq_', '');
                if (newConfig[localKey] !== undefined)
                    rfqConfigToSave[key] = newConfig[localKey];
            });

            await configurationService.saveOrUpdateConfigurations(ownerId, rfqConfigToSave);
            loggerService.logInfo(`Successfully applied RFQ configuration for owner: ${ownerId}`, rfqConfigToSave);
        } 
        catch (error) 
        {
            loggerService.logError(`Failed to apply configuration: ${error.message}`);
        }
    }, [setIsConfigOpen, configurationService, ownerId, loggerService]);

    const calculateOptionMetrics = useCallback(async (rfqData) =>
    {
        const { dayCountConvention, multiplier, legs } = rfqData;
        if (!legs || legs.length === 0)
            return null;
        
        let daysToExpiry = optionRequestParserService.calculateBusinessDaysToExpiry(new Date(), new Date(rfqData.maturityDate));
        const isEuropean = rfqData.exerciseType === "EUROPEAN";
        let totalDelta = 0;
        let totalGamma = 0;
        let totalTheta = 0;
        let totalVega = 0;
        let totalRho = 0;
        let totalPrice = 0;
        let totalShares = 0;
        let totalNotionalShares = 0;
        let totalNotionalInLocal = 0;
        let totalNotionalInUSD = 0.0;

        for (const leg of legs)
        {
            const {quantity, strike, optionType, } = leg;
            const {volatility, interestRate, underlyingPrice} = rfqData;
            const isCall = (optionType === 'CALL');

            const {delta: rawDelta, gamma: rawGamma, theta: rawTheta, rho: rawRho, vega: rawVega, price: rawPrice} =
                await optionPricingService.calculateOptionPrice({strike , volatility: volatility/100, underlyingPrice, daysToExpiry,
                interestRate: interestRate/100, isCall, isEuropean, dayCountConvention, modelType: config.defaultOptionModel });
            
            const deltaNumber = rawDelta;
            const gammaNumber = rawGamma;
            const thetaNumber = rawTheta;
            const vegaNumber = rawVega;
            const rhoNumber = rawRho;
            const priceNumber = rawPrice;
            const legShares = quantity * multiplier;
            const legNotionalShares = legShares * underlyingPrice;
            const legNotionalInLocal = quantity * multiplier * strike;
            const sideMultiplier = (leg.side === 'SELL' ? -1 : 1);
            
            totalDelta += deltaNumber * quantity * sideMultiplier;
            totalGamma += gammaNumber * quantity * sideMultiplier;
            totalTheta += thetaNumber * quantity * sideMultiplier;
            totalVega += vegaNumber * quantity * sideMultiplier;
            totalRho += rhoNumber * quantity * sideMultiplier;
            totalPrice += priceNumber * quantity * sideMultiplier;
            totalShares += legShares;
            totalNotionalShares += legNotionalShares;
            totalNotionalInLocal += legNotionalInLocal;
            totalNotionalInUSD += rfqData.notionalFXRate > 0 ? (legNotionalInLocal/rfqData.notionalFXRate) : rfqData.notionalFXRate
        }
        
        return {
            notionalInLocal: totalNotionalInLocal,
            notionalInUSD: totalNotionalInUSD,
            daysToExpiry,
            price: totalPrice,
            deltaNumber: totalDelta,
            gammaNumber: totalGamma,
            thetaNumber: totalTheta,
            vegaNumber: totalVega,
            rhoNumber: totalRho,
            shares: totalShares,
            notionalShares: totalNotionalShares
        };
    }, [config, optionPricingService]);

    const calculateDerivedValues = useCallback((metrics, rfqData) =>
    {
        const { notionalInUSD, price, deltaNumber, gammaNumber, thetaNumber, vegaNumber, rhoNumber} = metrics;
        const { underlying, spread, notionalFXRate, multiplier = 100, legs } = rfqData;
        const salesCreditPercentage = rfqData.salesCreditPercentage || config.defaultSalesCreditPercentage;
        const legUnderlyingPrice = priceService.getLastTradePrice(underlying);

        let weightedVolatility = 0;
        let weightedInterestRate = 0;
        let totalWeight = 0;

        for (const leg of legs)
        {
            const legWeight = leg.quantity * multiplier;
            weightedVolatility += leg.volatility * legWeight;
            weightedInterestRate += leg.interestRate * legWeight;
            totalWeight += legWeight;
        }
        
        const avgVolatility = totalWeight > 0 ? weightedVolatility / totalWeight : 0;
        const askPremium = (price + spread/2);
        const bidPremium = (price - spread/2);
        const salesCreditAmount = (salesCreditPercentage * notionalInUSD / 100).toFixed(config.decimalPrecision);
        
        return {
            askPremium: askPremium.toFixed(config.decimalPrecision),
            bidPremium: bidPremium.toFixed(config.decimalPrecision),
            salesCreditPercentage,
            salesCreditAmount,
            askImpliedVol: (avgVolatility / 100),
            impliedVol: (avgVolatility / 100),
            bidImpliedVol: (avgVolatility / 100),
            premiumInUSD: (price / notionalFXRate).toFixed(config.decimalPrecision),
            premiumInLocal: price.toFixed(config.decimalPrecision),
            askPremiumInLocal: askPremium.toFixed(config.decimalPrecision),
            bidPremiumInLocal: bidPremium.toFixed(config.decimalPrecision),
            askPremiumPercentage: ((askPremium * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            premiumPercentage: ((price * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            bidPremiumPercentage: ((bidPremium * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            deltaShares: (deltaNumber * multiplier).toFixed(config.decimalPrecision),
            deltaNotional: (deltaNumber * multiplier * legUnderlyingPrice).toFixed(config.decimalPrecision),
            delta: deltaNumber.toFixed(config.decimalPrecision),
            deltaPercent: ((deltaNumber * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            gammaShares: (gammaNumber * multiplier).toFixed(config.decimalPrecision),
            gammaNotional: (gammaNumber * multiplier * legUnderlyingPrice).toFixed(config.decimalPrecision),
            gamma: gammaNumber.toFixed(config.decimalPrecision),
            gammaPercent: ((gammaNumber * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            thetaShares: (thetaNumber * multiplier).toFixed(config.decimalPrecision),
            thetaNotional: (thetaNumber * multiplier * legUnderlyingPrice).toFixed(config.decimalPrecision),
            theta: thetaNumber.toFixed(config.decimalPrecision),
            thetaPercent: ((thetaNumber * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            vegaShares: (vegaNumber * multiplier).toFixed(config.decimalPrecision),
            vegaNotional: (vegaNumber * multiplier * legUnderlyingPrice).toFixed(config.decimalPrecision),
            vega: vegaNumber.toFixed(config.decimalPrecision),
            vegaPercent: ((vegaNumber * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision),
            rhoShares: (rhoNumber * multiplier).toFixed(config.decimalPrecision),
            rhoNotional: (rhoNumber * multiplier * legUnderlyingPrice).toFixed(config.decimalPrecision),
            rho: rhoNumber.toFixed(config.decimalPrecision),
            rhoPercent: ((rhoNumber * 100) / legUnderlyingPrice).toFixed(config.decimalPrecision)
        };
    }, [config, priceService]);

    const createRFQFromOptions = useCallback(async (snippet, parsedOptions) =>
    {
        const totalQuantity = parsedOptions.reduce((sum, option) => sum + option.quantity, 0);
        let strikeArray = new Array(parsedOptions.length);
        for(let i = 0; i < parsedOptions.length; i++)
            strikeArray[i] = parsedOptions[i].strike;

        const rfqData =
        {
            dayCountConvention: config.defaultDayConvention,
            multiplier: 100,
            underlying: parsedOptions[0].underlying,
            underlyingPrice: priceService.getLastTradePrice(parsedOptions[0].underlying),
            currency: parsedOptions[0].currency || config.defaultSettlementCurrency,
            interestRate: parsedOptions[0].interestRate,
            volatility: parsedOptions[0].volatility || config.defaultVolatility,
            notionalFXRate: exchangeRateService.getExchangeRate(parsedOptions[0].currency || config.defaultSettlementCurrency),
            contracts: totalQuantity,
            spread: config.defaultSpread,
            exerciseType: exerciseType,
            maturityDate: parsedOptions[0].maturityDate,
            legs: parsedOptions
        };
        
        const metrics = await calculateOptionMetrics(rfqData);
        if (!metrics)
            throw new Error("Failed to calculate option metrics");
        
        const derivedValues = calculateDerivedValues(metrics, rfqData);
        if (!derivedValues)
            throw new Error("Failed to calculate derived values");

        const rfq =
        {
            arrivalTime: new Date().toLocaleTimeString(),
            rfqId: crypto.randomUUID(),
            underlying: rfqData.underlying,
            strike: [...new Set(strikeArray)].length === 1 ? strikeArray[0] : strikeArray.join(', '),
            underlyingPrice: rfqData.underlyingPrice,
            request: snippet,
            client:  'Select Client',
            status: 'Pending',
            bookCode: 'Select Book',
            notionalInUSD: metrics.notionalInUSD.toFixed(config.decimalPrecision),
            notionalInLocal: metrics.notionalInLocal,
            notionalCurrency: rfqData.currency,
            notionalFXRate: rfqData.notionalFXRate,
            volatility: rfqData.volatility,
            interestRate:  rfqData.interestRate,
            exerciseType: exerciseType,
            dayCountConvention: config.defaultDayConvention,
            tradeDate: new Date().toLocaleDateString(),
            maturityDate: rfqData.maturityDate,
            daysToExpiry: metrics.daysToExpiry,
            multiplier: 100,
            contracts: totalQuantity,
            salesCreditPercentage: config.defaultSalesCreditPercentage,
            salesCreditAmount: derivedValues.salesCreditAmount,
            premiumSettlementFXRate: 1.0,
            premiumSettlementDaysOverride: config.defaultSettlementDays,
            premiumSettlementCurrency: config.defaultSettlementCurrency,
            premiumSettlementDate: optionRequestParserService.calculateSettlementDate(rfqData.maturityDate, config.defaultSettlementDays),
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
                return {success: false, error: "Snippet cannot be empty!\n\nExamples of valid formats:\n\n1. +1C 100 15AUG2025 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2p 50 20Dec24 9988.hk\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150,120 10jan2026 7203.TK\n   [2 Legs: Buy 1 call + 1 put option, two strikes: ¥150 and ¥120 for each option leg, the same expiry date: Jan 10 2026, the same underlying Toyota]"};

            if(!optionRequestParserService.isValidOptionRequest(snippet))
            {
                loggerService.logError(`Invalid RFQ snippet format: ${snippet}`);
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1c 100 15ayg2025 0700.hk\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC24 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150,120 10jan2026 7203.TK\n   [2 Legs: Buy 1 call + 1 put option, two strikes: ¥150 and ¥120 for each option leg, the same expiry date: Jan 10 2026, the same underlying Toyota]" };
            }

            const parsedOptions = optionRequestParserService.parseRequest(snippet);
            loggerService.logInfo(`Parsed RFQ from snippet: ${JSON.stringify(parsedOptions)}`);
            
            if (!parsedOptions || parsedOptions.length === 0)
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1c 100 15Aug25 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC2024 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1c,+1P 150,120 10jan2026 7203.TK\n   [2 Legs: Buy 1 call + 1 put option, two strikes: ¥150 and ¥120 for each option leg, the same expiry date Jan 10 2026, and the same underlying Toyota]" };

            createRFQFromOptions(snippet, parsedOptions).then(newRFQ =>
            {
                setSelectedRFQ(newRFQ);
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
        if (snippet && snippet.trim() !== '')
            handleSnippetSubmit(snippet);

    }, [handleSnippetSubmit, loggerService]);

    const handleDeleteRfq = useCallback((rfqData) =>
    {
        setRfqs(prevRfqs => prevRfqs.filter(rfq => rfq.rfqId !== rfqData.rfqId));
        loggerService.logInfo(`Successfully deleted RFQ: ${rfqData.rfqId}`);
    }, [loggerService, setRfqs]);

    const handleCloneRfq = useCallback((rfqData) =>
    {
        const clonedRfq = {...rfqData, rfqId: crypto.randomUUID(), arrivalTime: new Date().toLocaleTimeString(), status: 'Pending' };
        setRfqs(prevRfqs => [clonedRfq, ...prevRfqs]);
        loggerService.logInfo(`Successfully cloned RFQ: ${rfqData.rfqId} to new RFQ: ${clonedRfq.rfqId}`);
    }, [loggerService, setRfqs]);

    const handleSaveRfq = useCallback((rfqData) =>
    {
        outboundWorker.postMessage(rfqData)
        loggerService.logInfo(`Saving to RMS for RFQ ${JSON.stringify(rfqData)}`);
    }, [loggerService]);

    const handleChartRfq = useCallback((rfqData) =>
    {
        const encodedRfqData = encodeURIComponent(JSON.stringify(rfqData));
        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        const launchRfqDetailsApp = () =>
            window.launchPad.openApp({url: `http://localhost:3000/rfq-charts?rfqData=${encodedRfqData}&config=${encodedConfig}`,title: `RFQ Charts : ${rfqData.rfqId}`, modalFlag: true});

        launchRfqDetailsApp();
    }, [config]);

    const handleViewRfq = useCallback((rfqData) =>
    {
        const encodedRfqData = encodeURIComponent(JSON.stringify(rfqData));
        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        const launchRfqDetailsApp = () =>
            window.launchPad.openApp({url: `http://localhost:3000/rfq-details?rfqData=${encodedRfqData}&editable=false&config=${encodedConfig}`,title: `RFQ Details Read-Only: ${rfqData.rfqId}`, modalFlag: true});

        launchRfqDetailsApp();
    }, [config]);

    const handleEditRfq = useCallback((rfqData) =>
    {
        const encodedRfqData = encodeURIComponent(JSON.stringify(rfqData));
        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        const launchRfqDetailsApp = () =>
            window.launchPad.openApp({url: `http://localhost:3000/rfq-details?rfqData=${encodedRfqData}&editable=true&config=${encodedConfig}`,title: `RFQ Details : ${rfqData.rfqId}`, modalFlag: true});

        launchRfqDetailsApp();
    }, [config]);

    const handleWorkflowRfq = useCallback((rfqData) =>
    {
        const encodedRfqData = encodeURIComponent(JSON.stringify(rfqData));
        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        const launchRfqDetailsApp = () =>
            window.launchPad.openApp({url: `http://localhost:3000/rfq-workflows?rfqData=${encodedRfqData}&config=${encodedConfig}`,title: `RFQ Workflows : ${rfqData.rfqId}`, modalFlag: true});

        launchRfqDetailsApp();
    }, [config]);

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
            case "workflow":
                handleWorkflowRfq(rfqData);
                break;
            default:
                loggerService.logError(`Unknown RFQ action: ${action}`);
        }
    }, [handleDeleteRfq, handleCloneRfq, handleEditRfq, handleSaveRfq, handleChartRfq, handleViewRfq, loggerService]);

    const recalculateRFQ = useCallback(async (rfqData) =>
    {
        try
        {
            const metrics = await calculateOptionMetrics(rfqData);
            if (!metrics)
                throw new Error("Failed to calculate option metrics");
            
            const derivedValues = calculateDerivedValues(metrics, rfqData);
            if (!derivedValues)
                throw new Error("Failed to calculate derived values");

            const premiumSettlementDate = optionRequestParserService.calculateSettlementDate(rfqData.maturityDate, rfqData.premiumSettlementDaysOverride);
            
            const updatedRFQ =
            {
                ...rfqData,
                notionalInUSD: metrics.notionalInUSD.toFixed(config.decimalPrecision),
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
            'salesCreditPercentage', 'premiumSettlementDaysOverride', 'spread', 'contracts', 'underlyingPrice'
        ];
        
        if (fieldsRequiringRecalculation.includes(colDef.field))
            recalculateRFQ(rfqData).then(() => loggerService.logInfo(`Field ${colDef.field} changed from ${oldValue} to ${newValue} for RFQ: ${rfqData.rfqId} this will trigger a recalculation.`));

    }, [recalculateRFQ, loggerService]);

    const handleSaveRequest = (isSave) =>
    {
        if (isSave)
            loggerService.logInfo('Saving RFQ:', selectedRFQ);
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
            {headerName: 'Actions', field: 'actions', sortable: false, width: 140, filter: false, hide: true, cellRenderer: RfqActionIconsRenderer },
             {headerName: "Arrival Time", field: "arrivalTime", sortable: true, minWidth: 130, width: 130, filter: true, editable: false},
             {headerName: "Request", field: "request", sortable: true, minWidth: 250, width: 250, filter: true, editable: false},
             {headerName: "Client", field: "client", sortable: true, minWidth: 200, width: 200, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: clientDropdownValues }, editable: true},
            {headerName: "Underlying Code", field: "underlying", sortable: true, minWidth: 160, width: 160, filter: true, editable: false},
            {headerName: "Strikes", cellDataType: 'text' , field: "strike", sortable: true, minWidth: 150, width: 150, filter: true, editable: false},
            {headerName: "Underlying Prices", field: "underlyingPrice", sortable: true, minWidth: 130, width: 130, filter: true, editable: true},
             {headerName: "Status", field: "status", sortable: true, minWidth: 120, width: 120, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: statusEnums.map(s => s.description) }, cellRenderer: StatusRenderer},
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
            {headerName: "Volatility%", field: "volatility", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Annualized volatility of the underlying asset',
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

            // Implied Volatility
            {headerName: "Ask Impl Vol%", field: "askImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the ask price of the option',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Fair Impl Vol%", field: "impliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the theoretical (model-driven) value of the option',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Bid Impl Vol%", field: "bidImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Volatility implied by the bid price of the option',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Premium Amounts
            {headerName: "Spread", field: "spread", sortable: false, minWidth: 100, width: 100, filter: true, editable: true, headerTooltip: 'Difference between the ask and bid premium amounts in local currency'},
            {headerName: "Fair Premium", field: "premiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theoretical price of the option based on the option model in local currency',
                editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Fair Premium$", field: "premiumInUSD", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theoretical price of the option based on the option model in USD',
                editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Ask Premium", field: "askPremiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Price at which sellers are willing to sell the option in local currency',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Bid Premium", field: "bidPremiumInLocal", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Price at which buyers are willing to buy the option in local currency',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Premium Percentages
            {headerName: "Ask Premium%", field: "askPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Ask premium as a percentage of the underlying price in local currency',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Fair Premium%", field: "premiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Fair premium as a percentage of the underlying price in local currency',
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Bid Premium%", field: "bidPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Bid premium as a percentage of the underlying price in local currency',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Greeks - Delta
            {headerName: "Option Delta", field: "delta", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option delta (rate of change of option price with respect to changes in the underlying price)',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Delta Shares", field: "deltaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option delta × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Delta Notional", field: "deltaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Delta shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Delta %", field: "deltaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option delta expressed a percentage of the underlying price.',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Greeks - Gamma
            {headerName: "Option Gamma", field: "gamma", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option gamma (rate of change of option delta with respect to changes in the underlying price)',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Gamma Shares", field: "gammaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option gamma × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Gamma Notional", field: "gammaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Gamma shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Gamma %", field: "gammaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option gamma expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Greeks - Theta
            {headerName: "Option Theta", field: "theta", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option theta (rate of change of option price with respect to time decay)',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Theta Shares", field: "thetaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option theta × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Theta Notional", field: "thetaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Theta shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Theta %", field: "thetaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option theta expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Greeks - Vega
            {headerName: "Option Vega", field: "vega", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option vega (rate of change of option price with respect to changes in volatility)',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Vega Shares", field: "vegaShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option vega × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Vega Notional", field: "vegaNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Vega shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Vega %", field: "vegaPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option vega expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},

            // Greeks - Rho
            {headerName: "Option Rho", field: "rho", sortable: true, minWidth: 115, width: 115, filter: true, headerTooltip: 'Option rho (rate of change of option price with respect to changes in interest rates)',
                editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Rho Shares", field: "rhoShares", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Option rho × number of contracts × contract multiplier',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Rho Notional", field: "rhoNotional", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Rho shares × underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Rho %", field: "rhoPercent", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Option rho expressed a percentage of the underlying price',
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter}
        ]);
    }, [clients, books, currencies, dayCountConventions, statusEnums, hedgeTypeEnums, getUniqueClientNames, getUniqueBookCodes]);

    const onGridReady = (params) =>
    {
        const sortModel = { colId: 'arrivalTime', sort: 'desc' }
            params.columnApi.applyColumnState({state: [sortModel], applyOrder: true});
    };

    const onRowSelected = (event) =>
    {
        if (event.node.isSelected())
            setSelectedRow(event.data);
        else
            setSelectedRow(null);
    };

    const onSelectionChanged = (event) =>
    {
        const selectedNodes = event.api.getSelectedNodes();
        if (selectedNodes.length > 0)
            setSelectedRow(selectedNodes[0].data);
        else
            setSelectedRow(null);
    };

    const handleTitleBarAction = useCallback((action) =>
    {
        if (!selectedRow)
            return;
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
            actionButtonsProps={{ selectedRow: selectedRow, onAction: handleTitleBarAction }} />

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
                    defaultColDef={{ resizable: true, sortable: true, filter: true, floatingFilter: false }} />
            </div>
            {errorMessage ? (<ErrorMessageComponent message={errorMessage} duration={3000} onDismiss={() => setErrorMessage(null)} position="bottom-right" maxWidth="900px"/>): null}
            <RfqsConfigPanel isOpen={isConfigOpen} config={config} onClose={closeConfig} onApply={applyConfig} />
            <RfqCreationDialog closeHandler={handleRfqCreation} instruments={instruments} />
        </div>
    </>)

}
