import React, {useState, useMemo, useEffect, useRef} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import {TradeDataService} from "../services/TradeDataService";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "../components/GenericGridComponent";
import SparklineRenderer from '../components/SparklineRenderer';
import {useRecoilState} from "recoil";
import {selectedContextShareState, titleBarContextShareColourState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";

const HoldingsApp = () =>
{
    const tradeDataService = useRef(new TradeDataService()).current;
    const [selectedTab, setSelectedTab] = useState("1");
    const [stockCode, setStockCode] = useState("0001.HK");
    const [client, setClient] = useState("Schroders");
    const [clientHoldings, setClientHoldings] = useState([]);
    const [stockHoldings, setStockHoldings] = useState([]);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [clientHoldingsTabLabel, setClientHoldingsTabLabel] = useState("Client Holdings");
    const [stockHoldingsTabLabel, setStockHoldingsTabLabel] = useState("Stock Holdings");
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const windowId = useMemo(() => window.command.getWindowId("Holdings"), []);

    useEffect(() =>
    {
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
    }, []);

    useEffect(() =>
    {
        if(selectedContextShare.length === 1)
        {
            if(selectedContextShare[0].contextShareKey === 'stockCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length === 2)
        {
            const stockCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'stockCode').contextShareValue;
            const client = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'client').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, client), null, windowId);
        }
    }, [selectedContextShare]);

    useEffect(() =>
    {
        setStockHoldings(tradeDataService.getData(TradeDataService.HOLDINGS, stockCode, null).holdings);
        setClientHoldings(tradeDataService.getData(TradeDataService.HOLDINGS, null, client).holdings);
    }, [stockCode, client])

    useEffect(() =>
    {
        if(stockCode)
            setStockHoldingsTabLabel("Stock Holdings (" + stockCode + ")");
        else
            setStockHoldingsTabLabel("Stock Holdings");

        if(client)
            setClientHoldingsTabLabel("Client Holdings (" + client + ")")
        else
            setClientHoldingsTabLabel("Client Holdings");

    }, [stockCode, client])

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
            headerName: 'StockCode',
            field: 'stockCode',
            width: 100,
            headerTooltip: 'Stock code',
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
        }
    ]), []);

    return (
        <>
            <TitleBarComponent title="Holdings" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
            <div className="holdings-app" style={{width: '100%', height: 'calc(100vh - 10px)', float: 'left', padding: '0px', margin:'50px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>

                    <TabList className="holdings-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                        <Tab className="holdings-tab" label={`${clientHoldingsTabLabel}`}  value="1" sx={{ backgroundColor: "#bdbaba", '&.Mui-selected': {backgroundColor: '#7a7a7a',  color: "white"}, marginRight: "5px"}}/>
                        <Tab className="holdings-tab" label={`${stockHoldingsTabLabel}`}  value="2"  sx={{ backgroundColor: "#bdbaba", '&.Mui-selected': {backgroundColor: '#7a7a7a', color: "white"}}}/>
                    </TabList>

                    {selectedTab === "1" && (
                        <TabPanel value="1" className="holdings-panel">
                            <GenericGridComponent rowHeight={22}
                                                  gridTheme={"ag-theme-alpine"}
                                                  rowIdArray={["stockCode"]}
                                                  columnDefs={clientColumnDefs}
                                                  gridData={clientHoldings}
                                                  windowId={windowId}/>
                        </TabPanel>)}

                    {selectedTab === "2" && (
                        <TabPanel value="2" className="holdings-panel">
                            <GenericGridComponent rowHeight={22}
                                                  gridTheme={"ag-theme-alpine"}
                                                  rowIdArray={["client"]}
                                                  columnDefs={stockColumnDefs}
                                                  gridData={stockHoldings}
                                                  windowId={windowId}/>
                        </TabPanel>)}
                </TabContext>
            </div>
        </>);
};

export default HoldingsApp;
