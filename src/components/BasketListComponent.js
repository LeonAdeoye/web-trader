import '../styles/css/main.css';
import {selectedBasketState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import React, {useEffect, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@mui/material/TextField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {DataService} from "../services/DataService";
import BasketListSummaryRenderer from "./BasketListSummaryRenderer";
import {numberFormatter} from "../utilities";

export const BasketListComponent = ({loggerService}) =>
{
    const [, setSelectedBasket] = useRecoilState(selectedBasketState);
    const [dataService] = useState(new DataService());
    const [gridApi, setGridApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [basketList, setBasketList] = useState([]);

    const columnDefs = useMemo(() => ([
        {
            headerName: 'Basket List',
            field: 'name',
            width: 300,
            headerTooltip: 'Name of basket',
            sortable: true,
            cellDataType: 'object',
            valueFormatter: numberFormatter,
            cellRenderer: BasketListSummaryRenderer
        },
        {
            headerName: 'Id',
            field: 'basketId',
            width: 0,
            hide: true,
        },
        {
            headerName: 'Client',
            field: 'client',
            width: 0,
            hide: true
        },
        {
            headerName: 'NumberOfConstituents',
            field: 'numberOfConstituents',
            width: 0,
            hide: true
        },
        {
            headerName: 'Order Notional',
            field: 'orderNotionalValue',
            width: 0,
            hide: true
        },
        {
            headerName: 'Exec. Notional',
            field: 'executedNotionalValue',
            width: 0,
            hide: true
        }
    ]), []);

    const onGridReady = (params) =>
    {
        setGridApi(params.api);
    };

    const onFilterChanged = () =>
    {
        gridApi.setQuickFilter(searchTerm);
    };

    const handleRowClick = (event) =>
    {
        loggerService.logInfo(`User clicked on basket: ${event.data.basketId}`);
        setSelectedBasket(event.data.basketId);
    };

    useEffect(() =>
    {
        setBasketList(dataService.getData(DataService.BASKETS));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <TextField
                size='small'
                label="Search by basket name or client."
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '30px', boxSizing: 'border-box', marginBottom: '3px', marginTop: '6px', marginRight: '6px'}}
            />
            <div style={{ height: '12px', width: '100%', backgroundColor: "white"}}></div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 45px)', width: 'calc(100%- 3px)'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    rowData={basketList}
                    onRowClicked={handleRowClick}
                    onFirstDataRendered={onFilterChanged}
                    enableCellChangeFlash={true}
                    rowSelection={'single'}
                    animateRows={true}
                    rowHeight={25}
                    headerHeight={25}
                />
            </div>
        </div>

    );

}

