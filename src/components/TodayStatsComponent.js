import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from "ag-grid-react";
import { LoggerService } from "../services/LoggerService";
import { numberFormatter, getStatusColor, formatStatus, adjustColor } from "../utilities";

const TodayStatsComponent = () =>
{
    const loggerService = useRef(new LoggerService(TodayStatsComponent.name)).current;
    const [todayStats, setTodayStats] = useState(null);
    const fetchTodayStats = useCallback(async () =>
    {
        try
        {
            const response = await fetch('http://localhost:20020/rfq/stats/today');
            if (response.ok)
            {
                const data = await response.json();
                const safeData =
                {
                    totalRfqs: data?.totalRfqs || 0,
                    statusAggregates: data?.statusAggregates || {}
                };
                setTodayStats(safeData);
                loggerService.logInfo('Today stats loaded successfully');
            }
            else
            {
                loggerService.logError(`Failed to fetch today stats: ${response.status} ${response.statusText}`);
                setTodayStats({ totalRfqs: 0, statusAggregates: {} });
            }
        }
        catch (error)
        {
            loggerService.logError(`Failed to fetch today stats: ${error.message}`);
            setTodayStats({ totalRfqs: 0, statusAggregates: {} });
        }
    }, [loggerService]);

    useEffect(() =>
    {
        fetchTodayStats();
    }, [fetchTodayStats]);

    const todayStatsColumnDefs = useMemo(() =>
    [
        {
            headerName: 'Status',
            field: 'status',
            width: 150,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Count',
            field: 'count',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Total Notional (USD)',
            field: 'totalNotionalInUSD',
            width: 180,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Avg Notional (USD)',
            field: 'averageNotionalInUSD',
            width: 170,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Total Sales Credit (USD)',
            field: 'totalSalesCreditAmount',
            width: 160,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Avg Sales Credit (USD)',
            field: 'averageSalesCreditAmount',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        }
    ], []);

    const todayStatsGridData = useMemo(() =>
    {
        if (!todayStats?.statusAggregates) return [];
        return Object.entries(todayStats.statusAggregates).map(([status, aggregate]) =>
        ({
            status,
            count: aggregate.count,
            totalNotionalInUSD: aggregate.totalNotionalInUSD,
            averageNotionalInUSD: aggregate.averageNotionalInUSD,
            totalSalesCreditAmount: aggregate.totalSalesCreditAmount,
            averageSalesCreditAmount: aggregate.averageSalesCreditAmount
        }));
    }, [todayStats]);

    const renderTodayStatsSummary = () =>
    {
        if (!todayStats || !todayStats.statusAggregates) return null;
        const totalNotional = Object.values(todayStats.statusAggregates).reduce((sum, agg) => sum + (agg.totalNotionalInUSD || 0), 0);
        const totalSalesCredit = Object.values(todayStats.statusAggregates).reduce((sum, agg) => sum + (agg.totalSalesCreditAmount || 0), 0);
        
        return (
            <div className="stats-summary-card">
                <div className="stats-grid">
                    <div className="stats-item" style={{ width: '88px', flexShrink: 0, fontFamily: 'Arial, sans-serif' }}>
                        <span className="stats-value" style={{ fontFamily: 'Arial, sans-serif' }}>{todayStats.totalRfqs || 0}</span>
                        <div className="stats-label" style={{ fontFamily: 'Arial, sans-serif' }}>Total RFQs</div>
                    </div>
                    <div className="stats-item" style={{ width: '88px', flexShrink: 0, fontFamily: 'Arial, sans-serif' }}>
                        <span className="stats-value" style={{ fontFamily: 'Arial, sans-serif' }}>{Math.round(totalNotional).toLocaleString()}</span>
                        <div className="stats-label" style={{ fontFamily: 'Arial, sans-serif' }}>Total Notional $</div>
                    </div>
                    <div className="stats-item" style={{ width: '88px', flexShrink: 0, fontFamily: 'Arial, sans-serif' }}>
                        <span className="stats-value" style={{ fontFamily: 'Arial, sans-serif' }}>{Math.round(totalSalesCredit).toLocaleString()}</span>
                        <div className="stats-label" style={{ fontFamily: 'Arial, sans-serif' }}>Total Sales Credit $</div>
                    </div>
                    {Object.entries(todayStats.statusAggregates || {}).map(([status, aggregate]) =>
                    {
                        const color = getStatusColor(status);
                        const darkerColor = adjustColor(color, -20);
                        
                        return (
                            <div key={status} className="stats-item colored-status-box" style={{
                                background: `linear-gradient(145deg, ${color}, ${darkerColor})`,
                                color: '#ffffff',
                                borderRadius: '8px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                transform: 'translateY(-1px)',
                                width: '84px',
                                flexShrink: 0,
                                fontFamily: 'Arial, sans-serif',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                e.target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.35), 0 3px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(-1px) scale(1)';
                                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)';
                            }}>
                                <span className="stats-value" style={{ color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>{aggregate.count || 0}</span>
                                <div className="stats-label" style={{ color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>{formatStatus(status)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderTodayStatsSummary()}
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 73px)', width: '100%' }}>
                <AgGridReact
                    rowData={todayStatsGridData}
                    columnDefs={todayStatsColumnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    animateRows={true}
                    defaultColDef={{ resizable: true, sortable: true, filter: true }}
                />
            </div>
        </>
    );
};

export default TodayStatsComponent;
