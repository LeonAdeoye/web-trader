import * as React from 'react';
import {useState, useEffect, useCallback} from "react";
import { AgChartsReact } from 'ag-charts-react';
import {time} from "ag-charts-community";

export const PriceChartApp = () =>
{
    const [worker, setWorker] = useState(null);
    const [options, setOptions] = useState({
        data: [],
        series: [
            {
                xKey: 'time',
                yKey: 'best_ask',
                yName: 'Intra-day Price',
            },
            {
                xKey: 'time',
                yKey: 'best_bid',
                yName: 'Intra-day Price',
            },
        ],
        axes: [
            {
                type: 'time',
                position: 'bottom',
                nice: true,
                tick: {
                    interval: time.hour
                },
                label: {
                    format: '%H:%M'
                }
            },
            {
                type: 'number',
                position: 'left',
                nice: true,
                label: {
                    format: '#{.2f}'
                }
            }],
        height: 700,
        width: 1000,
        theme: { baseTheme:  'ag-default-dark'},
        legend: {
            enabled: false,
        },
    });

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("./price-chart-reader.js", import.meta.url));
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, []);

    useEffect(() =>
    {
        if (worker)
        {
            worker.onmessage = handleWorkerMessage;
        }

        return () =>
        {
            if (worker)
                worker.onmessage = null;
        };
    }, [worker]);

    const handleWorkerMessage = (event) => updateData(event.data);

    const updateData = useCallback(({price}) =>
    {
        const { best_ask, best_bid, time, symbol} = price;
        if ((best_ask || best_bid) && symbol === "XBT/USD")
        {
            const optionsClone = {...options};
            const newPrice = { time: time, symbol: symbol };
            if(best_ask) newPrice["best_ask"] = best_ask;
            if(best_bid) newPrice["best_bid"] = best_bid ;
            optionsClone.data.push(newPrice);
            console.log("New price: " + JSON.stringify(optionsClone.data))
            setOptions(optionsClone);
        }
    }, [options]);

    return <AgChartsReact options={options} />;
};
