import {AgGridReact} from "ag-grid-react";
import React, {useCallback, useRef, useMemo} from "react";
import '../styles/css/main.css';
import {FDC3Service} from "../services/FDC3Service";
import {useRecoilState} from "recoil";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {currencyFormatter, getRowIdValue, numberFormatter} from "../utilities";
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
            width: 110,
            headerTooltip: "Trader's desk",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Order Id',
            field: 'orderId',
            width: 150,
            headerTooltip: "Order Id",
            sortable: true,
            hide: true,
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
            headerName: 'Instrument',
            field: 'instrumentCode',
            width: 100,
            sortable: true,
            filter: true,
            hide: true
        },
        {
            headerName: 'Qty',
            field: 'quantity',
            width: 90,
            headerTooltip: 'Quantity of the order',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Pending',
            field: 'pending',
            width: 90,
            headerTooltip: 'Pending un-executed quantity of the order',
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: '$Res. Notional',
            field: 'residualNotionalValueInUSD',
            valueFormatter: currencyFormatter,
            width: 110,
            cellDataType: 'number',
            headerTooltip: 'Residual notional value in USD',
            sortable: true,
            filter: true
        },
        {
            headerName: 'Instruction',
            field: 'instruction',
            width: 100,
            headerTooltip: "Client's instructions",
            sortable: true,
            filter: true,
            hide:true
        },
        {
            headerName: 'Price',
            field: 'price',
            width: 80,
            headerTooltip: "Order price in local currency",
            valueFormatter: numberFormatter,
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client',
            field: 'clientDescription',
            width: 130,
            headerTooltip: "The description of the client that instigated the order",
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Arr. Time',
            field: 'arrivalTime',
            width: 110,
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
    }, [windowId]);

    const getRowId = useMemo(() => (row) =>
    {
        return getRowIdValue(["orderId"], row.data);
    }, []);

    const onGridReady = (params) =>
    {
        params.columnApi.applyColumnState({
            state: [{ colId: 'quantity', sort: 'desc' }, { colId: 'arrivalTime', sort: 'desc' }],
            applyOrder: true,
        });
    };

    return(<div className="bottom-part">
            <div className="buy-orders">
                <div className="ag-theme-balham">
                    <AgGridReact
                        onGridReady={onGridReady}
                        columnDefs={columnDefs}
                        rowData={buyOrders}
                        getRowId={getRowId}
                        domLayout='autoHeight'
                        rowSelection={'single'}
                        onSelectionChanged={onBuySelectionChanged}
                        enableCellChangeFlash={true}
                        animateRows={true}
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
                        onGridReady={onGridReady}
                        columnDefs={columnDefs}
                        getRowId={getRowId}
                        rowData={sellOrders}
                        domLayout='autoHeight'
                        rowSelection={'single'}
                        onSelectionChanged={onSellSelectionChanged}
                        enableCellChangeFlash={true}
                        animateRows={true}
                        onCellClicked={onCellClicked}
                        ref={sellGridApiRef}
                        headerHeight={22}
                        rowHeight={22}
                    />
                </div>
            </div>
        </div>);
};
