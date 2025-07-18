import React, { useState, useMemo, useEffect, useRef} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TradeHistoryGridsComponent from "../components/TradeHistoryGridsComponent";
import {TradeDataService} from "../services/TradeDataService";
import {useRecoilState} from "recoil";
import {filterDaysState} from "../atoms/filter-state";
import {numberFormatter} from "../utilities";
import {titleBarContextShareColourState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";

const TradeHistoryApp = () =>
{
    const [selectedTab, setSelectedTab] = useState("1");
    const [filterDays] = useRecoilState(filterDaysState);
    const [stockCode, setStockCode] = useState("0001.HK");
    const [client, setClient] = useState("Goldman Sachs");
    const [clientTradeHistory, setClientTradeHistory] = useState({client: "Goldman Sachs", buyTrades: [], sellTrades: []});
    const [stockTradeHistory, setStockTradeHistory] = useState({stock: "0001.HK", buyTrades: [], sellTrades: []});
    const [clientTradeHistoryTabLabel, setClientTradeHistoryTabLabel] = useState("Client Trade History");
    const [stockTradeHistoryTabLabel, setStockTradeHistoryTabLabel] = useState("Stock Trade History");
    const tradeDataService = useRef(new TradeDataService()).current;
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const windowId = useMemo(() => window.command.getWindowId("Trade History"), []);

    window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
    {
        if(fdc3Message.type === "fdc3.context")
        {
            if(fdc3Message.contextShareColour)
                setTitleBarContextShareColour(fdc3Message.contextShareColour);

            if(fdc3Message.instruments?.[0]?.id.ticker)
                setStockCode(fdc3Message.instruments[0].id.ticker);
           else
                setStockCode(null);

            if(fdc3Message.clients?.[0]?.id.name)
                setClient(fdc3Message.clients[0].id.name);
            else
                setClient(null);
        }
    });

    useEffect(() =>
    {
        if(stockCode)
            setStockTradeHistoryTabLabel("Stock Trade History (" + stockCode + ")");
        else
            setStockTradeHistoryTabLabel("Stock Trade History");

        if(client)
            setClientTradeHistoryTabLabel("Client Trade History (" + client + ")");
        else
            setClientTradeHistoryTabLabel("Client Trade History");

    }, [stockCode, client])

    useEffect(() =>
    {
        setStockTradeHistory(tradeDataService.getData(TradeDataService.TRADE_HISTORY, stockCode, null, filterDays));
        setClientTradeHistory(tradeDataService.getData(TradeDataService.TRADE_HISTORY, null, client, filterDays));
    }, [stockCode, client, filterDays]);

    const stockColumnDefs = useMemo(() => ( [
        {
            headerName: 'Trd. Date',
            field: 'date', // Replace with your data field for date
            width: 85, // Adjust width as needed
            headerTooltip: 'Trade Date',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client',
            field: 'client', // Replace with your data field for stock code
            width: 150, // Adjust width as needed
            headerTooltip: 'Client name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Avg. Px',
            field: 'averagePrice', // Replace with your data field for average price
            width: 85, // Adjust width as needed
            headerTooltip: 'Average Price',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Desk',
            field: 'desk', // Replace with your data field for trading desk
            width: 120, // Adjust width as needed
            headerTooltip: 'Trading Desk',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Org. Qty',
            field: 'originalQuantity', // Replace with your data field for original quantity
            width: 85, // Adjust width as needed
            headerTooltip: 'Org. Qty',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Org. Notional',
            field: 'originalNotionalValue', // Replace with your data field for original notional value
            width: 110, // Adjust width as needed
            headerTooltip: 'Org. Notional Value',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
        {
            headerName: 'Curr. Qty',
            field: 'currentQuantity', // Replace with your data field for current quantity
            width: 85, // Adjust width as needed
            headerTooltip: 'Curr. Qty',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Curr. Notional',
            field: 'currentNotionalValue', // Replace with your data field for current notional value
            width: 110, // Adjust width as needed
            headerTooltip: 'Curr. Notional Value',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
    ]), []);
    const clientColumnDefs = useMemo(() => ( [
        {
            headerName: 'Trd. Date',
            field: 'date', // Replace with your data field for date
            width: 85, // Adjust width as needed
            headerTooltip: 'Trade Date',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Stock Code',
            field: 'stockCode', // Replace with your data field for stock code
            width: 95, // Adjust width as needed
            headerTooltip: 'Stock Code (RIC)',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Stock Description',
            field: 'stockDescription', // Replace with your data field for stock description
            width: 140, // Adjust width as needed
            headerTooltip: 'Stock Description',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Avg. Px',
            field: 'averagePrice', // Replace with your data field for average price
            width: 85, // Adjust width as needed
            headerTooltip: 'Average Price',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Desk',
            field: 'desk', // Replace with your data field for trading desk
            width: 100, // Adjust width as needed
            headerTooltip: 'Trading Desk',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Org. Qty',
            field: 'originalQuantity', // Replace with your data field for original quantity
            width: 90, // Adjust width as needed
            headerTooltip: 'Org. Qty',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Org. Notional',
            field: 'originalNotionalValue', // Replace with your data field for original notional value
            width: 110, // Adjust width as needed
            headerTooltip: 'Org. Notional Value',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
        {
            headerName: 'Curr. Qty',
            field: 'currentQuantity', // Replace with your data field for current quantity
            width: 85, // Adjust width as needed
            headerTooltip: 'Curr. Qty',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Curr. Notional',
            field: 'currentNotionalValue', // Replace with your data field for current notional value
            width: 110, // Adjust width as needed
            headerTooltip: 'Curr. Notional Value',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
    ]), []);

    return (
        <>
            <TitleBarComponent title="Trade History" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div className="trade-history-app" style={{width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="trade-history-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)} aria-label="Trade History Tabs">
                        <Tab className="client-trade-history-tab" label={clientTradeHistoryTabLabel} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                        <Tab className="client-trade-history-tab" label={stockTradeHistoryTabLabel} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    </TabList>

                    {selectedTab === "1" && (
                    <TabPanel value="1" className="client-trade-history">
                        <TradeHistoryGridsComponent rows={clientTradeHistory} historyProperty="client"
                                                    dataId="client_trade_history" columnDefs={clientColumnDefs}
                                                    windowId={windowId}/>
                    </TabPanel>)}

                    {selectedTab === "2" && (
                    <TabPanel value="2" className="client-trade-history">
                        <TradeHistoryGridsComponent rows={stockTradeHistory} historyProperty="stockCode"
                                                    dataId="stock_trade_history" columnDefs={stockColumnDefs}
                                                    windowId={windowId}/>
                    </TabPanel>)}
                </TabContext>
            </div>
        </>
    );
};

export default TradeHistoryApp;
