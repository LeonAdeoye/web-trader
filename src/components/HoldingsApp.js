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
            field: 'quantity',
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
            field: 'sharesPercent',
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
            headerName: 'Score',
            field: 'score',
            width: 85,
            headerTooltip: 'score'
        },
        {
            headerName: 'Client',
            field: 'client',
            width: 180,
            headerTooltip: 'Client',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Notional Val.',
            field: 'notionalValue',
            width: 140,
            headerTooltip: 'Notional value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty',
            field: 'quantity',
            width: 90,
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty Chg.',
            field: 'quantityChange',
            width: 100,
            headerTooltip: 'Quantity change',
            sortable: true,
            filter: true,
        },
        {
            headerName: '% of Shares',
            field: 'sharesPercent',
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
        }
    ]), []);

    return (
        <div className="holdings-app">
            <TabContext value={selectedTab}>
                <TabList className="holdings-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                    <Tab className="holdings-tab" label="Client Holdings" value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040',  color: "#1976D2"}}}/>
                    <Tab className="holdings-tab" label="Stock Holdings" value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#404040', color: "#1976D2"}}}/>
                </TabList>

                {selectedTab === "1" && (
                    <TabPanel value="1" className="holdings">
                        <HoldingsGridsComponent rows={dataService.get("client_holdings")} historyProperty="client" dataId="client_holdings" columnDefs={clientColumnDefs}/>
                    </TabPanel>)}

                {selectedTab === "2" && (
                    <TabPanel value="2" className="holdings">
                        <HoldingsGridsComponent rows={dataService.get("stock_holdings")} historyProperty="stockCode" dataId="stock_holdings" columnDefs={stockColumnDefs}/>
                    </TabPanel>)}
            </TabContext>
        </div>
    );
};

export default HoldingsApp;
