import * as React from 'react';
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState, useCallback} from "react";
import {FxService} from "../services/FxService";

export const FxRatesApp = () =>
{
    const [fxService] = useState(new FxService());
    const [gridData, setGridData] = useState([]);
    const [worker, setWorker] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/fx-rate-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const { rates: eventFxRates } = event.data;
        const calculatedRates = Object.entries(eventFxRates.rates).map(([currency, rate]) => ({
            currency,
            bid: parseFloat((0.95 * rate).toFixed(4)),
            ask: parseFloat((1.05 * rate).toFixed(4)),
            mid: parseFloat((rate).toFixed(4))
        }));
        console.log(JSON.stringify(calculatedRates));
        setGridData(calculatedRates);
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

    const updateRows = useCallback((fxRate) =>
    {
        /*gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data.symbol !== price.symbol)
                return;

            rowNode.updateData({...rowNode.data, ...fxRate});
        });*/

    }, []);

    const columnDefs = [
        {headerName: "Currency", field: "currency", sortable: true, minWidth: 130, width: 130},
        {headerName: "Bid", field: "bid", sortable: false, minWidth: 100, width: 100},
        {headerName: "Ask", field: "ask", sortable: false, minWidth: 100, width: 100},
        {headerName: "Mid", field: "mid", sortable: false, minWidth: 100, width: 100}];

    return (<GenericGridApp rowHeight={25}
                            gridTheme={"ag-theme-alpine"}
                            rowIdArray={["currency"]}
                            columnDefs={columnDefs}
                            gridData={gridData}/>);
};
