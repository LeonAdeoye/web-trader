import React from 'react';
import {numberFormatter} from "../utilities";
import {useEffect, useState, useMemo} from "react";
import '../styles/css/main.css';
import {selectedBasketState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {DataService} from "../services/DataService";
import {GenericGridComponent} from "./GenericGridComponent";

export const BasketOrdersComponent = ({loggerService}) =>
{
    const [selectedBasket] = useRecoilState(selectedBasketState);
    const [dataService] = useState(new DataService());
    const [orders, setOrders] = useState([]);

    const columnDefs = useMemo(() => ([
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "State", field: "orderState", sortable: true, minWidth: 105, width: 105, filter: true, headerTooltip: 'Current state of parent order',
            cellStyle: params => {
                const styleMapping = {
                    'FILLED': { backgroundColor: 'darkgreen', color: 'white' },
                    'PARTIAL FILL': { backgroundColor: 'lightgreen', color: 'white' },
                    'NEW ORDER': { backgroundColor: 'darkblue', color: 'white' },
                    'ACKED': { backgroundColor: 'lightblue', color: 'white' },
                };
                const value = params.value.trim();
                const style = styleMapping[value] || {};
                return style;
            }
        },
        {headerName: "RIC", field: "stockCode", sortable: true, minWidth: 85, width: 85, filter: true},
        {headerName: "Stock Desc.", field: "stockDescription", hide: false, sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Side", field: "side", sortable: true, minWidth: 80, width: 80, filter: true,
            cellStyle: params => {
                const side = params.value.toLowerCase();
                if (side === 'buy')
                    return { color: '#346bb4', fontWeight: 'bold' };
                else if (side === 'sell')
                    return { color: '#528c74', fontWeight: 'bold' };
                else if (side === 'short sell')
                    return { color: 'red', fontWeight: 'bold' };
                else
                    return {};
            }
        },
        {headerName: "Px", field: "price", sortable: false, minWidth: 80, width: 80, filter: true, headerTooltip: 'Original order price', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 80, width: 80, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "BLG", field: "blg", hide: true, sortable: true, minWidth: 80, width: 80, filter: true},
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 80, width: 80},
        {headerName: "Exec Algo", field: "executionAlgo", sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "ADV20", field: "adv20", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Exec Notional", field: "executedNotionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Residual Notional", field: "residualNotionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
    ]), []);

    useEffect(() =>
    {
        if(selectedBasket)
            setOrders(dataService.getData(DataService.BASKETS).filter(basket => basket.basketId === selectedBasket)[0].constituents);
    }, [selectedBasket]);

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={orders}/>
            </div>
        </div>
    );
}
