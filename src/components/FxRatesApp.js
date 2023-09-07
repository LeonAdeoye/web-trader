import * as React from 'react';
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState, useCallback} from "react";

export const FxRatesApp = () =>
{
    const [fxData, setFxData] = useState([]);
    const [worker, setWorker] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/fx-rate-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const fx = event.data.rate;
        const fx4dp = {currency: fx.currency, bid: fx.bid.toFixed(4), ask: fx.ask.toFixed(4), mid: fx.mid.toFixed(4)}

        setFxData((prevData) =>
        {
            const index = prevData.findIndex((element) => element.currency === fx4dp.currency);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = fx4dp;
                return updatedData;
            }
            else
                return [...prevData, fx4dp];
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

    const columnDefs = [
        {headerName: "Currency", field: "currency", sortable: true, minWidth: 130, width: 130},
        {headerName: "Bid", field: "bid", sortable: false, minWidth: 100, width: 100},
        {headerName: "Ask", field: "ask", sortable: false, minWidth: 100, width: 100},
        {headerName: "Mid", field: "mid", sortable: false, minWidth: 100, width: 100}];

    return (<GenericGridApp rowHeight={25}
                            gridTheme={"ag-theme-alpine"}
                            rowIdArray={["currency"]}
                            columnDefs={columnDefs}
                            gridData={fxData}/>);
};
