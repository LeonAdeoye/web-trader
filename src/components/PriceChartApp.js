import * as React from 'react';
import {useState, useEffect} from "react";
import { AgChartsReact } from 'ag-charts-react';
import {time} from "ag-charts-community";

export const PriceChartApp = () =>
{
    const [worker, setWorker] = useState(null);
    const [options, setOptions] = useState({
        data: [],
        series: [
            {
                xKey: 'time_stamp',
                yKey: 'best_ask',
                yName: 'Intra-day Price',
            },
            {
                xKey: 'time_stamp',
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
        theme: {
            baseTheme:  'ag-default-dark',
            overrides: {
                cartesian: {
                    series: {
                        line: {
                            highlightStyle: {
                                series: {
                                    dimOpacity: 0.2,
                                    strokeWidth: 4,
                                },
                            },
                        },
                    },
                },
            },
        },
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
            worker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (worker)
                worker.onmessage = null;
        };
    }, [worker]);

    const handleWorkerMessage = (event) => updateData(event.data);

    const updateData = ({price}) =>
    {
        const { best_ask, best_bid, time_stamp, symbol} = price;

        if(symbol !== "XBT/USD")
            return

        if (options.data.length === 0 || options.data[options.data.length - 1].best_bid !== best_bid || options.data[options.data.length - 1].best_ask !== best_ask)
        {
            const newPrice = { time_stamp: time_stamp, symbol: symbol, best_bid: best_bid, best_ask: best_ask};

            setOptions(prevOptions =>
            {
                const optionsClone = { ...prevOptions };
                optionsClone.data.push(newPrice);
                return optionsClone;
            });
        }
    };

    return <AgChartsReact options={options} />;
};
