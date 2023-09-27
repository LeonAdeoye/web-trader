import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {numberFormatter} from "../utilities";
import {useEffect, useState, useMemo} from "react";
import '../styles/css/main.css';
import { selectedBasketState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {DataService} from "../services/DataService";

export const BasketOrdersComponent = ({loggerService}) =>
{
    const [selectedBasket, setSelectedBasket] = useRecoilState(selectedBasketState);
    const [dataService] = useState(new DataService());
    const [orders, setOrders] = useState([]);

    const columnDefs = [
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "State", field: "orderState", sortable: true, minWidth: 100, width: 120, filter: true, headerTooltip: 'Current state of parent order'},
        {headerName: "RIC", field: "stockCode", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Stock Desc.", field: "stockDescription", hide: false, sortable: true, minWidth: 180, width: 180, filter: true},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Side", field: "side", sortable: true, minWidth: 85, width: 85, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order price', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "BLG", field: "blg", hide: true, sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 100, width: 100},
        {headerName: "Exec Algo", field: "executionAlgo", sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "ADV20", field: "adv20", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Exec Notional", field: "executedNotionalValue", sortable: true, minWidth: 150, width: 150, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Residual Notional", field: "residualNotionalValue", sortable: true, minWidth: 150, width: 150, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
    ];

    const handleRowClick = (event) =>
    {
        loggerService.logInfo(`User clicked on basket: ${event.data.name}`);
        setSelectedBasket(event.data.name);
    };

    useEffect(() =>
    {
        if(selectedBasket)
            setOrders(dataService.getData(DataService.BASKETS).filter(basket => basket.basketId === selectedBasket)[0].constituents);
    }, [selectedBasket]);

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <AgGridReact columnDefs={columnDefs}
                             onRowClicked={handleRowClick}
                             enableCellChangeFlash={true}
                             rowSelection={'single'}
                             animateRows={true}
                             rowData={orders}
                             rowHeight={25}
                             headerHeight={25}/>
            </div>
        </div>
    );
}