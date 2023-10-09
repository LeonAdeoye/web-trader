import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import React, {useEffect, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@mui/material/TextField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {clientInterestsChangedState, selectedClientState} from "../atoms/component-state";

export const ClientListComponent = ({listOfClients}) =>
{
    const [selectedClient, setSelectedClient] = useRecoilState(selectedClientState);
    const [clientInterestsChanged, setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const [gridApi, setGridApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const columnDefs = useMemo(() => ([
        {
            headerName: 'Client Id',
            field: 'clientId',
            width: 100,
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
        if (gridApi && selectedClient && listOfClients.length > 0)
        {
            gridApi.forEachNode(node =>
            {
                if (node.data.clientId === selectedClient)
                    node.setSelected(true);
            });
        }
    }, [selectedClient]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <TextField size='small' className='search-text' label="Search by client name." onChange={handleSearchChange} InputProps={{ style: { fontSize: '15px' } }}
                style={{ height: '30px', boxSizing: 'border-box', margin: '6px 6px 3px 5px'}}/>
            <div style={{ height: '14px', width: '100%', backgroundColor: "white"}}></div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 45px)', width: 'calc(100%- 3px)'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    rowData={listOfClients}
                    getRowNodeId={data => data.clientId}
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
