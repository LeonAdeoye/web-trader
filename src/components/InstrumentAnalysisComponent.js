import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { LoggerService } from "../services/LoggerService";
import { numberFormatter } from "../utilities";

const InstrumentAnalysisComponent = () =>
{
    const loggerService = useRef(new LoggerService(InstrumentAnalysisComponent.name)).current;
    const [instrumentStats, setInstrumentStats] = useState([]);
    const [selectedInstrumentStatus, setSelectedInstrumentStatus] = useState('TRADE_COMPLETED');

    const statusOptions = [
        'PENDING', 'ACCEPTED', 'REJECTED', 'PRICING', 
        'PRICED', 'TRADED_AWAY', 'TRADE_COMPLETED'
    ];

    const fetchInstrumentStats = useCallback(async () =>
    {
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/stats/instruments/${selectedInstrumentStatus}`);
            if (response.ok)
            {
                const data = await response.json();
                setInstrumentStats(Array.isArray(data) ? data : []);
                loggerService.logInfo('Instrument stats loaded successfully');
            }
            else
            {
                loggerService.logError(`Failed to fetch instrument stats: ${response.status} ${response.statusText}`);
                setInstrumentStats([]);
            }
        }
        catch (error)
        {
            loggerService.logError(`Failed to fetch instrument stats: ${error.message}`);
            setInstrumentStats([]);
        }
    }, [selectedInstrumentStatus, loggerService]);

    useEffect(() =>
    {
        fetchInstrumentStats();
    }, [fetchInstrumentStats]);

    const instrumentStatsColumnDefs = useMemo(() =>
    [
        {
            headerName: 'Instrument',
            field: 'instrument',
            width: 150,
            sortable: true,
            filter: true
        },
        {
            headerName: 'Count',
            field: 'statusCount',
            width: 100,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Total Notional',
            field: 'totalNotional',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Average Notional',
            field: 'averageNotional',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Total Sales Credit',
            field: 'totalSalesCreditAmount',
            width: 150,
            sortable: true,
            filter: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter
        },
        {
            headerName: 'Average Sales Credit',
            field: 'averageSalesCreditAmount',
            width: 150,
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
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={selectedInstrumentStatus}
                        onChange={(e) => setSelectedInstrumentStatus(e.target.value)}
                        size="small">
                        {statusOptions.map(status => (
                            <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 80px)', width: '100%' }}>
                <AgGridReact
                    rowData={instrumentStats}
                    columnDefs={instrumentStatsColumnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    animateRows={true}
                    defaultColDef={{ resizable: true, sortable: true, filter: true }}
                />
            </div>
        </>
    );
};

export default InstrumentAnalysisComponent;
