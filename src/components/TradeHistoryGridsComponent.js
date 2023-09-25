import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import '../styles/css/main.css';
import TradeHistoryFilterComponent from "./TradeHistoryFilterComponent";
import {FDC3Service} from "../services/FDC3Service";

const TradeHistoryGridsComponent = ({rows, historyProperty, dataId, columnDefs, windowId}) =>
{
    const gridDimensions = useMemo(() => ({ height: 'calc(100vh - 190px)'}), []);
    const buyGridApiRef = useRef();
    const sellGridApiRef = useRef();
    const [totalBuyQty, setTotalBuyQty] = useState(0);
    const [totalSellQty, setTotalSellQty] = useState(0);
    const [totalBuyNotional, setTotalBuyNotional] = useState(0);
    const [totalSellNotional, setTotalSellNotional] = useState(0);
    const [sellSkew, setSellSkew] = useState(0);
    const [buySkew, setBuySkew] = useState(0);

    useEffect(() =>
    {
        if(rows.buyTrades.length === 0)
        {
            setTotalBuyNotional(0);
            setSellSkew(0);
            setBuySkew(0);
        }
        else
        {
            setTotalBuyQty(rows.buyTrades.reduce((total, trade) => total + trade.currentQuantity, 0));
            setTotalBuyNotional(rows.buyTrades.reduce((total, trade) => total + trade.currentNotionalValue, 0));
        }

        if(rows.sellTrades.length === 0)
        {
            setTotalSellNotional(0);
            setSellSkew(0);
            setBuySkew(0);
        }
        else
        {
            setTotalSellQty(rows.sellTrades.reduce((total, trade) => total + trade.currentQuantity, 0));
            setTotalSellNotional(rows.sellTrades.reduce((total, trade) => total + trade.currentNotionalValue, 0));
        }
    }, [rows]);

    useEffect(() =>
    {
        if(totalSellNotional > totalBuyNotional && totalBuyNotional > 0 && totalSellNotional > 0)
            setSellSkew(totalSellNotional/totalBuyNotional);

        if(totalBuyNotional > totalSellNotional && totalSellNotional > 0 && totalBuyNotional > 0)
            setBuySkew(totalBuyNotional/totalSellNotional);

    }, [totalSellNotional, totalBuyNotional]);

    const onBuySelectionChanged = useCallback((params) =>
    {
        handleSelectionChanged(buyGridApiRef, params);
    }, []);

    const onSellSelectionChanged = useCallback((params) =>
    {
        handleSelectionChanged(sellGridApiRef, params);
    }, []);

    const handleSelectionChanged = useCallback((gridRef, params) =>
    {
        const selectedRows = gridRef.current.api.getSelectedRows();
        let stockCode = selectedRows.length === 0 ? null : selectedRows[0].stockCode;
        let client = selectedRows.length === 0 || selectedRows[0].client === "Client Masked" ? null : selectedRows[0].client;

        const { colDef } = params;

        if (colDef.field === 'stockCode' && stockCode)
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, null), null, windowId);
        else if (colDef.field === 'client' && client)
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, client), null, windowId);
        else
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, client), null, windowId);
    }, []);

    return (
        <div className="trade-history-app">
            <div className={dataId}>
                <div className="trade-history-row">
                    <div className="stock-info">
                        <div className="top-part">
                            <TradeHistoryFilterComponent historyPropertyValue={`Trade history of ${rows[historyProperty]}`} buySkew={buySkew} sellSkew={sellSkew}/>
                        </div>
                        <div className="bottom-part">
                            <div className="buy-orders">
                                <div className="summary-info">
                                    <span>BUY</span>
                                    <span>Total Qty: {totalBuyQty.toLocaleString()}</span>
                                    <span>Total Notional: {totalBuyNotional.toLocaleString()} USD</span>
                                </div>
                                <div className="ag-theme-balham" style={gridDimensions}>
                                    <AgGridReact
                                        ref={buyGridApiRef}
                                        columnDefs={columnDefs}
                                        rowData={rows.buyTrades}
                                        domLayout="autoHeight"
                                        rowSelection={'single'}
                                        onSelectionChanged={onBuySelectionChanged}
                                        headerHeight={25}
                                        rowHeight={20}
                                        height
                                    />
                                </div>
                            </div>
                            <div className="sell-orders">
                                <div className="summary-info">
                                    <span>SELL</span>
                                    <span>Total Qty: {totalSellQty.toLocaleString()}</span>
                                    <span>Total Notional: {totalSellNotional.toLocaleString()} USD</span>
                                </div>
                                <div className="ag-theme-balham" style={gridDimensions}>
                                    <AgGridReact
                                        ref={sellGridApiRef}
                                        columnDefs={columnDefs}
                                        rowData={rows.sellTrades}
                                        domLayout="autoHeight"
                                        rowSelection={'single'}
                                        onSelectionChanged={onSellSelectionChanged}
                                        headerHeight={25}
                                        rowHeight={20}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeHistoryGridsComponent;
