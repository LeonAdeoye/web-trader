import React, { useEffect, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import '../styles/css/main.css';
import TradeHistoryFilterComponent from "./TradeHistoryFilterComponent";

const TradeHistoryGridsComponent = ({rows, dataId, columnDefs}) =>
{
    const gridDimensions = useMemo(() => ({ height: '100%'}), []);
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

    return (
        <div className="trade-history-app">
            <div className={dataId}>
                <div className="trade-history-row">
                    <div className="stock-info">
                        <div className="top-part">
                            <TradeHistoryFilterComponent buySkew={buySkew} sellSkew={sellSkew}/>
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
                                        columnDefs={columnDefs}
                                        rowData={rows.buyTrades}
                                        domLayout="autoHeight"
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
                                        columnDefs={columnDefs}
                                        rowData={rows.sellTrades}
                                        domLayout="autoHeight"
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
