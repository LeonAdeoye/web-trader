import React from "react";
import '../styles/css/main.css';

export const CrossesSummaryComponent = ({stockCode, stockCurrency, stockDescription, maxCrossableQty, maxCrossableNotional}) =>
{
    return (<div className="top-part">
            <div className="stock-label buy-label">BUY</div>
            <div className="stock-code">{stockCode}</div>
            <div className="stock-currency">{stockCurrency}</div>
            <div className="stock-description">{stockDescription}</div>
            <div className="summary-info">
                <span>Max. Crossable Qty: {maxCrossableQty}</span>
                <span className="summary-gap"></span>
                <span>Max. Crossable Notional: {maxCrossableNotional} USD</span>
            </div>
            <div className="stock-label sell-label">SELL</div>
        </div>);
};
