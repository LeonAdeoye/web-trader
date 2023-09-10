import React, { useState, useMemo} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TradeHistoryGridsComponent from "./TradeHistoryGridsComponent";
import {MockDataService} from "../services/MockDataService";
import {useRecoilState} from "recoil";
import {filterDaysState} from "../atoms/filter-state";
import {numberFormatter} from "../utilities";

const TradeHistoryApp = () =>
{
    const [dataService] = useState(new MockDataService());
    const [selectedTab, setSelectedTab] = useState("1");
    const [filterDays] = useRecoilState(filterDaysState);

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
            headerName: 'RIC',
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
                    <Tab className="client-trade-history-tab" label="Client History" value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040',  color: "#1976D2"}}}/>
                    <Tab className="client-trade-history-tab" label="Stock History" value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040', color: "#1976D2"}}}/>
                </TabList>

                {selectedTab === "1" && (
                <TabPanel value="1" className="client-trade-history">
                    <TradeHistoryGridsComponent rows={dataService.get("client_trade_history", filterDays)} historyProperty="client" dataId="client_trade_history" columnDefs={clientColumnDefs}/>
                </TabPanel>)}

                {selectedTab === "2" && (
                <TabPanel value="2" className="client-trade-history">
                    <TradeHistoryGridsComponent rows={dataService.get("stock_trade_history", filterDays)} historyProperty="stockCode" dataId="stock_trade_history" columnDefs={stockColumnDefs}/>
                </TabPanel>)}
            </TabContext>
        </div>
    );
};

export default TradeHistoryApp;
