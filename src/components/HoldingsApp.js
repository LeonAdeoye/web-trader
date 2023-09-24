import React, {useState, useMemo, useEffect} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import {DataService} from "../services/DataService";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import SparklineRenderer from './SparklineRenderer';

const HoldingsApp = () =>
{
    const [dataService] = useState(new DataService());
    const [selectedTab, setSelectedTab] = useState("1");
    const [stockCode, setStockCode] = useState("0001.HK");
    const [client, setClient] = useState("Schroders");
    const [clientHoldings, setClientHoldings] = useState([]);
    const [stockHoldings, setStockHoldings] = useState([]);

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("holdings"), []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Context, _, __) =>
        {
            if(fdc3Context.type === "fdc3.context")
            {
                if(fdc3Context.instruments.length > 0 && fdc3Context.instruments[0].id.ticker)
                    setStockCode(fdc3Context.instruments[0].id.ticker);

                if(fdc3Context.clients.length > 0 && fdc3Context.clients[0].id.name)
                    setClient(fdc3Context.clients[0].id.name);
            }
        });
    }, []);

    useEffect(() =>
    {
        setClientHoldings(dataService.getData(DataService.HOLDINGS, null, client).holdings);
        setStockHoldings(dataService.getData(DataService.HOLDINGS, stockCode, null).holdings);

    }, [stockCode, client]);

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
                                              gridData={clientHoldings}/>
                    </TabPanel>)}

                {selectedTab === "2" && (
                    <TabPanel value="2" className="holdings-panel">
                        <GenericGridComponent rowHeight={25}
                                              gridTheme={"ag-theme-alpine"}
                                              rowIdArray={["client"]}
                                              columnDefs={stockColumnDefs}
                                              gridData={stockHoldings}/>
                    </TabPanel>)}
            </TabContext>
        </div>
    );
};

export default HoldingsApp;
