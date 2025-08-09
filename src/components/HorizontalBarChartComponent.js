import React, { useMemo } from 'react';
import { AgChartsReact } from 'ag-charts-react';

export const HorizontalBarChartComponent = ({ title, data }) =>
{
    const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Math.round(value));
    const formatPercent = (value) => `${Math.round(value)}%`;

    const summary = useMemo(() =>
    {
        return data.reduce(
            (acc, item) =>
            {
                acc.orderBuy += item.orderBuy;
                acc.executedBuy += item.executedBuy;
                acc.orderSell += Math.abs(item.orderSell);
                acc.executedSell += Math.abs(item.executedSell);
                return acc;
            },
            { orderBuy: 0, executedBuy: 0, orderSell: 0, executedSell: 0 }
        );
    }, [data]);

    const totalBuy = summary.orderBuy + summary.executedBuy;
    const totalSell = summary.orderSell + summary.executedSell;
    const workingBuy = summary.orderBuy - summary.executedBuy;
    const workingSell = summary.orderSell - summary.executedSell;


    const getWholeNumberRatioWithPercent = (buy, sell) =>
    {
        if (buy === 0 && sell === 0) return '0:0 (0%:0%)';
        if (sell === 0) return '1:0 (100%:0%)';
        if (buy === 0) return '0:1 (0%:100%)';

        const scaleFactor = 100;
        const scaledBuy = Math.round((buy / sell) * scaleFactor);
        const scaledSell = scaleFactor;

        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(scaledBuy, scaledSell);
        const simplifiedBuy = scaledBuy / divisor;
        const simplifiedSell = scaledSell / divisor;

        const percentBuy = Math.round((buy / (buy + sell)) * 100);
        const percentSell = 100 - percentBuy;

        return `${simplifiedBuy}:${simplifiedSell} (${percentBuy}%:${percentSell}%)`;
    };

    const skewRatio = getWholeNumberRatioWithPercent(totalBuy, totalSell);

    const options = {
        title: {
            text: title,
            fontSize: 14,
            fontFamily: 'Verdana, sans-serif',
            spacing: 10
        },
        data,
        series: [
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'orderSell',
                stacked: true,
                yName: 'Order Sell Notional',
                fill: '#f44336',
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(Math.abs(value))
                },
                tooltip: {
                    renderer: ({ datum }) =>
                    {
                        const percent = summary.orderSell ? (Math.abs(datum.orderSell) / summary.orderSell) * 100 : 0;
                        return {
                            content: `${formatNumber(Math.abs(datum.orderSell))} (${formatPercent(percent)})`
                        };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'executedSell',
                stacked: true,
                yName: 'Executed Sell Notional',
                fill: '#e57373',
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(Math.abs(value))
                },
                tooltip: {
                    renderer: ({ datum }) =>
                    {
                        const percent = summary.executedSell ? (Math.abs(datum.executedSell) / summary.executedSell) * 100 : 0;
                        return {
                            content: `${formatNumber(Math.abs(datum.executedSell))} (${formatPercent(percent)})`
                        };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'orderBuy',
                stacked: true,
                yName: 'Order Buy Notional',
                fill: '#528c74',
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(value)
                },
                tooltip: {
                    renderer: ({ datum }) =>
                    {
                        const percent = summary.orderBuy ? (datum.orderBuy / summary.orderBuy) * 100 : 0;
                        return {
                            content: `${formatNumber(datum.orderBuy)} (${formatPercent(percent)})`
                        };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'executedBuy',
                stacked: true,
                yName: 'Executed Buy Notional',
                fill: '#81c784',
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(value)
                },
                tooltip: {
                    renderer: ({ datum }) =>
                    {
                        const percent = summary.executedBuy ? (datum.executedBuy / summary.executedBuy) * 100 : 0;
                        return {
                            content: `${formatNumber(datum.executedBuy)} (${formatPercent(percent)})`
                        };
                    }
                }
            }
        ],
        axes: [
            {
                type: 'category',
                position: 'left',
                label: {
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif'
                }
            },
            {
                type: 'number',
                position: 'bottom',
                label: {
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: (value) =>
                    {
                        return isFinite(value) ? formatNumber(Math.abs(value)) : '';
                    }
                }
            }
        ],
        legend: {
            position: 'top',
            item: {
                label: {
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
        height: 200
    };

    return (
        <div style={{ marginBottom: '0px' }}>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    padding: '6px 0px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    marginBottom: '0px',
                    fontFamily: 'Verdana, sans-serif',
                    fontSize: '13px',
                    color: '#333',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <div title="Total notional value of sell orders placed" style={{ color: '#f44336' }}>
                    <strong>Σ</strong> Order Sell: {formatNumber(summary.orderSell)}
                </div>
                <div title="Total notional value of sell orders that have been executed" style={{ color: '#f44336' }}>
                    <strong>Σ</strong> Executed Sell: {formatNumber(summary.executedSell)}
                </div>
                <div title="Remaining notional value of sell orders yet to be executed" style={{ color: '#f44336' }}>
                    <strong>Σ</strong> Working Sell: {formatNumber(workingSell)}
                </div>
                <div title="Ratio and percentage of total buy vs sell notional"
                     style={{ color: totalBuy >= totalSell ? '#4caf50' : '#f44336' }}>
                    <strong>Buy/Sell Skew: {skewRatio}</strong>
                </div>
                <div title="Total notional value of buy orders placed" style={{ color: '#51c541' }}>
                    <strong>Σ</strong> Order Buy: {formatNumber(summary.orderBuy)}
                </div>
                <div title="Total notional value of buy orders that have been executed" style={{ color: '#51c541' }}>
                    <strong>Σ</strong> Executed Buy: {formatNumber(summary.executedBuy)}
                </div>
                <div title="Remaining notional value of buy orders yet to be executed" style={{ color: '#51c541' }}>
                    <strong>Σ</strong> Working Buy: {formatNumber(workingBuy)}
                </div>
            </div>

            <AgChartsReact options={options} />
        </div>
    );
};
