import * as React from 'react';
import {useEffect, useState} from "react";

export const TickerApp = () =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("./price-reader.js", import.meta.url));
        setWorker(web_worker);
        return () =>
        {
            web_worker.terminate();
        };
    }, []);

    useEffect(() =>
    {
        if(worker)
        {
            worker.onmessage = (e) =>
            {
                setPrices((prices) => [...prices, e.data]);
            };
        }
    }, [worker]);

    return (
        <>
            <ul>
                {prices.map((price, index) => <li key={index}>symbol: {price.symbol} with best ask: {price.best_ask} and best bid: {price.best_bid}</li>)}
            </ul>
        </>
    );
};
