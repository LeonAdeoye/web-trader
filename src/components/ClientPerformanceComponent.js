import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TextField } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { LoggerService } from "../services/LoggerService";
import { numberFormatter, getTodayTradeDateFormat } from "../utilities";

const ClientPerformanceComponent = () =>
{
    const loggerService = useRef(new LoggerService(ClientPerformanceComponent.name)).current;
    const [clientPercentages, setClientPercentages] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const fetchClientPercentages = useCallback(async () =>
    {
        try
        {
            // Convert YYYY-MM-DD to MM-DD-YYYY for the API
            const [year, month, day] = selectedDate.split('-');
            const apiDate = `${month}-${day}-${year}`;
            console.log('Selected date:', selectedDate);
            console.log('API date:', apiDate);
            const response = await fetch(`http://localhost:20020/rfq/stats/client-percentages/${apiDate}`);
            if (response.ok)
            {
                const data = await response.json();
                console.log('API response:', data);
                setClientPercentages(Array.isArray(data) ? data : []);
                loggerService.logInfo('Client percentages loaded successfully');
            }
            else
            {
                loggerService.logError(`Failed to fetch client percentages: ${response.status} ${response.statusText}`);
                setClientPercentages([]);
            }
        }
        catch (error)
        {
            loggerService.logError(`Failed to fetch client percentages: ${error.message}`);
            setClientPercentages([]);
        }
    }, [selectedDate, loggerService]);

    useEffect(() =>
    {
        fetchClientPercentages();
    }, [fetchClientPercentages]);

    const clientPercentagesColumnDefs = useMemo(() => [
        {
            headerName: 'Client Name',
            field: 'clientName',
            width: 200,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Trade Completed %',
            field: 'TradeCompletedPercent',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: (params) => `${params.value}%`
        },
        {
            headerName: 'Traded Away %',
            field: 'tradedAwayPercent',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: (params) => `${params.value}%`
        },
        {
            headerName: 'Others %',
            field: 'othersPercent',
            width: 120,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: (params) => `${params.value}%`
        },
        {
            headerName: 'Total RFQs',
            field: 'totalRfqs',
            width: 120,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        }
    ], []);

    return (
        <>
            <div className="filter-controls">
                <TextField
                    type="date"
                    InputProps={{ style: { fontSize: '0.75rem', height: '30px' , marginLeft: '10px', marginTop: '10px', marginBottom: '10px'} }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value) }
                    size="small"
                    InputLabelProps={{ shrink: true}}/>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 52px)', width: '100%' }}>
                <AgGridReact
                    rowData={clientPercentages}
                    columnDefs={clientPercentagesColumnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    animateRows={true}
                    defaultColDef={{ resizable: true, sortable: true, filter: true }}/>
            </div>
        </>
    );
};

export default ClientPerformanceComponent;
