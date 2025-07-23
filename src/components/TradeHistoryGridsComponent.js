import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import '../styles/css/main.css';
import TradeHistoryFilterComponent from "./TradeHistoryFilterComponent";
import {FDC3Service} from "../services/FDC3Service";
import {useRecoilState} from "recoil";
import {selectedGenericGridRowState} from "../atoms/component-state";

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
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    useEffect(() =>
    {
        if(!rows)
            return;

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

    const onBuySelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(buyGridApiRef);
    }, []);

    const onSellSelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(sellGridApiRef);
    }, []);

    const handleSelectionChanged = useCallback((gridRef) =>
    {
        const selectedRows = gridRef.current.api.getSelectedRows();
        if(selectedRows.length === 1)
            setSelectedGenericGridRow(selectedRows[0]);
    }, []);

    const onCellClicked = useCallback((params) =>
    {
        const {colDef, data} = params;
        let clientCode = data.clientCode === "Client Masked" ? null : data.clientCode;
        let instrumentCode = data.instrumentCode;

        if (colDef.field === 'instrumentCode' && instrumentCode)
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(instrumentCode, null), null, windowId);
        else if (colDef.field === 'clientCode' && clientCode)
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, clientCode), null, windowId);
        else if(instrumentCode && clientCode)
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(instrumentCode, clientCode), null, windowId);
    }, []);

    return (
        <div className="trade-history-app">
            <div className={dataId}>
                <div className="trade-history-row">
                    <div className="stock-info">
                        <div className="top-part">
                            <TradeHistoryFilterComponent historyPropertyValue={`${rows ? rows[historyProperty] : ''} Trade History`} buySkew={buySkew} sellSkew={sellSkew}/>
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
                                        rowData={rows ? rows.buyTrades: []}
                                        domLayout="autoHeight"
                                        rowSelection={'single'}
                                        onSelectionChanged={onBuySelectionChanged}
                                        onCellClicked={onCellClicked}
                                        headerHeight={22}
                                        rowHeight={22}
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
                                        rowData={rows ? rows.sellTrades : []}
                                        domLayout="autoHeight"
                                        rowSelection={'single'}
                                        onSelectionChanged={onSellSelectionChanged}
                                        onCellClicked={onCellClicked}
                                        headerHeight={22}
                                        rowHeight={22}
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
