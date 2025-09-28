import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { LoggerService } from "../services/LoggerService";
import { numberFormatter } from "../utilities";

const DailyTrendsComponent = () =>
{
    const loggerService = useRef(new LoggerService(DailyTrendsComponent.name)).current;
    const [dailyStats, setDailyStats] = useState([]);
    const [selectedDays, setSelectedDays] = useState(7);

    const fetchDailyStats = useCallback(async () =>
    {
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/stats/daily?days=${selectedDays}`);
            if (response.ok)
            {
                const data = await response.json();
                setDailyStats(Array.isArray(data) ? data : []);
                loggerService.logInfo('Daily stats loaded successfully');
            }
            else
            {
                loggerService.logError(`Failed to fetch daily stats: ${response.status} ${response.statusText}`);
                setDailyStats([]);
            }
        }
        catch (error)
        {
            loggerService.logError(`Failed to fetch daily stats: ${error.message}`);
            setDailyStats([]);
        }
    }, [selectedDays, loggerService]);

    useEffect(() =>
    {
        fetchDailyStats();
    }, [fetchDailyStats]);

    const dailyStatsColumnDefs = useMemo(() => [
        {
            headerName: 'Date',
            field: 'date',
            width: 120,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Total RFQs',
            field: 'totalRfqs',
            width: 120,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Pending',
            field: 'statusCounts.PENDING',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Accepted',
            field: 'statusCounts.ACCEPTED',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Rejected',
            field: 'statusCounts.REJECTED',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Pricing',
            field: 'statusCounts.PRICING',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Priced',
            field: 'statusCounts.PRICED',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Traded Away',
            field: 'statusCounts.TRADED_AWAY',
            width: 120,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Trade Completed',
            field: 'statusCounts.TRADE_COMPLETED',
            width: 140,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        }
    ], []);

    return (
        <>
            <div className="filter-controls">
                <FormControl size="small">
                    <InputLabel>Days</InputLabel>
                    <Select
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(e.target.value)}
                        size="small"
                    >
                        <MenuItem value={7}>Last 7 days</MenuItem>
                        <MenuItem value={14}>Last 14 days</MenuItem>
                        <MenuItem value={30}>Last 30 days</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 80px)', width: '100%' }}>
                <AgGridReact
                    rowData={dailyStats}
                    columnDefs={dailyStatsColumnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    animateRows={true}
                    defaultColDef={{ resizable: true, sortable: true, filter: true }}
                />
            </div>
        </>
    );
};

export default DailyTrendsComponent;
