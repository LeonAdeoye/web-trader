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
        if(fx.rate === undefined)
        {
            console.log("Invalid FX rate received: ", fx);
            return;
        }
        else
            console.log("FX rate received: ", fx);

        window.fxRates.setRate(fx);

        fx.rate += new Date().getTime()/100000000000

        const calculatedRate =
        {
            currency: fx.currency,

            bid: parseFloat((0.95 * fx.rate).toFixed(4)) + 0.1,
            ask: parseFloat((1.05 * fx.rate).toFixed(4)) + 0.2,
            mid: parseFloat((fx.rate).toFixed(4) + 0.3)
        };

        setFxData((prevData) =>
        {
            const index = prevData.findIndex((element) => element.currency === calculatedRate.currency);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = calculatedRate;
                return updatedData;
            }
            else
                return [...prevData, calculatedRate];
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
                            gridData={fxData}/>);
};
