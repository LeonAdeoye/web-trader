import '../styles/css/main.css';
import React, {useState, useEffect, useMemo, useRef} from 'react';
import {AgChartsReact} from 'ag-charts-react';
import {DataService} from "../services/DataService";

export const BasketChartApp = () =>
{
    const dataService = useRef(new DataService()).current;
    const windowId = useMemo(() => window.command.getWindowId("basket-chart"), []);
    const [basketId, setBasketId] = useState(null);
    const [options, setOptions] = useState({
        autoSize: true,
        title: {
            text: 'Volatility vs ADV',
        },
        subtitle: {
            text: 'for all constituents in the basket',
        },
        series: [
            {
                type: 'scatter',
                title: 'Buys',
                data: [],
                xKey: 'adv20',
                xName: 'ADV',
                yKey: 'volatility',
                yName: 'Volatility',
                sizeKey: 'quantity',
                sizeName: 'Quantity',
                labelKey: 'stockCode',
                marker: {
                    size: 6,
                    maxSize: 70,
                    fill: 'rgba(52, 107, 180, 0.5)',
                    stroke: '#56659b',
                },
                label: {
                    enabled: true,
                }
            },
            {
                type: 'scatter',
                title: 'Sells',
                data: [],
                xKey: 'adv20',
                xName: 'ADV',
                yKey: 'volatility',
                yName: 'Volatility',
                sizeKey: 'quantity',
                sizeName: 'Quantity',
                labelKey: 'stockCode',
                marker: {
                    size: 6,
                    maxSize: 70,
                    fill: 'rgba(82, 140, 116, 0.5)',
                    stroke: '#56659b',
                },
                label: {
                    enabled: true,
                }
            }
        ],
        axes: [
            {
                type: 'number',
                position: 'bottom',
                title: {
                    text: 'Average Daily Volume in past 20 days',
                },
                label: {
                    formatter: (params) =>
                    {
                        return params.value + '%';
                    }
                }
            },
            {
                type: 'number',
                position: 'left',
                title: {
                    text: 'Volatility',
                },
                label: {
                    formatter: (params) =>
                    {
                        return params.value + '%';
                    }
                }
            }
        ]
    });

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.chart")
            {
                if(fdc3Message.products.length > 0 && fdc3Message.products[0].id.ticker)
                    setBasketId(fdc3Message.products[0].id.ticker);
                else
                    setBasketId(null);
            }
        });
    }, []);

    useEffect(() =>
    {
        if(basketId)
        {
            setOptions((prevOptions) =>
            {
                return {
                    ...prevOptions,
                    series: [{
                        ...prevOptions.series[0],
                        data: dataService.getData(DataService.BASKETS).filter(basket => basket.basketId === basketId)[0].constituents.filter(constituent => constituent.side === 'Buy')
                    },
                        {
                            ...prevOptions.series[1],
                            data: dataService.getData(DataService.BASKETS).filter(basket => basket.basketId === basketId)[0].constituents.filter(constituent => constituent.side === 'Sell')
                        }]
                }
            });
        }
    }, [basketId]);

    return (
        <AgChartsReact options={options}/>
    );
}

