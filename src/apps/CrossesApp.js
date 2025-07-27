import React, {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import '../styles/css/main.css';
import {ExchangeRateService} from "../services/ExchangeRateService";
import {CrossesSummaryComponent} from "../components/CrossesSummaryComponent";
import {CrossesDetailComponent} from "../components/CrossesDetailComponent";
import {useRecoilState} from "recoil";
import {titleBarContextShareColourState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";


const CrossesApp = () =>
{
    const [stockRows, setStockRows] = useState([]);
    const [crossesReceived, setCrossesReceived] = useState([]);
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);
    const [worker, setWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [clientCode, setClientCode] = useState(null);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const loggerService = useRef(new LoggerService(CrossesApp.name)).current;

    const windowId = useMemo(() => window.command.getWindowId("Crosses"), []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/cross-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const newCross = event.data.cross;
        setCrossesReceived((prevData) => [...prevData, newCross]);
    }, []);

    window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
    {
        if(fdc3Message.type === "fdc3.context")
        {
            if(fdc3Message.contextShareColour)
                setTitleBarContextShareColour(fdc3Message.contextShareColour);

            if(fdc3Message.instruments?.[0]?.id.ticker)
                setInstrumentCode(fdc3Message.instruments[0].id.ticker);
            else
                setInstrumentCode(null);

            if(fdc3Message.clients?.[0]?.id.name)
                setClientCode(fdc3Message.clients[0].id.name);
            else
                setClientCode(null);
        }
    });

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

    useEffect(() =>
    {
        exchangeRateService.loadExchangeRates().then(() => setExchangeRatesLoaded(true));
    }, [exchangeRateService]);

    const transformCrosses = (crossesArray) =>
    {
        const grouped = {};
        for (const order of crossesArray)
        {
            const instrumentCode = order.instrumentCode;
            if (!grouped[instrumentCode])
            {
                grouped[instrumentCode] =
                {
                    instrumentCode,
                    stockDescription: order.instrumentDescription,
                    currency: order.settlementCurrency,
                    buyOrders: [],
                    sellOrders: []
                };
            }

            const formattedOrder =
            {
                desk: "Unknown Desk",
                trader: order.ownerId || "Unknown Trader",
                quantity: order.quantity,
                instrumentCode: order.instrumentCode,
                notionalValue: order.orderNotionalValueInUSD || 0,
                instruction: order.handlingInstruction || "Unknown Instruction",
                price: order.price,
                client: order.clientDescription || "Client Masked",
                time: order.arrivalTime || "Unknown Time"
            };

            if (order.side === "BUY")
                grouped[instrumentCode].buyOrders.push(formattedOrder);
            else if (order.side !== "BUY")
                grouped[instrumentCode].sellOrders.push(formattedOrder);
        }

        return Object.values(grouped);
    }

    const filterCrosses = (crosses, instrumentCode, clientCode) =>
    {
        let result = [];

        if(instrumentCode)
        {
            loggerService.logInfo(`Filtering crosses for instrument code: ${instrumentCode}.`);
            result = crosses.filter((item) => item.instrumentCode === instrumentCode);
        }

        if(clientCode)
        {
            loggerService.logInfo(`Filtering crosses for client code: ${clientCode}.`);
            for (const cross of crosses)
            {
                const { buyOrders, sellOrders, ...rest } = cross;
                const hasMatchingBuy = buyOrders.some((order) => order.clientCode === clientCode && order.instrumentCode !== instrumentCode);
                const hasMatchingSell = sellOrders.some((order) => order.clientCode === clientCode && order.instrumentCode !== instrumentCode);

                if (hasMatchingBuy || hasMatchingSell)
                    result.push({ ...rest, buyOrders, sellOrders });
            }
        }

        if(!clientCode && !instrumentCode)
        {
            loggerService.logInfo("No filters applied, returning all crosses.");
            for(const cross of crosses)
            {
                const { buyOrders, sellOrders, ...rest } = cross;
                result.push({ ...rest, buyOrders, sellOrders });
            }
        }

        return result;
    }

    const calculateMaximumCrossableAmount = (buyOrders, sellOrders, currency) =>
    {
        if(buyOrders?.length === 0 || sellOrders?.length === 0)
            return { maximumCrossableQuantity: 0, maximumCrossableNotionalValue: 0 };

        const totalNotionalBuy = buyOrders.reduce((total, order) => total + order.notionalValue, 0);
        const totalNotionalSell = sellOrders.reduce((total, order) => total + order.notionalValue, 0);

        const totalQuantityBuy = buyOrders.reduce((total, order) => total + order.quantity, 0);
        const totalQuantitySell = sellOrders.reduce((total, order) => total + order.quantity, 0);

        const maximumCrossableQuantity = Math.min(totalQuantityBuy, totalQuantitySell);
        const maximumCrossableNotionalValue = Math.round(Math.min(totalNotionalBuy, totalNotionalSell) / exchangeRateService.getExchangeRate(currency));
        return { maximumCrossableQuantity, maximumCrossableNotionalValue };
    };

    useEffect(() =>
    {
        if(!exchangeRatesLoaded)
            return;

        const result = filterCrosses(transformCrosses(crossesReceived), instrumentCode, clientCode);

        if(result.length === 0)
        {
            setStockRows([<div className="opportunity-row">
                <div className="stock-info">
                    <CrossesSummaryComponent stockCode={instrumentCode || "No Crossable Stocks"} stockCurrency={''} stockDescription={''}
                                             maxCrossableQty={0} maxCrossableNotional={0} />
                    <CrossesDetailComponent windowId={windowId} buyOrders={[]} sellOrders={[]}/>
                </div>
            </div>]);
        }
        else
        {
            setStockRows(result.map((cross, index) =>
            {
                const { maximumCrossableQuantity, maximumCrossableNotionalValue } = calculateMaximumCrossableAmount(cross.buyOrders, cross.sellOrders, cross.currency);

                return (
                    <div key={index} className="opportunity-row">
                        <div className="stock-info">
                            <CrossesSummaryComponent stockCode={cross.instrumentCode} stockCurrency={cross.currency} stockDescription={cross.stockDescription}
                                                     maxCrossableQty={maximumCrossableQuantity.toLocaleString()} maxCrossableNotional={maximumCrossableNotionalValue.toLocaleString()}/>
                            <CrossesDetailComponent windowId={windowId} buyOrders={cross.buyOrders} sellOrders={cross.sellOrders}/>
                        </div>
                    </div>
                );
            }));
        }
    }, [exchangeRatesLoaded, instrumentCode, clientCode, crossesReceived, windowId]);

    return(
        <>
            <TitleBarComponent title="Crosses" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
            <div className="crosses-app" style={{width: '100%', height: 'calc(100vh - 72px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <div className="crosses-app">
                    {stockRows}
                </div>
            </div>
        </>
    );
};

export default CrossesApp;
