import React, {useMemo, useState, useCallback} from 'react';
import '../styles/css/main.css';
import {DataService} from "../services/DataService";
import {useEffect, useRef} from "react";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {FDC3Service} from "../services/FDC3Service";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {CrossesSummaryComponent} from "./CrossesSummaryComponent";
import {CrossesDetailComponent} from "./CrossesDetailComponent";

const CrossesApp = () =>
{
    const [dataService] = useState(new DataService());
    const [stockRows, setStockRows] = useState([]);
    const [exchangeRateService] = useState(new ExchangeRateService());
    const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);
    const [worker, setWorker] = useState(null);
    const [stockCode, setStockCode] = useState(null);
    const [client, setClient] = useState(null);
    const buyGridApiRef = useRef();
    const sellGridApiRef = useRef();
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("crosses"), []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/cross-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const newCross = event.data.cross;
        setStockRows((prevData) => [...prevData, newCross]);
    }, []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Context, _, __) =>
        {
            if(fdc3Context.type === "fdc3.context")
            {
                if(fdc3Context.instruments.length > 0 && fdc3Context.instruments[0].id.ticker)
                    setStockCode(fdc3Context.instruments[0].id.ticker);
                else
                    setStockCode(null);

                if(fdc3Context.clients.length > 0 && fdc3Context.clients[0].id.name)
                    setClient(fdc3Context.clients[0].id.name);
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

    const onBuySelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(buyGridApiRef);
    }, []);

    const onSellSelectionChanged = useCallback(() =>
    {
        handleSelectionChanged(sellGridApiRef);
    }, []);

    const handleSelectionChanged = useCallback((gridApiRef) =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        if(selectedRows.length === 1)
            setSelectedGenericGridRow(selectedRows[0]);
    }, []);

    const onCellClicked = useCallback((params) =>
    {
        const {colDef, data} = params;

        if (colDef.field === 'stockCode')
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(data.stockCode, null), null, windowId);
        else if (colDef.field === 'client' && data.client !== "Client Masked")
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, data.client), null, windowId);
        else
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(data.stockCode, data.client), null, windowId);
    }, []);

    useEffect(() =>
    {
        if(!exchangeRatesLoaded)
            return;

        const result = dataService.getData(DataService.CROSSES, stockCode, client);

        if(result.length === 0)
        {
            setStockRows([<div className="opportunity-row">
                <div className="stock-info">
                    <CrossesSummaryComponent stockCode={stockCode || "No Crossable Stocks"} stockCurrency={''} stockDescription={''}
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
    }, [exchangeRatesLoaded, stockCode, client]);

    return (
        <div className="crosses-app">
            {stockRows}
        </div>
    );

};

export default CrossesApp;
