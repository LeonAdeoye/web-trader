import React, { useState, useMemo} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import {MockDataService} from "../services/MockDataService";
import {numberFormatter} from "../utilities";
import HoldingsGridsComponent from "./HoldingsGridsComponent";

const HoldingsApp = () =>
{
    const [dataService] = useState(new MockDataService());
    const [selectedTab, setSelectedTab] = useState("1");

    const clientColumnDefs = useMemo(() => ( [
        {
            headerName: 'Score',
            field: 'score',
            width: 70,
            headerTooltip: 'Score'
        },
        {
            headerName: 'Symbol',
            field: 'stockCode',
            width: 100,
            headerTooltip: 'Stock symbol',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Description',
            field: 'stockDescription',
            width: 220,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Notional Val.',
            field: 'notionalValue',
            width: 130,
            headerTooltip: 'Notional value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty',
            field: 'Quantity',
            width: 85,
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty Chg.',
            field: 'quantityChange',
            width: 100,
            headerTooltip: 'Change in quantity',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
        {
            headerName: '% of Shares',
            field: 'SharesPercent',
            width: 120,
            headerTooltip: 'Percentage of Sahres',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Last Date',
            field: 'lastDate',
            width: 120,
            sortable: true,
            filter: true,
        },
    ]), []);
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
        <div className="holdings-app">
            <TabContext value={selectedTab}>
                <TabList className="holdings-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                    <Tab className="holdings-tab" label="Client Holdings" value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040',  color: "#1976D2"}}}/>
                    <Tab className="holdings-tab" label="Stock Holdings" value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040', color: "#1976D2"}}}/>
                </TabList>

                {selectedTab === "1" && (
                    <TabPanel value="1" className="client-holdings">
                        <HoldingsGridsComponent rows={dataService.get("client_holdings")} historyProperty="client" dataId="client_holdings" columnDefs={clientColumnDefs}/>
                    </TabPanel>)}

                {selectedTab === "2" && (
                    <TabPanel value="2" className="client-holdings">
                        <HoldingsGridsComponent rows={dataService.get("stock_holdings")} historyProperty="stockCode" dataId="stock_holdings" columnDefs={stockColumnDefs}/>
                    </TabPanel>)}
            </TabContext>
        </div>
    );
};

export default HoldingsApp;
