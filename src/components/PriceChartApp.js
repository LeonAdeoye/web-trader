import * as React from 'react';
import {useState} from "react";
import { AgChartsReact } from 'ag-charts-react';

export const PriceChartApp = () =>
{
    const [options, setOptions] = useState({data: data,
        series: [
            {
                xKey: 'time',
                yKey: 'bestAsk',
                yName: 'Intraday Price',
            },
            {
                xKey: 'time',
                yKey: 'bestBid',
                yName: 'Intraday Price',
            },
        ],
        theme: { baseTheme:  'ag-default-dark'},
        legend: {
            enabled: false,
        },
    });

    return <AgChartsReact options={options} />;
};

const data = [
    {
        time: '09:00',
        bestAsk: 700,
        bestBid: 600
    },
    {
        time: '09:30',
        bestAsk: 680,
        bestBid: 620
    },
    {
        time: '10:00',
        bestAsk: 660,
        bestBid: 630
    },
    {
        time: '10:30',
        bestAsk: 650,
        bestBid: 640
    },
    {
        time: '11:00',
        bestAsk: 690,
        bestBid: 610
    },
    {
        time: '11:30',
        bestAsk: 650,
        bestBid: 620
    },
    {
        time: '12:00',
        bestAsk: 660,
        bestBid: 660
    },
    {
        time: '12:30',
        bestAsk: 630,
        bestBid: 640
    },
    {
        time: '13:00',
        bestAsk: 630,
        bestBid: 650
    },
    {
        time: '13:30',
        bestAsk: 680,
        bestBid: 620
    },
    {
        time: '14:00',
        bestAsk: 640,
        bestBid: 660
    },
    {
        time: '14:30',
        bestAsk: 670,
        bestBid: 630
    },
    {
        time: '15:00',
        bestAsk: 610,
        bestBid: 690
    }
];
