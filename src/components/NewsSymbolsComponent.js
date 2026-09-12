import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import React, {useEffect, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@mui/material/TextField';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {selectedNewsSymbolState} from "../atoms/component-state";

export const NewsSymbolsComponent = ({symbolsWithNews}) =>
{
    const [selectedSymbol, setSelectedSymbol] = useRecoilState(selectedNewsSymbolState);
    const [gridApi, setGridApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const columnDefs = useMemo(() => ([
        {
            headerName: 'Symbol',
            field: 'ric',
            hide: false
        }
    ]), []);

    const onGridReady = ({api}) =>
    {
        setGridApi(api);
    };

    const onFilterChanged = () =>
    {
        if (!gridApi) return;

        gridApi.setQuickFilter(searchTerm || '');

        if (symbolsWithNews.length > 0) {
            const firstRow = gridApi.getDisplayedRowAtIndex(0);
            if (firstRow) {
                gridApi.deselectAll();
                firstRow.setSelected(true);
                setSelectedSymbol(firstRow.data.ric);
            }
        }
    };

    const handleRowClick = ({data}) =>
    {
        setSelectedSymbol(data.ric);
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
        if (gridApi && selectedSymbol && symbolsWithNews.length > 0)
        {
            gridApi.forEachNode(node =>
            {
                if (node.data.ric === selectedSymbol)
                    node.setSelected(true);
            });
        }
    }, [selectedSymbol]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <TextField size='small' className='search-text' label="Search by Symbol." onChange={handleSearchChange} InputProps={{ style: { fontSize: '15px' } }}
                       style={{ height: '30px', boxSizing: 'border-box', margin: '6px 6px 3px 5px'}}/>
            <div style={{ height: '14px', width: '100%', backgroundColor: "white"}}></div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100% - 45px)', width: 'calc(100%- 3px)'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    rowData={symbolsWithNews}
                    getRowNodeId={data => data.ric}
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
