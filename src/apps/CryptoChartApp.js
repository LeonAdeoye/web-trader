import * as React from 'react';
import {useState, useEffect, useMemo, useRef, useCallback} from "react";
import { AgChartsReact } from 'ag-charts-react';
import {time} from "ag-charts-community";
import {ServiceRegistry} from "../services/ServiceRegistry";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";
import ErrorMessageComponent from "../components/ErrorMessageComponent";

export const CryptoChartApp = () =>
{
    const [worker, setWorker] = useState(null);
    const [cryptoData, setCryptoData] = useState(new Map());
    const [subscribedInstruments, setSubscribedInstruments] = useState(new Set());
    const [errorMessage, setErrorMessage] = useState(null);
    const [interval, setInterval] = useState(30);
    const configurationService = useRef(ServiceRegistry.getConfigurationService()).current;
    const marketDataService = useRef(ServiceRegistry.getMarketDataService()).current;
    const loggerService = useRef(new LoggerService(CryptoChartApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Crypto Chart"), []);
    const [options, setOptions] = useState({
        data: [],
        series: [],
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
            baseTheme: 'ag-default',
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
        height: 448,
        legend:
        {
            enabled: true,
        },
    });

    const hslToRgb = (h, s, l) =>
    {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 1/6)
        {
            r = c; g = x; b = 0;
        }
        else if (1/6 <= h && h < 2/6)
        {
            r = x; g = c; b = 0;
        }
        else if (2/6 <= h && h < 3/6)
        {
            r = 0; g = c; b = x;
        }
        else if (3/6 <= h && h < 4/6)
        {
            r = 0; g = x; b = c;
        }
        else if (4/6 <= h && h < 5/6)
        {
            r = x; g = 0; b = c;
        }
        else if (5/6 <= h && h < 1)
        {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `rgb(${r}, ${g}, ${b})`;
    };

    const generateRandomColors = (count) =>
    {
        const colors = [];
        for (let i = 0; i < count; i++)
        {
            const hue = (i * 137.508) % 360;
            const saturation = 70 + (i % 3) * 10;
            const lightness = 45 + (i % 4) * 5;
            colors.push(hslToRgb(hue, saturation, lightness));
        }
        return colors;
    };

    useEffect(() =>
    {
        const loadCryptoInstruments = async () =>
        {
            try
            {
                const instruments = await configurationService.getCryptoInstruments();
                if (instruments && instruments.length > 0)
                {
                    await marketDataService.subscribeToCrypto(instruments);
                    setSubscribedInstruments(new Set(instruments));
                    loggerService.logInfo(`Crypto chart initialized with ${instruments.length} instruments`);
                }
            }
            catch (error)
            {
                loggerService.logError(`Failed to load and subscribe to crypto instruments: ${error.message}`);
                setErrorMessage(`Failed to load crypto instruments: ${error.message}`);
            }
        };

        loadCryptoInstruments();
    }, [configurationService, marketDataService, loggerService]);

    useEffect(() =>
    {
        const loadInterval = async () =>
        {
            try
            {
                const intervalValue = await configurationService.getCryptoChartInterval();
                setInterval(intervalValue);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load chart interval: ${error.message}`);
            }
        };

        loadInterval();
    }, [configurationService, loggerService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/crypto-price-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const { messageType, cryptoPrice: eventPrice } = event.data;
        
        if (eventPrice && eventPrice.symbol)
        {
            setCryptoData(prevData =>
            {
                const newData = new Map(prevData);
                const symbol = eventPrice.symbol;
                const existingData = newData.get(symbol) || [];
                
                const price = eventPrice.best_ask || eventPrice.price || 0;
                
                if (price && price > 0 && price !== 0)
                {
                    const newPricePoint = {
                        time_stamp: new Date(eventPrice.timestamp || new Date()),
                        symbol: symbol,
                        price: price
                    };

                    const updatedData = [...existingData, newPricePoint];
                    newData.set(symbol, updatedData);
                    
                    return newData;
                }
                else
                {
                    return prevData;
                }
            });
        }
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
    }, [worker, handleWorkerMessage]);

    useEffect(() =>
    {
        const instruments = Array.from(subscribedInstruments);
        if (instruments.length === 0)
            return;

        const colors = generateRandomColors(instruments.length);
        const series = [];
        
        instruments.forEach((instrument, index) =>
        {
            const symbolData = cryptoData.get(instrument) || [];
            
            if (symbolData.length > 0)
            {
                const sortedData = symbolData
                    .filter(point => point.price && point.price > 0 && point.price !== 0)
                    .sort((a, b) => 
                    {
                        const timeA = a.time_stamp instanceof Date ? a.time_stamp : new Date(a.time_stamp);
                        const timeB = b.time_stamp instanceof Date ? b.time_stamp : new Date(b.time_stamp);
                        return timeA.getTime() - timeB.getTime();
                    });
                
                const seriesData = sortedData.map(point => ({
                    time_stamp: point.time_stamp instanceof Date ? point.time_stamp : new Date(point.time_stamp),
                    value: point.price
                }));
                
                series.push({
                    type: 'line',
                    xKey: 'time_stamp',
                    yKey: 'value',
                    yName: instrument,
                    data: seriesData,
                    stroke: colors[index],
                    strokeWidth: 2,
                    connectMissingData: true,
                    marker:
                    {
                        shape: 'circle',
                        size: 3,
                        fill: colors[index],
                        stroke: colors[index],
                        enabled: true
                    }
                });
            }
        });

        setOptions(prevOptions => ({
            ...prevOptions,
            data: [],
            series: series,
            title: { text: `Crypto Chart - ${instruments.length} coins` },
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
                }]
        }));
    }, [cryptoData, subscribedInstruments, interval]);

    useEffect(() =>
    {
        return () =>
        {
            if (subscribedInstruments.size > 0)
                marketDataService.unsubscribeAllCrypto([...subscribedInstruments]).catch(error => loggerService.logError(`Failed to unsubscribe on cleanup: ${error.message}`));
        };
    }, [subscribedInstruments]);

    return (
        <>
            <TitleBarComponent title="Crypto Chart" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ width: '95%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <AgChartsReact options={options} />
            </div>
            {errorMessage && (<ErrorMessageComponent message={errorMessage} duration={10000} onDismiss={() => setErrorMessage(null)} position="bottom-right"/>)}
        </>
    );
};
