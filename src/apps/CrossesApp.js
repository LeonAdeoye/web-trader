import React, {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import '../styles/css/main.css';
import {TradeDataService} from "../services/TradeDataService";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {CrossesSummaryComponent} from "../components/CrossesSummaryComponent";
import {CrossesDetailComponent} from "../components/CrossesDetailComponent";
import {useRecoilState} from "recoil";
import {titleBarContextShareColourState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";


const CrossesApp = () =>
{
    const tradeDataService = useRef(new TradeDataService()).current;
    const [stockRows, setStockRows] = useState([]);
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);
    const [worker, setWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [client, setClient] = useState(null);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

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
        setStockRows((prevData) => [...prevData, newCross]); //TODO
    }, []);

    useEffect(() =>
    {
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
                    setClient(fdc3Message.clients[0].id.name);
                else
                    setClient(null);
            }
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

    useEffect(() =>
    {
        exchangeRateService.loadExchangeRates().then(() => setExchangeRatesLoaded(true));
    }, []);

    const calculateMaximumCrossableAmount = (buyOrders, sellOrders, currency) =>
    {
        if(buyOrders.length === 0 || sellOrders.length === 0)
            return { minimumQuantity: 0, minimumNotionalValue: 0 };

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

        const result = tradeDataService.getData(TradeDataService.CROSSES, instrumentCode, client);

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
                            <CrossesSummaryComponent stockCode={cross.stockCode} stockCurrency={cross.currency} stockDescription={cross.stockDescription}
                                                     maxCrossableQty={maximumCrossableQuantity.toLocaleString()} maxCrossableNotional={maximumCrossableNotionalValue.toLocaleString()}/>
                            <CrossesDetailComponent windowId={windowId} buyOrders={cross.buyOrders} sellOrders={cross.sellOrders}/>
                        </div>
                    </div>
                );
            }));
        }
    }, [exchangeRatesLoaded, instrumentCode, client]);

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
