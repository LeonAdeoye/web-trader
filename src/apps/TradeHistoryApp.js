import React, {useState, useMemo, useEffect, useRef, useCallback} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TradeHistoryGridsComponent from "../components/TradeHistoryGridsComponent";
import {useRecoilState} from "recoil";
import {filterDaysState} from "../atoms/filter-state";
import {titleBarContextShareColourState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import {getDateMinusDays, numberFormatter} from "../utilities";
import {tradeHistoryDialogDisplayState} from "../atoms/dialog-state";
import TradeHistorySearchDialog from "../dialogs/TradeHistorySearchDialog";

const TradeHistoryApp = () =>
{
    const [selectedTab, setSelectedTab] = useState("3");
    const [filterDays] = useRecoilState(filterDaysState);
    const [instrumentCode, setInstrumentCode] = useState("");
    const [clientCode, setClientCode] = useState("");
    const [clientTradeHistory, setClientTradeHistory] = useState({instrumentCode: instrumentCode, buyTrades: [], sellTrades: []});
    const [instrumentTradeHistory, setInstrumentTradeHistory] = useState({clientCode: clientCode, buyTrades: [], sellTrades: []});
    const [clientTradeHistoryTabLabel, setClientTradeHistoryTabLabel] = useState("Client Trade History");
    const [instrumentTradeHistoryTabLabel, setInstrumentTradeHistoryTabLabel] = useState("Instrument Trade History");
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const [, setTradeHistoryDialogOpenFlag] = useRecoilState(tradeHistoryDialogDisplayState);
    const loggerService = useRef(new LoggerService(TradeHistoryApp.name)).current;

    const windowId = useMemo(() => window.command.getWindowId("Trade History"), []);

    window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
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

    const handleDialogSearch = useCallback((selectedValues) =>
    {
        const { instrumentCode, clientCode, userId} = selectedValues;
        loggerService.logInfo(`Trade History Search Dialog - Search initiated with Instrument Code: ${instrumentCode||"none"}, Client Code: ${clientCode||"none"}, Trader ID: ${userId||"none"}`);

        if(instrumentCode && clientCode)
        {
            setInstrumentCode(instrumentCode);
            setClientCode(clientCode);
            setSelectedTab("1");
        }
        else if(clientCode)
        {
            setClientCode(clientCode);
            setSelectedTab("1");
        }
        else if(instrumentCode)
        {
            setInstrumentCode(instrumentCode);
            setSelectedTab("2");
        }

        console.log("Selected Trader ID:", userId);
    }, []);

    useEffect(() =>
    {
        if(instrumentCode)
            setInstrumentTradeHistoryTabLabel("Instrument Trade History (" + instrumentCode + ")");
        else
            setInstrumentTradeHistoryTabLabel("Instrument Trade History");

        if(clientCode)
            setClientTradeHistoryTabLabel("Client Trade History (" + clientCode + ")");
        else
            setClientTradeHistoryTabLabel("Client Trade History");

    }, [instrumentCode, clientCode])

    const fetchTradeHistory = useCallback(async (filterDays, clientCode, instrumentCode) =>
    {
        if(clientCode === "" && instrumentCode === "")
            return;

        try
        {
            const startDate = getDateMinusDays(filterDays);
            const endDate = new Date().toISOString().split('T')[0];
            const clientSuffix = clientCode !== "" ? `&clientCode=${clientCode}` : `&clientCode=`;
            const instrumentSuffix = instrumentCode !== "" ? `&instrumentCode=${instrumentCode}` : `&instrumentCode=`;
            const url = `http://localhost:20013/orders/history?startTradeDate=${startDate}&endTradeDate=${endDate}${clientSuffix}${instrumentSuffix}`;
            loggerService.logInfo(`Fetching trade history using URL: ${url}`);
            const response = await fetch(url);

            if (!response.ok)
                throw new Error("Network response was not ok");

            const data = await response.json();
            setInstrumentTradeHistory({instrumentCode: instrumentCode, buyTrades: data.filter(order => order.side === "BUY"), sellTrades: data.filter(order => order.side !== "BUY")});
            setClientTradeHistory({clientCode: clientCode, buyTrades: data.filter(order => order.side === "BUY"), sellTrades: data.filter(order => order.side !== "BUY")});
        }
        catch (error)
        {
            loggerService.logError("Failed to fetch trade history: " + error);
        }
    }, []);

    const instrumentColumnDefs = useMemo(() =>
        ([
        {
            headerName: 'Trade Date',
            field: 'tradeDate',
            width: 90,
            headerTooltip: 'Trade Date',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client',
            field: 'clientDescription',
            width: 150,
            headerTooltip: 'Client description',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Avg. Px',
            field: 'averagePrice',
            width: 80,
            headerTooltip: 'Average Price',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Trader',
            field: 'ownerId',
            width: 90,
            headerTooltip: 'Trader',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Quantity',
            field: 'quantity',
            width: 80,
            headerTooltip: 'Original Qty',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Executed',
            field: 'executed',
            width: 90,
            headerTooltip: 'Executed Quantity',
            sortable: true,
            filter: true,
        },
        {
            headerName: '$Ord. Notional',
            field: 'orderNotionalValueInUSD',
            width: 110,
            headerTooltip: 'Order Notional Value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        }]), []);

    const clientColumnDefs = useMemo(() =>
        ([
        {
            headerName: 'Trade Date',
            field: 'tradeDate',
            width: 90,
            headerTooltip: 'Trade Date',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Instrument',
            field: 'instrumentCode',
            width: 90,
            headerTooltip: 'Instrument Code (RIC)',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Avg. Px',
            field: 'averagePrice',
            width: 80,
            headerTooltip: 'Average Price',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Trader',
            field: 'ownerId',
            width:90,
            headerTooltip: 'Trader',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Quantity',
            field: 'quantity',
            width: 80,
            headerTooltip: 'Original Quantity',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Executed',
            field: 'executed',
            width: 90,
            headerTooltip: 'Executed Quantity',
            sortable: true,
            filter: true,
        },
        {
            headerName: '$Ord. Notional ',
            field: 'orderNotionalValueInUSD',
            width: 110,
            headerTooltip: 'Order Notional Value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        }]), []);


    useEffect(() =>
    {
        fetchTradeHistory(filterDays, clientCode, instrumentCode).then(() => loggerService.logInfo("Trade history fetched successfully"));
    }, [filterDays, instrumentCode, clientCode, loggerService]);

    return (
        <>
            <TitleBarComponent title="Trade History" windowId={windowId} addButtonProps={{ handler: () => setTradeHistoryDialogOpenFlag(true), tooltipText: "Search trade history..." }}  showChannel={true} showTools={false}/>
            <div className="trade-history-app" style={{width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="trade-history-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)} aria-label="Trade History Tabs">
                        {clientCode !== "" && (<Tab className="client-trade-history-tab" label={clientTradeHistoryTabLabel} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>)}
                        {instrumentCode !== "" && (<Tab className="client-trade-history-tab" label={instrumentTradeHistoryTabLabel} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>)}
                        {(instrumentCode === "" && clientCode === "") && (<Tab className="client-trade-history-tab" label={"No filters selected"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>)}
                    </TabList>

                    {selectedTab === "1" && (
                    <TabPanel value="1" className="client-trade-history">
                        <TradeHistoryGridsComponent rows={clientTradeHistory} historyProperty="clientCode" dataId="client_trade_history" columnDefs={clientColumnDefs} windowId={windowId}/>
                    </TabPanel>)}

                    {selectedTab === "2" && (
                    <TabPanel value="2" className="client-trade-history">
                        <TradeHistoryGridsComponent rows={instrumentTradeHistory} historyProperty="instrumentCode" dataId="instrument_trade_history" columnDefs={instrumentColumnDefs} windowId={windowId}/>
                    </TabPanel>)}

                    {selectedTab === "3" && (
                        <TabPanel value="3" className="client-trade-history">
                        </TabPanel>)}

                </TabContext>
            </div>
            <TradeHistorySearchDialog onSearch={handleDialogSearch}/>
        </>
    );
};

export default TradeHistoryApp;
