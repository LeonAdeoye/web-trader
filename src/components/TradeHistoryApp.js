import React, { useState, useMemo, useEffect} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TradeHistoryGridsComponent from "./TradeHistoryGridsComponent";
import {DataService} from "../services/DataService";
import {useRecoilState} from "recoil";
import {filterDaysState} from "../atoms/filter-state";
import {numberFormatter} from "../utilities";

const TradeHistoryApp = () =>
{
    const [dataService] = useState(new DataService());
    const [selectedTab, setSelectedTab] = useState("1");
    const [filterDays] = useRecoilState(filterDaysState);
    const [stockCode, setStockCode] = useState("0001.HK");
    const [client, setClient] = useState("Goldman Sachs");
    const [clientTradeHistory, setClientTradeHistory] = useState({client: "Goldman Sachs", buyTrades: [], sellTrades: []});
    const [stockTradeHistory, setStockTradeHistory] = useState({stock: "0001.HK", buyTrades: [], sellTrades: []});
    const [clientTradeHistoryTabLabel, setClientTradeHistoryTabLabel] = useState("Client Trade History");
    const [stockTradeHistoryTabLabel, setStockTradeHistoryTabLabel] = useState("Stock Trade History");

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("trade-history"), []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Context, _, __) =>
        {
            if(fdc3Context.type === "fdc3.context")
            {
                if(fdc3Context.instruments.length > 0 && fdc3Context.instruments[0].id.ticker)
                    setStockCode(fdc3Context.instruments[0].id.ticker);
                else
                    setStockCode(null);

                if(fdc3Context.clients.length > 0 && fdc3Context.clients[0].id.name)
                    setClient(fdc3Context.clients[0].id.name);
                else
                    setClient(null);
            }
        });
    }, []);

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
        setClientTradeHistory(dataService.getData(DataService.TRADE_HISTORY, null, client, filterDays));
        setStockTradeHistory(dataService.getData(DataService.TRADE_HISTORY, stockCode, null, filterDays));
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
            field: 'client', // Replace with your data field for stock symbol
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
            headerName: 'Symbol',
            field: 'stockCode', // Replace with your data field for stock symbol
            width: 85, // Adjust width as needed
            headerTooltip: 'Stock Symbol (RIC)',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Description',
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
        <div className="trade-history-app">
            <TabContext value={selectedTab}>
                <TabList className="trade-history-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)} aria-label="Trade History Tabs">
                    <Tab className="client-trade-history-tab" label={clientTradeHistoryTabLabel} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040',  color: "white"}}}/>
                    <Tab className="client-trade-history-tab" label={stockTradeHistoryTabLabel} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040', color: "white"}}}/>
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
    );
};

export default TradeHistoryApp;
