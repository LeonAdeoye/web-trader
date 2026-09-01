import {useEffect, useMemo, useCallback, useState} from "react";
import {formatBreachTimestamp, getLimitBreachTypeColour, getSideColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {LimitsService} from "../services/LimitsService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";

const toBreachRow = (breach) =>
{
    return {
        ...breach,
        breachId: breach.breachId || [breach.orderId, breach.category, breach.limitScope, breach.breachType, breach.limitPercentage].join("|")
    };
};

const QuantityBreachesGridComponent = () =>
{
    const [breaches, setBreaches] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const limitsService = useMemo(() => new LimitsService(), []);
    const loggerService = useMemo(() => new LoggerService(QuantityBreachesGridComponent.name), []);

    useEffect(() =>
    {
        const loadSnapshot = async () =>
        {
            try
            {
                const snapshot = await limitsService.getBreaches("qty");
                if (Array.isArray(snapshot))
                    setBreaches(snapshot.map(toBreachRow));
            }
            catch (error)
            {
                loggerService.logError(`Failed to load quantity breaches: ${error.message}`);
            }
        };
        loadSnapshot();
    }, [limitsService, loggerService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/quantity-breach-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        if (inboundWorker)
            inboundWorker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (inboundWorker)
                inboundWorker.onmessage = null;
        };
    }, [inboundWorker]);

    const handleWorkerMessage = useCallback((event) =>
    {
        const breach = toBreachRow(event.data.order || {});
        if (!breach.breachId)
            return;
        setBreaches(prevData =>
        {
            const updatedData = [...prevData];
            const existingIndex = updatedData.findIndex(item => item.breachId === breach.breachId);
            if (existingIndex >= 0)
                updatedData[existingIndex] = breach;
            else
                updatedData.push(breach);
            return updatedData;
        });
    }, []);

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'Desk', field: 'deskName', filter: true, pinned: 'left'},
        { headerName: 'Trader', field: 'traderName', filter: true, pinned: 'left'},
        { headerName: 'Breach Type', field: 'breachType', filter: true, width: 180, cellStyle: params => getLimitBreachTypeColour(params)},
        { headerName: 'Order Id', field: 'orderId'},
        { headerName: 'Timestamp', field: 'tradeTimestamp', filter: true, width: 150, valueFormatter: formatBreachTimestamp},
        { headerName: 'Instrument', field: 'symbol', filter: true, width: 150},
        { headerName: 'Asset Type', field: 'assetType', filter: true, width: 120},
        { headerName: 'Exchange', field: 'exchangeAcronym', filter: true, width: 120},
        { headerName: 'Side', field: 'side', filter: true, width: 100, cellStyle: (params) => getSideColour(params)},
        { headerName: 'Quantity', field: 'quantity', valueFormatter: numberFormatter, width: 140},
        { headerName: 'Quantity Limit', field: 'quantityLimit', valueFormatter: numberFormatter, width: 150},
        { headerName: 'Price', field: 'price', width: 120}
    ]), []);

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["breachId"]} columnDefs={columnDefs} gridData={breaches} handleAction={null}/>);
}

export default QuantityBreachesGridComponent;
