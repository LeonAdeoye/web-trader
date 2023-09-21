import React, { useState, useMemo} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import {MockDataService} from "../services/MockDataService";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import SparklineRenderer from './SparklineRenderer';

const HoldingsApp = () =>
{
    const [dataService] = useState(new MockDataService());
    const [selectedTab, setSelectedTab] = useState("1");
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("holdings"), []);

    const clientColumnDefs = useMemo(() => ( [
        {
            headerName: 'Score',
            field: 'score',
            width: 120,
            headerTooltip: 'Score',
            cellDataType: 'object',
            valueFormatter: numberFormatter, // Needed otherwise ag-grid warning.
            cellRenderer: SparklineRenderer
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
            headerName: 'Notional Value',
            field: 'notionalValue',
            width: 170,
            headerTooltip: 'Notional value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Quantity',
            field: 'quantity',
            width: 140,
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty Change',
            field: 'quantityChange',
            width: 140,
            headerTooltip: 'Change in quantity',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
            cellDataType: 'number',
        },
        {
            headerName: '% of Shares',
            field: 'sharesPercent',
            width: 135,
            headerTooltip: 'Percentage of Shares',
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
            width: 100,
            headerTooltip: 'score',
            valueFormatter: numberFormatter, // Needed otherwise ag-grid warning.
            cellRenderer:SparklineRenderer
        },
        {
            headerName: 'Client',
            field: 'client',
            width: 230,
            headerTooltip: 'Client',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Notional Value',
            field: 'notionalValue',
            width: 170,
            headerTooltip: 'Notional value in USD',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Quantity',
            field: 'quantity',
            width: 140,
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty Change',
            field: 'quantityChange',
            width: 140,
            headerTooltip: 'Quantity change',
            sortable: true,
            filter: true,
        },
        {
            headerName: '% of Shares',
            field: 'sharesPercent',
            width: 135,
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
        <div className="holdings-app" style={{height: '100%', width: '100%'}}>
            <TabContext value={selectedTab}>
                <TabList className="holdings-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                    <Tab className="holdings-tab" label="Client Holdings" value="1" sx={{ backgroundColor: "#bdbaba", '&.Mui-selected': {backgroundColor: '#404040',  color: "white"}, marginRight: "5px"}}/>
                    <Tab className="holdings-tab" label="Stock Holdings" value="2"  sx={{ backgroundColor: "#bdbaba", '&.Mui-selected': {backgroundColor: '#404040', color: "white"}}}/>
                </TabList>

                {selectedTab === "1" && (
                    <TabPanel value="1" className="holdings-panel">
                        <GenericGridComponent rowHeight={25}
                                              gridTheme={"ag-theme-alpine"}
                                              rowIdArray={["stockCode"]}
                                              columnDefs={clientColumnDefs}
                                              gridData={dataService.get("client_holdings").holdings}/>
                    </TabPanel>)}

                {selectedTab === "2" && (
                    <TabPanel value="2" className="holdings-panel">
                        <GenericGridComponent rowHeight={25}
                                              gridTheme={"ag-theme-alpine"}
                                              rowIdArray={["client"]}
                                              columnDefs={stockColumnDefs}
                                              gridData={dataService.get("stock_holdings").holdings}/>
                    </TabPanel>)}
            </TabContext>
        </div>
    );
};

export default HoldingsApp;
