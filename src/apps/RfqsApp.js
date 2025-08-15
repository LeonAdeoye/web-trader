import * as React from 'react';
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {numberFormatter} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, selectedGenericGridRowState, titleBarContextShareColourState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import {LoggerService} from "../services/LoggerService";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {OrderService} from "../services/OrderService";
import {OptionRequestParserService} from "../services/OptionRequestParserService";
import SnippetTitleBarComponent from "../components/SnippetTitleBarComponent";
import {BankHolidayService} from "../services/BankHolidayService";
import {ClientService} from "../services/ClientService";
import {GenericGridComponent} from "../components/GenericGridComponent";

export const RfqsApp = () =>
{
    const [rfqs, setRfqs] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const [outboundWorker, setOutboundWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [clientCode, setClientCode] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const windowId = useMemo(() => window.command.getWindowId("Orders"), []);
    const loggerService = useRef(new LoggerService(RfqsApp.name)).current;
    const orderService = useRef(new OrderService()).current;
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const optionRequestParserService = useRef(new OptionRequestParserService()).current;
    const bankHolidayService = useRef(new BankHolidayService()).current;
    const clientService = useRef(new ClientService()).current;

    const [selectedRFQ, setSelectedRFQ] = useState({
        request: '',
        client: null,
        status: null,
        bookCode: null,
        notionalMillions: '',
        notionalCurrency: null,
        notionalFXRate: '',
        dayCountConvention: null,
        tradeDate: null,
        multiplier: '',
        contracts: '',
        quantity: '',
        lotSize: '',
        salesCreditPercentage: '',
        salesCreditAmount: '',
        salesCreditFXRate: '',
        salesCreditCurrency: null,
        premiumSettlementFXRate: '',
        premiumSettlementDaysOverride: '',
        premiumSettlementCurrency: null,
        premiumSettlementDate: null,
        hedgeType: null,
        hedgePrice: '',
        askImpliedVol: '',
        impliedVol: '',
        bidImpliedVol: '',
        askPremiumAmount: '',
        premiumAmount: '',
        bidPremiumAmount: '',
        askPremiumPercentage: '',
        premiumPercentage: '',
        bidPremiumPercentage: '',
        deltaShares: '',
        deltaNotional: '',
        delta: '',
        gammaShares: '',
        gammaNotional: '',
        gamma: '',
        thetaShares: '',
        thetaNotional: '',
        theta: '',
        vegaShares: '',
        vegaNotional: '',
        vega: '',
        rhoShares: '',
        rhoNotional: '',
        rho: '',
        legs: []
    });

    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [books, setBooks] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [dayCountConventions, setDayCountConventions] = useState([]);
    const [statusEnums, setStatusEnums] = useState([]);
    const [hedgeTypeEnums, setHedgeTypeEnums] = useState([]);

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

            // Load clients from service
            setClientsLoading(true);
            try
            {
                loggerService.logInfo("Loading clients from ClientService...");
                
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Client loading timeout')), 10000)
                );
                
                await Promise.race([
                    clientService.loadClients(),
                    timeoutPromise
                ]);
                
                const loadedClients = clientService.getClients();
                
                // Ensure we have valid client data with clientName property
                const validClients = loadedClients.filter(client => client && client.clientName);
                
                if (validClients.length === 0)
                {
                    loggerService.logWarning("No valid clients found in service response");
                    throw new Error("No valid clients found");
                }
                
                setClients(validClients);
                loggerService.logInfo(`Loaded ${validClients.length} valid clients from service: ${JSON.stringify(validClients.map(c => c.clientName))}`);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load clients: ${error.message}`);
                // Fallback to mock data if service fails
                const fallbackClients = [
                    { clientName: 'Client A', code: 'CLIENT_A' },
                    { clientName: 'Client B', code: 'CLIENT_B' },
                    { clientName: 'Client C', code: 'CLIENT_C' }
                ];
                setClients(fallbackClients);
                loggerService.logInfo("Using fallback mock client data");
            }
            finally
            {
                setClientsLoading(false);
            }

            setUsers([
                { userId: 'user1', name: 'User 1' },
                { userId: 'user2', name: 'User 2' },
                { userId: 'user3', name: 'User 3' }
            ]);
            
            setBooks([
                { bookCode: 'BOOK1', description: 'Book 1' },
                { bookCode: 'BOOK2', description: 'Book 2' },
                { bookCode: 'BOOK3', description: 'Book 3' }
            ]);
            
            setCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'CHF']);
            setDayCountConventions(['30/360', 'ACT/360', 'ACT/365', 'ACT/ACT']);
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
    }, [exchangeRateService, clientService, loggerService]);



    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/order-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/manage-order.js", import.meta.url));
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
        {
            handleSendChatMessage();
        }
    };

    const handleRFQFieldChange = (field, value) =>
    {
        setSelectedRFQ(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveRequest = (isSave) =>
    {
        if (isSave)
        {
            loggerService.logInfo('Saving RFQ:', selectedRFQ);
        }
        else
        {
            loggerService.logInfo('Cancelling RFQ changes');
        }
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
        const uniqueNames = [...new Set(clients.map(c => c.clientName))];
        return uniqueNames.sort(); // Sort alphabetically for better UX
    }, [clients]);

    const columnDefs = useMemo(() => 
    {
        const clientDropdownValues = clientsLoading ? [] : getUniqueClientNames();
        
        return ([
            // Basic RFQ Information
            {headerName: "Request", field: "request", sortable: true, minWidth: 250, width: 250, filter: true, editable: true},
                         {headerName: "Client", field: "client", sortable: true, minWidth: 200, width: 200, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: clientDropdownValues }, editable: true},
             {headerName: "Status", field: "status", sortable: true, minWidth: 120, width: 120, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: statusEnums.map(s => s.description) }},
             {headerName: "Book Code", field: "bookCode", sortable: true, minWidth: 100, width: 100, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: books.map(b => b.bookCode) }},
            
            // Notional and Currency
            {headerName: "Notional (m)", field: "notionalMillions", sortable: true, minWidth: 120, width: 120, filter: true, 
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Currency", field: "notionalCurrency", sortable: true, minWidth: 100, width: 100, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies }},
            {headerName: "FX Rate", field: "notionalFXRate", sortable: true, minWidth: 100, width: 100, filter: true, 
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            
            // Trading Details
             {headerName: "Day Count", field: "dayCountConvention", sortable: true, minWidth: 120, width: 120, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: dayCountConventions }},
             {headerName: "Trade Date", field: "tradeDate", sortable: true, minWidth: 120, width: 120, filter: true,
              editable: true, cellEditor: 'agDateInputCellEditor'},
            {headerName: "Multiplier", field: "multiplier", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Contracts", field: "contracts", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Quantity", field: "quantity", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Lot Size", field: "lotSize", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},

            // Sales Credit
            {headerName: "S.Credit %", field: "salesCreditPercentage", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "S.Credit Amount", field: "salesCreditAmount", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "S.Credit FX", field: "salesCreditFXRate", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "S.Credit Curr", field: "salesCreditCurrency", sortable: true, minWidth: 130, width: 130, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies }},

            // Settlement
            {headerName: "Stt.FX", field: "premiumSettlementFXRate", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Stt.Days", field: "premiumSettlementDaysOverride", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            {headerName: "Stt.Curr", field: "premiumSettlementCurrency", sortable: true, minWidth: 100, width: 100, filter: true,
              cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies }},
            {headerName: "Stt.Date", field: "premiumSettlementDate", sortable: true, minWidth: 120, width: 120, filter: true,
              editable: true, cellEditor: 'agDateInputCellEditor'},

            // Hedge
            {headerName: "Hedge Type", field: "hedgeType", sortable: true, minWidth: 120, width: 120, filter: true,
             cellEditor: 'agSelectCellEditor', cellEditorParams: { values: hedgeTypeEnums.map(h => h.description) }},
            {headerName: "Hedge Price", field: "hedgePrice", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: numberFormatter},
            //
            // Implied Volatility
            {headerName: "Ask Impl Vol%", field: "askImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Impl Vol%", field: "impliedVol", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Impl Vol%", field: "bidImpliedVol", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Premium Amounts
            {headerName: "Ask Premium$", field: "askPremiumAmount", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Premium$", field: "premiumAmount", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Premium$", field: "bidPremiumAmount", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Premium Percentages
            {headerName: "Ask Premium%", field: "askPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Fair Premium%", field: "premiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Bid Premium%", field: "bidPremiumPercentage", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Delta
            {headerName: "Delta Shares", field: "deltaShares", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Delta Notional", field: "deltaNotional", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Delta %", field: "delta", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Gamma
            {headerName: "Gamma Shares", field: "gammaShares", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Gamma Notional", field: "gammaNotional", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Gamma %", field: "gamma", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Theta
            {headerName: "Theta Shares", field: "thetaShares", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Theta Notional", field: "thetaNotional", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Theta %", field: "theta", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Vega
            {headerName: "Vega Shares", field: "vegaShares", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Vega Notional", field: "vegaNotional", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Vega %", field: "vega", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Greeks - Rho
            {headerName: "Rho Shares", field: "rhoShares", sortable: true, minWidth: 120, width: 120, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Rho Notional", field: "rhoNotional", sortable: true, minWidth: 130, width: 130, filter: true,
             editable: false, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},
            {headerName: "Rho %", field: "rho", sortable: true, minWidth: 100, width: 100, filter: true,
             editable: true, type: 'numericColumn', valueFormatter: (params) => numberFormatter(params.value, 4)},

            // Legs count
            {headerName: "Legs", field: "legs", sortable: true, minWidth: 80, width: 80, filter: true,
             editable: false, valueFormatter: (params) => params.value ? params.value.length : 0}
        ]);
    }, [clients, books, currencies, dayCountConventions, statusEnums, hedgeTypeEnums, clientsLoading, getUniqueClientNames]);

    const handleSnippetSubmit = useCallback((snippetInput) =>
    {
        try
        {
            const snippet = snippetInput.trim();
            if(!snippet || snippet.trim() === '')
            {
                return {success: false, error: "Snippet cannot be empty!\n\nExamples of valid formats:\n\n1. +1C 100 15AUG2025 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC2024 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1C,+1P 150 10JAN2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]"};
            }

            if(!optionRequestParserService.isValidOptionRequest(snippet))
            {
                loggerService.logError(`Invalid RFQ snippet format: ${snippet}`);
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1C 100 15AUG2025 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC2024 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1C,+1P 150 10JAN2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]" };
            }

            const parsedOptions = optionRequestParserService.parseRequest(snippet);
            loggerService.logInfo(`Parsed RFQ from snippet: ${JSON.stringify(parsedOptions)}`);
            
            if (!parsedOptions || parsedOptions.length === 0)
                return { success: false, error: "Invalid RFQ snippet format\n\nExamples of valid formats:\n\n1. +1C 100 15AUG2025 0700.HK\n   [Buy 1 call option, strike HK$100, expiry Aug 15 2025, underlying Tencent]\n\n\n2. -2P 50 20DEC2024 9988.HK\n   [Sell 2 put options, strike HK$50, expiry Dec 20 2024, underlying Alibaba]\n\n\n3. +1C,+1P 150 10JAN2026 7203.TK\n   [Buy 1 call + 1 put option, strike ¥150, expiry Jan 10 2026, underlying Toyota]" };

            const newRFQ = createRFQFromOptions(snippet.trim(), parsedOptions);
            setRfqs(prevOrders => [newRFQ, ...prevOrders]);
            loggerService.logInfo(`Successfully created RFQ from snippet: ${snippet}`);
            return { success: true };
        }
        catch (error)
        {
            loggerService.logError(`Failed to parse snippet: ${error.message}`);
            return { success: false, error: `Failed to parse snippet: ${error.message}` };
        }
    }, [optionRequestParserService, loggerService]);

    const createRFQFromOptions = useCallback((snippet, parsedOptions) =>
    {
        const now = new Date();
        const totalQuantity = parsedOptions.reduce((sum, option) => sum + option.quantity, 0);
        const firstOption = parsedOptions[0];
        
        return {
            rfqId: crypto.randomUUID(),
            request: snippet,
            client: clients.length > 0 ? clients[0].clientName : 'Default Client', // Use first available client or fallback
            status: 'Pending',
            bookCode: 'BOOK1',
            notionalMillions: totalQuantity / 1000000, // Convert to millions
            notionalCurrency: firstOption.currency || 'USD',
            notionalFXRate: 1.0,
            dayCountConvention: firstOption.dayCountConvention || 'ACT/365',
            tradeDate: now,
            multiplier: 100,
            contracts: totalQuantity,
            quantity: totalQuantity,
            lotSize: 100,
            salesCreditPercentage: 0.5,
            salesCreditAmount: 50000,
            salesCreditFXRate: 1.0,
            salesCreditCurrency: 'USD',
            premiumSettlementFXRate: 1.0,
            premiumSettlementDaysOverride: 2,
            premiumSettlementCurrency: 'USD',
            premiumSettlementDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            hedgeType: 'Full',
            hedgePrice: firstOption.strikePrice || 100.0,
            askImpliedVol: firstOption.volatility || 0.25,
            impliedVol: firstOption.volatility || 0.23,
            bidImpliedVol: firstOption.volatility || 0.21,
            askPremiumAmount: 2500000,
            premiumAmount: 2300000,
            bidPremiumAmount: 2100000,
            askPremiumPercentage: 0.025,
            premiumPercentage: 0.023,
            bidPremiumPercentage: 0.021,
            deltaShares: 50000,
            deltaNotional: 2500000,
            delta: 0.5,
            gammaShares: 1000,
            gammaNotional: 50000,
            gamma: 0.01,
            thetaShares: -5000,
            thetaNotional: -250000,
            theta: -0.05,
            vegaShares: 10000,
            vegaNotional: 500000,
            vega: 0.1,
            rhoShares: 2000,
            rhoNotional: 100000,
            rho: 0.02,
            legs: parsedOptions
        };
    }, [clients]);

    return (<>
        <SnippetTitleBarComponent 
            title="Request For Quote" 
            windowId={windowId} 
            addButtonProps={undefined} 
            showChannel={true}
            showTools={false} 
            snippetPrompt={"Enter RFQ snippet..."}
            onSnippetSubmit={handleSnippetSubmit}
        />

        <div style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
             <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                 <GenericGridComponent
                     rowHeight={22}
                     gridTheme={"ag-theme-alpine"}
                     rowIdArray={["rfqId"]}
                     columnDefs={columnDefs}
                     gridData={rfqs}
                     handleAction={null}
                     sortModel={{ colId: 'request', sort: 'asc' }}
                 />
             </div>
        </div>
    </>)

}
