import * as React from 'react';
import {useState, useEffect} from "react";
import { AgChartsReact } from 'ag-charts-react';
import {time} from "ag-charts-community";
import {useRecoilState} from "recoil";
import {selectedCurrencyState} from "./currency-state";

export const PriceChartApp = () =>
{
    const [worker, setWorker] = useState(null);
    const [selectedCurrency] = useRecoilState(selectedCurrencyState);
    const [options, setOptions] = useState({
        data: [],
        series: [
            {
                xKey: 'time_stamp',
                yKey: 'best_ask',
                yName: 'Best Ask Intra-day Price',
                stroke: '#8bc24a',
                marker:
                {
                    shape: 'cross',
                    size: 10,
                    fill: '#8bc24a',
                    stroke: '#658d36'
                }
            },
            {
                xKey: 'time_stamp',
                yKey: 'best_bid',
                yName: 'Best bid Intra-day Price',
                marker:
                {
                    shape: 'square',
                    size: 10
                },
            },
        ],
        axes: [
            {
                type: 'time',
                position: 'bottom',
                nice: true,
                tick:
                {
                    interval: time.minute.every(10)
                },
                label:
                {
                    format: '%H:%M'
                }
            },
            {
                type: 'number',
                position: 'left',
                nice: true,
                label:
                {
                    format: '#{.2f}'
                }
            }],
        theme: {
            baseTheme:  'ag-default-dark',
            overrides:
            {
                cartesian:
                {
                    series:
                    {
                        line:
                        {
                            highlightStyle:
                            {
                                series:
                                {
                                    dimOpacity: 0.2,
                                    strokeWidth: 4,
                                },
                            },
                        },
                    },
                },
            },
        },
        legend:
        {
            enabled: true,
        },
    });

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("./price-chart-reader.js", import.meta.url));
        web_worker.postMessage({selectedCurrency});
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, [selectedCurrency]);

    useEffect(() =>
    {
        if (worker)
        {
            setOptions(prevOptions =>
            {
                const optionsClone = { ...prevOptions };
                optionsClone.data = [];
                return optionsClone;
            });
            worker.postMessage({selectedCurrency});
        }

    }, [selectedCurrency]);

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

    const handleWorkerMessage = (event) =>
    {
        const { best_ask, best_bid, time_stamp, symbol} = event.data.price;
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
