import * as React from 'react';
import {useState, useEffect, useMemo, useRef} from "react";
import { AgChartsReact } from 'ag-charts-react';
import {time} from "ag-charts-community";
import {CacheService} from "../services/CacheService";

export const PriceChartApp = ({webWorkerUrl, interval, chartTheme}) =>
{
    const [worker, setWorker] = useState(null);
    const [symbol, setSymbol] = useState(null);
    const [newlySelectedSymbol, setNewlySelectedSymbol] = useState(null);
    const [connectionId, setConnectionId] = useState(null);
    const cacheService = useRef(new CacheService()).current;
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("Price Chart"), []);
    const [options, setOptions] = useState({
        data: [],
        series: [
            {
                xKey: 'time_stamp',
                yKey: 'best_ask',
                yName: 'Best Ask',
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
                yName: 'Best Bid',
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
                    interval: time.minute.every(interval)
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
            baseTheme:  chartTheme,
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
        height: 800,
        legend:
        {
            enabled: true,
        },
    });

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("../workers/price-chart-reader.js", import.meta.url));
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, []);

    window.messenger.handleMessageFromMain((fdc3Message, destination, _) =>
    {
        let newSymbol = fdc3Message.instruments?.[0]?.id.ticker;
        setNewlySelectedSymbol(newSymbol);
    });

    useEffect(() =>
    {
        if(symbol !== null && symbol !== newlySelectedSymbol)
            cacheService.put(symbol, options.data);

        setSymbol(newlySelectedSymbol);

    }, [newlySelectedSymbol]);

    useEffect(() =>
    {
        if (worker)
        {
            setOptions(prevOptions =>
            {
                const optionsClone = { ...prevOptions };
                optionsClone.data = cacheService.hasSymbol(symbol) ? cacheService.get(symbol) : [];
                optionsClone.title = {text: `Intra-day price chart for ${symbol}`};
                return optionsClone;
            });
            worker.postMessage({symbol: symbol, currentConnectionId: connectionId});
        }
    }, [symbol]);

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
        if(event.data.messageType === 'connectionId')
        {
            setConnectionId(event.data.currentConnectionId);
            return;
        }

        const { best_ask, best_bid, time_stamp, symbol} = event.data.price;
        setOptions(prevOptions =>
        {
            if (prevOptions.data.length === 0 || prevOptions.data[prevOptions.data.length - 1].best_bid !== best_bid || prevOptions.data[prevOptions.data.length - 1].best_ask !== best_ask)
            {
                const optionsClone = { ...prevOptions };
                optionsClone.data.push({ time_stamp: time_stamp, symbol: symbol, best_bid: best_bid, best_ask: best_ask});
                return optionsClone;
            }
            return prevOptions;
        });
    };

    return <AgChartsReact options={options} />;
};
