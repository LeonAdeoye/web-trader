import * as React from 'react';
import {useEffect, useMemo, useState, useRef, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {FDC3Service} from "../services/FDC3Service";

export const GridTickerApp = ({webWorkerUrl, columnDefs, rowHeight, gridTheme}) =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const getRowId = useMemo(() => (row) => row.data.symbol, []);

    useEffect(() =>
    {
        // TODO: More refactoring required here.
        //  Use webWorkerUrl props instead of hard-coded URL. If I use props I'm getting an Uncaught DOMException:
        //  Failed to construct 'Worker': Script at 'file:///C:/Users/Leon%20Adeoye/development/web-trader/src/components/price-ticker-reader.js' cannot be accessed from origin 'http://localhost:3000'.
        const webWorker = new Worker(new URL("../workers/price-ticker-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const onSelectionChanged = () =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        let symbol = selectedRows.length === 0 ? null : selectedRows[0].symbol;
        window.messenger.sendMessageToMain(FDC3Service.createChartContext(symbol, 5), "Crypto Chart", "Crypto Ticker");
    };

    const handleWorkerMessage = useCallback((event) =>
    {
        const { messageType, price: eventPrice } = event.data;
        setPrices(prevPrices =>
        {
            if (messageType === "update" && prevPrices.findIndex((price) => price.symbol === eventPrice.symbol) !== -1)
            {
                updateRows(eventPrice);
                return prevPrices; // No need to update prices state as updates are made to the grid directly. Updating the prices state will cause the grid to re-render.
            }
            return [...prevPrices, eventPrice]; // Update prices state only when a snapshot or new symbol update is received.
        });
    }, []);

    useEffect(() =>
    {
        if (worker)
            worker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (worker)
                worker.onmessage = null;
        };
    }, [worker]);

    const updateRows = useCallback((price) =>
    {
        gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data.symbol !== price.symbol)
                return;

            rowNode.updateData({...rowNode.data, ...price});
        });
    }, []);

    return (
        <div className={gridTheme} style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                rowSelection={'single'}
                onSelectionChanged={onSelectionChanged}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={rowHeight}
                headerHeight={rowHeight}
            />
        </div>
    );
};
