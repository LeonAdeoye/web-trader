import {AgGridReact} from "ag-grid-react";
import React, {useCallback, useRef, useMemo} from "react";
import '../styles/css/main.css';
import {FDC3Service} from "../services/FDC3Service";
import {useRecoilState} from "recoil";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {currencyFormatter, numberFormatter} from "../utilities";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

export const CrossesDetailComponent = ({windowId, buyOrders, sellOrders}) =>
{
    const buyGridApiRef = useRef();
    const sellGridApiRef = useRef();
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const columnDefs = useMemo(() => ([
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
            headerName: 'Symbol',
            field: 'stockCode',
            width: 100,
            sortable: true,
            filter: true,
            hide: true
        },
        {
            headerName: 'Qty',
            field: 'quantity',
            width: 80,
            headerTooltip: 'Remaining quantity of the order',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Notional',
            field: 'notionalValue',
            valueFormatter: currencyFormatter,
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
            valueFormatter: numberFormatter,
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
    ]), []);

    const onBuySelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(buyGridApiRef);
    }, []);

    const onSellSelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(sellGridApiRef);
    }, []);

    const handleSelectionChanged = useCallback((gridApiRef) =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        if(selectedRows.length === 1)
            setSelectedGenericGridRow(selectedRows[0]);
    }, []);

    const onCellClicked = useCallback((params) =>
    {
        const {colDef, data} = params;

        if (colDef.field === 'stockCode')
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(data.stockCode, null), null, windowId);
        else if (colDef.field === 'client' && data.client !== "Client Masked")
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, data.client), null, windowId);
        else
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(data.stockCode, data.client), null, windowId);
    }, []);

    return(<div className="bottom-part">
            <div className="buy-orders">
                <div className="ag-theme-balham">
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={buyOrders}
                        domLayout='autoHeight'
                        rowSelection={'single'}
                        onSelectionChanged={onBuySelectionChanged}
                        onCellClicked={onCellClicked}
                        ref={buyGridApiRef}
                        headerHeight={22}
                        rowHeight={22}
                    />
                </div>
            </div>
            <div className="sell-orders">
                <div className="ag-theme-balham">
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={sellOrders}
                        rowSelection={'single'}
                        onSelectionChanged={onSellSelectionChanged}
                        onCellClicked={onCellClicked}
                        ref={sellGridApiRef}
                        domLayout='autoHeight'
                        headerHeight={22}
                        rowHeight={22}
                    />
                </div>
            </div>
        </div>);
};
