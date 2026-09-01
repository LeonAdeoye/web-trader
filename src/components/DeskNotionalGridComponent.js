import {useEffect, useMemo, useCallback, useState} from "react";
import {getPercentageColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {LimitsService} from "../services/LimitsService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";

const DeskNotionalGridComponent = () =>
{
    const [deskData, setDeskData] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const limitsService = useMemo(() => new LimitsService(), []);
    const loggerService = useMemo(() => new LoggerService(DeskNotionalGridComponent.name), []);

    useEffect(() =>
    {
        const loadSnapshot = async () =>
        {
            try
            {
                const snapshot = await limitsService.getDeskUtilizations();
                if (Array.isArray(snapshot))
                    setDeskData(snapshot);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load desk notional snapshot: ${error.message}`);
            }
        };
        loadSnapshot();
    }, [limitsService, loggerService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/desk-notional-reader.js", import.meta.url));
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
        const deskNotional = event.data.order;
        if (!deskNotional?.deskId)
            return;
        setDeskData(prevData =>
        {
            const updatedData = [...prevData];
            const existingIndex = updatedData.findIndex(item => item.deskId === deskNotional.deskId);
            if (existingIndex >= 0)
                updatedData[existingIndex] = deskNotional;
            else
                updatedData.push(deskNotional);
            return updatedData;
        });
    }, []);

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'DeskName', field: 'deskName', filter: true,width: 220},
        { headerName: 'Desk Id', field: 'deskId', hide: true},
        { headerName: 'Buy Notional Limit', field: 'buyNotionalLimit' , width: 150,  valueFormatter: numberFormatter},
        { headerName: 'Current Buy Notional', field: 'currentBuyNotional' , width: 150,  valueFormatter: numberFormatter},
        { headerName: 'Current Buy Utilization %', field: 'buyUtilizationPercentage', width: 170,  cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Sell Notional Limit', field: 'sellNotionalLimit' , width: 150,  valueFormatter: numberFormatter},
        { headerName: 'Current Sell Notional', field: 'currentSellNotional' , width: 150, valueFormatter: numberFormatter},
        { headerName: 'Current Sell Utilization %', field: 'sellUtilizationPercentage', width: 170, cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Gross Notional Limit', field: 'grossNotionalLimit' , valueFormatter: numberFormatter, width: 150},
        { headerName: 'Current Gross Notional', field: 'currentGrossNotional' , width: 150, valueFormatter: numberFormatter},
        { headerName: 'Current Gross Utilization %', field: 'grossUtilizationPercentage' , width: 170, cellStyle: (params) => getPercentageColour(params)},
    ]), []);

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["deskId"]} columnDefs={columnDefs} gridData={deskData} handleAction={null}/>);
}

export default DeskNotionalGridComponent;
