import React, { useMemo } from 'react';
import { AgChartsReact } from 'ag-charts-react';

export const HorizontalBarChartComponent = ({ title, data, colors, showWorkingTotals = false }) =>
{
    const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Math.round(value));
    const formatPercent = (value) => `${Math.round(value)}%`;

    // Derive working fields on each datum for use as yKeys when needed
    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.map(d => {
            const workingBuyVal = Math.max(0, (d.orderBuy || 0) - (d.executedBuy || 0));
            const workingSellMagnitude = Math.max(0, Math.abs(d.orderSell || 0) - Math.abs(d.executedSell || 0));
            // Keep sell to the left by making value negative
            const workingSellVal = -1 * workingSellMagnitude;
            return { ...d, workingBuy: workingBuyVal, workingSell: workingSellVal };
        });
    }, [data]);

    const baseData = showWorkingTotals ? chartData : data;

    const summary = useMemo(() =>
    {
        return baseData.reduce(
            (acc, item) =>
            {
                acc.orderBuy += item.orderBuy || 0;
                acc.executedBuy += item.executedBuy || 0;
                acc.orderSell += Math.abs(item.orderSell || 0);
                acc.executedSell += Math.abs(item.executedSell || 0);
                acc.workingBuy += item.workingBuy || 0;
                acc.workingSell += Math.abs(item.workingSell || 0);
                return acc;
            },
            { orderBuy: 0, executedBuy: 0, orderSell: 0, executedSell: 0, workingBuy: 0, workingSell: 0 }
        );
    }, [baseData]);

    const totalBuy = (summary.orderBuy || 0) + (summary.executedBuy || 0);
    const totalSell = (summary.orderSell || 0) + (summary.executedSell || 0);
    const workingBuy = summary.workingBuy || ((summary.orderBuy || 0) - (summary.executedBuy || 0));
    const workingSell = summary.workingSell || ((summary.orderSell || 0) - (summary.executedSell || 0));

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

    const applied = {
        orderSellColor: colors?.orderSellColor ?? '#f44336',
        executedSellColor: colors?.executedSellColor ?? '#e57373',
        orderBuyColor: colors?.orderBuyColor ?? '#528c74',
        executedBuyColor: colors?.executedBuyColor ?? '#81c784',
        workingBuyColor: colors?.workingBuyColor ?? '#66bb6a',
        workingSellColor: colors?.workingSellColor ?? '#ef5350'
    };

    // Compute totals per series key for accurate percentages
    const totalsByKey = useMemo(() => {
        const keys = showWorkingTotals
            ? ['workingSell', 'workingBuy']
            : ['orderSell', 'executedSell', 'orderBuy', 'executedBuy'];
        const totals = {};
        for (const key of keys) {
            totals[key] = baseData.reduce((sum, d) => sum + Math.abs(d[key] || 0), 0);
        }
        return totals;
    }, [baseData, showWorkingTotals]);

    const series = showWorkingTotals
        ? [
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'workingSell',
                stacked: true,
                yName: 'Working Sell Notional',
                fill: applied.workingSellColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ datum }) => formatNumber(Math.abs(datum.workingSell))
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'workingBuy',
                stacked: true,
                yName: 'Working Buy Notional',
                fill: applied.workingBuyColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(value)
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            }
        ]
        : [
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'orderSell',
                stacked: true,
                yName: 'Order Sell Notional',
                fill: applied.orderSellColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ datum }) => formatNumber(Math.abs(datum.orderSell))
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'executedSell',
                stacked: true,
                yName: 'Executed Sell Notional',
                fill: applied.executedSellColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ datum }) => formatNumber(Math.abs(datum.executedSell))
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'orderBuy',
                stacked: true,
                yName: 'Order Buy Notional',
                fill: applied.orderBuyColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(value)
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            },
            {
                type: 'bar',
                xKey: 'name',
                yKey: 'executedBuy',
                stacked: true,
                yName: 'Executed Buy Notional',
                fill: applied.executedBuyColor,
                label: {
                    enabled: true,
                    fontSize: 11,
                    fontFamily: 'Verdana, sans-serif',
                    formatter: ({ value }) => formatNumber(value)
                },
                tooltip: {
                    renderer: (params) =>
                    {
                        const yKey = params.yKey;
                        const value = Math.abs(params.datum[yKey] || 0);
                        const total = totalsByKey[yKey] || 0;
                        const percent = total ? (value / total) * 100 : 0;
                        return { content: `${formatNumber(value)} (${formatPercent(percent)})` };
                    }
                }
            }
        ];

    const options = {
        title: {
            text: title,
            fontSize: 14,
            fontFamily: 'Verdana, sans-serif',
            spacing: 10
        },
        data: baseData,
        series,
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
                    <strong>Σ</strong> Order Sell: {formatNumber(Math.abs(summary.orderSell))}
                </div>
                <div title="Total notional value of sell orders that have been executed" style={{ color: '#f44336' }}>
                    <strong>Σ</strong> Executed Sell: {formatNumber(Math.abs(summary.executedSell))}
                </div>
                <div title="Remaining notional value of sell orders yet to be executed" style={{ color: '#f44336' }}>
                    <strong>Σ</strong> Working Sell: {formatNumber(Math.abs(workingSell))}
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
