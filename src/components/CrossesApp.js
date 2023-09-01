import React, {useState} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import '../styles/css/main.css';
import { AgGridReact } from 'ag-grid-react';
import {DummyDataService} from "../services/DummyDataService";
import {FxService} from "../services/FxService";

const CrossesApp = () =>
{
    const [dummyDataService] = useState(new DummyDataService());
    const [fxService] = useState(new FxService());
    const columnDefs = [
        {
            headerName: 'Desk',
            field: 'desk',
            width: 100,
            headerTooltip: "Trader's desk",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Trader',
            field: 'trader',
            width: 100,
            headerTooltip: "Trader's name",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Qty',
            field: 'quantity',
            width: 80,
            headerTooltip: 'Remaining quantity of the order',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Notional',
            field: 'notionalValue',
            width: 100,
            cellDataType: 'number',
            headerTooltip: 'Notional value in USD',
            sortable: true,
            filter: true

        },
        {
            headerName: 'Instr',
            field: 'instruction',
            width: 80,
            headerTooltip: "Client's instructions",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Px',
            field: 'price',
            width: 80,
            headerTooltip: "Order price in local currency",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client',
            field: 'client',
            width: 100,
            headerTooltip: "The client of the order",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Time',
            field: 'time',
            width: 100,
            sortable: true,
            filter: true,
        },
    ];

    fxService.loadExchangeRates(); // TODO use them to convert notional values

    const stockRows = dummyDataService.get("crossing_data").map((stock) =>
    {
        return (
            <div key={stock.stockCode} className="opportunity-row">
                <div className="stock-info">
                    <div className="top-part">
                        <div className="stock-label buy-label">BUY</div>
                        <div className="stock-code">{stock.stockCode}</div>
                        <div className="stock-description">{stock.stockDescription}</div>
                        <div className="summary-info">
                            <span>Total Notional: {stock.totalNotional.toLocaleString()} USD</span>
                            <span className="summary-gap">|</span>
                            <span>Total Quantity: {stock.totalQuantity.toLocaleString()}</span>
                        </div>
                        <div className="stock-label sell-label">SELL</div>
                    </div>
                    <div className="bottom-part">
                        <div className="buy-orders">
                            <div className="ag-theme-balham">
                                <AgGridReact
                                    columnDefs={columnDefs}
                                    rowData={stock.buyOrders}
                                    domLayout='autoHeight'
                                    headerHeight={20}
                                    rowHeight={20}
                                />
                            </div>
                        </div>
                        <div className="sell-orders">
                            <div className="ag-theme-balham">
                                <AgGridReact
                                    columnDefs={columnDefs}
                                    rowData={stock.sellOrders}
                                    domLayout='autoHeight'
                                    headerHeight={20}
                                    rowHeight={20}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="crosses-app">
            {stockRows}
        </div>
    );

};

export default CrossesApp;
