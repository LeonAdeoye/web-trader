import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo} from "react";
import TitleBarComponent from "../components/TitleBarComponent";

export const FxRatesApp = () =>
{
    const [fxData, setFxData] = useState([]);
    const [worker, setWorker] = useState(null);
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("FX Rates"), []);

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

    const columnDefs = useMemo(() => ([
        {headerName: "Currency", field: "currency", sortable: true, minWidth: 130, width: 130},
        {headerName: "Bid", field: "bid", sortable: false, minWidth: 100, width: 100},
        {headerName: "Ask", field: "ask", sortable: false, minWidth: 100, width: 100},
        {headerName: "Mid", field: "mid", sortable: false, minWidth: 100, width: 100}]), []);

    return (<>
                <TitleBarComponent title="Fx Rates" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
                <div style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                        <GenericGridComponent rowHeight={25}
                                              gridTheme={"ag-theme-alpine"}
                                              rowIdArray={["currency"]}
                                              columnDefs={columnDefs}
                                              gridData={fxData}/>
                    </div>
                </div>
            </>);
};
