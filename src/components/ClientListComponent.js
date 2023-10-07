import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import React, {useEffect, useState, useMemo, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@mui/material/TextField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {selectedClientState} from "../atoms/component-state";
import {ClientService} from "../services/ClientService";

export const ClientListComponent = () =>
{
    const [, setSelectedClient] = useRecoilState(selectedClientState);
    const clientService = useRef(new ClientService()).current;
    const [gridApi, setGridApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState([]);

    const columnDefs = useMemo(() => ([
        {
            headerName: 'Client Id',
            field: 'clientId',
            width: 10,
            hide: true
        },
        {
            headerName: 'Name',
            field: 'clientName',
            width: 230,
            hide: false
        }
    ]), []);

    const onGridReady = ({api}) =>
    {
        setGridApi(api);
    };

    const onFilterChanged = () =>
    {
        if(gridApi)
            gridApi.setQuickFilter(searchTerm);
    };

    const handleRowClick = ({data}) =>
    {
        setSelectedClient(data.clientId);
    };

    const handleSearchChange = ({target}) =>
    {
        setSearchTerm(target.value);
    }

    useEffect(() =>
    {
        if(gridApi)
        {
            if(searchTerm)
                gridApi.setQuickFilter(searchTerm);
            else
                gridApi.setQuickFilter(null);
        }
    }, [searchTerm, gridApi]);

    useEffect(() =>
    {
        clientService.loadClients()
            .then(() => setClients(clientService.getClients()));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <TextField
                size='small' className='search-text'
                label="Search by client name."
                onChange={handleSearchChange}
                InputProps={{
                    style: {
                        fontSize: '15px'
                    }
                }}
                style={{ height: '30px', boxSizing: 'border-box', marginBottom: '3px', marginTop: '5px', marginRight: '6px'}}/>
            <div style={{ height: '14px', width: '100%', backgroundColor: "white"}}></div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 45px)', width: 'calc(100%- 3px)'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    rowData={clients}
                    onRowClicked={handleRowClick}
                    onFirstDataRendered={onFilterChanged}
                    enableCellChangeFlash={true}
                    rowSelection={'single'}
                    animateRows={true}
                    rowHeight={22}
                    headerHeight={22}
                />
            </div>
        </div>);
}
