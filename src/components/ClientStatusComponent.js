import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { LoggerService } from "../services/LoggerService";
import { numberFormatter } from "../utilities";

const ClientStatusComponent = () =>
{
    const loggerService = useRef(new LoggerService(ClientStatusComponent.name)).current;
    const [clientStatusStats, setClientStatusStats] = useState([]);
    const [selectedClientStatus, setSelectedClientStatus] = useState('PRICING');

    const statusOptions = [
        'PENDING', 'ACCEPTED', 'REJECTED', 'PRICING', 
        'PRICED', 'TRADED_AWAY', 'TRADE_COMPLETED'
    ];

    const fetchClientStatusStats = useCallback(async () =>
    {
        try
        {
            const response = await fetch(`http://localhost:20020/rfq/stats/clients/${selectedClientStatus}`);
            if (response.ok)
            {
                const data = await response.json();
                setClientStatusStats(Array.isArray(data) ? data : []);
                loggerService.logInfo('Client status stats loaded successfully');
            }
            else
            {
                loggerService.logError(`Failed to fetch client status stats: ${response.status} ${response.statusText}`);
                setClientStatusStats([]);
            }
        }
        catch (error)
        {
            loggerService.logError(`Failed to fetch client status stats: ${error.message}`);
            setClientStatusStats([]);
        }
    }, [selectedClientStatus, loggerService]);

    useEffect(() =>
    {
        fetchClientStatusStats();
    }, [fetchClientStatusStats]);

    const clientStatusStatsColumnDefs = useMemo(() => [
        {
            headerName: 'Client Name',
            field: 'clientName',
            width: 200,
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
                        value={selectedClientStatus}
                        onChange={(e) => setSelectedClientStatus(e.target.value)}
                        size="small"
                    >
                        {statusOptions.map(status => (
                            <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 80px)', width: '100%' }}>
                <AgGridReact
                    rowData={clientStatusStats}
                    columnDefs={clientStatusStatsColumnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    animateRows={true}
                    defaultColDef={{ resizable: true, sortable: true, filter: true }}
                />
            </div>
        </>
    );
};

export default ClientStatusComponent;
