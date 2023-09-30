import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import React, {useEffect, useState, useMemo, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@mui/material/TextField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {DataService} from "../services/DataService";
import {selectedClientState} from "../atoms/component-state";

export const ClientListComponent = () =>
{
    const [, setSelectedClient] = useRecoilState(selectedClientState);
    const dataService = useRef(new DataService()).current;
    const [gridApi, setGridApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
            width: 160,
            hide: false
        }
    ]), []);

    const onGridReady = (params) =>
    {
        setGridApi(params.api);
    };

    const onFilterChanged = () =>
    {
        if(gridApi)
            gridApi.setQuickFilter(searchTerm);
    };

    const handleRowClick = (event) =>
    {
        setSelectedClient(event.data.client);
    };

    const handleSearchChange = (event) =>
    {
        setSearchTerm(event.target.value);
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
                    rowData={dataService.getData(DataService.CLIENTS)}
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
