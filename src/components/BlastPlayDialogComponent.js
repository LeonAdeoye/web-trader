import React, {useMemo, useState, useCallback} from 'react';
import {useRecoilState} from "recoil";
import {blastPlayDialogDisplayState} from "../atoms/dialog-state";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Typography} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {numberFormatter} from "../utilities";
import {selectedGenericGridRowState} from "../atoms/component-state";

const BlastPlayDialogComponent = () =>
{
    const [blastPlayDialogOpenFlag, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [gridApi, setGridApi] = useState(null);
    const onGridReady = (params) => setGridApi(params.api);

    const columnDefs = useMemo(() =>
    [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 25},
        { headerName: 'Symbol (COPY)', field: 'symbol', width: 100 },
        { headerName: 'Side (COPY)', field: 'side' , width: 90},
        { headerName: 'Stock Desc. (COPY)', field: 'stockDescription', width: 170},
        { headerName: 'Qty', field: 'qty' , width: 70, valueFormatter: numberFormatter, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}},
        { headerName: 'Notional', field: 'notional', width: 90, valueFormatter: numberFormatter, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}},
        { headerName: 'Client', field: 'client', width: 165, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}}
    ], []);

    const newsColumnDefs = useMemo(() =>
        [
            { headerCheckboxSelection: true, checkboxSelection: true, width: 25},
            { headerName: 'Symbol', field: 'symbol', width: 100},
            { headerName: 'Source', field: 'source', width: 90},
            { headerName: 'Description', field: 'description', width: 490},
            { headerName: 'Link', field: 'link', width: 0, hide: true}
        ], []);


    const flows = [
        {
            client: 'Client 1',
            qty: '10000',
            notional: '100000',
            side: 'Buy',
            symbol: 'AAPL',
            stockDescription: 'Apple Inc'
        },
        {
            client: 'Client 2',
            qty: '200',
            notional: '200000',
            side: 'Sell',
            symbol: 'MSFT',
            stockDescription: 'Microsoft Corporation'
        },
        {
            client: 'Client 3',
            qty: '30000',
            notional: '30000000',
            side: 'Buy',
            symbol: 'AMZN',
            stockDescription: 'Amazon.com, Inc.'
        }
    ];

    const news = [
        {
            symbol: 'AAPL',
            source: 'Bloomberg',
            description: "Apple's iPhone 13 proves a hit with consumers",
            link: 'https://www.bloomberg.com/news/articles/2021-10-14/apple-s-iphone-13-proves-a-hit-with-consumers-analysts-say'
        },
        {
            symbol: 'MSFT',
            source: 'CNBC',
            description: 'Microsoft shares rise after earnings beat expectations',
            link: 'https://www.cnbc.com/2021/10/14/microsoft-msft-earnings-q1-2022.html'
        }
    ];

    const handleCancel = () => setBlastPlayDialogOpenFlag(false);

    const processCellForClipboard = (params) =>
    {
        const columnsToExclude = ['qty', 'notional', 'client'];
        if (columnsToExclude.includes(params.column.colId))
            return null;
        return params.value;
    };

    const handleCopyToClipboard = () =>
    {
        if (gridApi)
            gridApi.copySelectedRowsToClipboard();
    };

    const calculateDialogHeight = useCallback(() =>
    {
        if(selectedGenericGridRow && selectedGenericGridRow.contents.length > 0)
        {
            switch (selectedGenericGridRow.contents.length)
            {
                case 1:
                    return 340;
                case 2:
                    return 550;
                case 3:
                    return 755;
            }
        }
        return 340;
    }, [selectedGenericGridRow]);

    const dialogStyles =
    {
        width: '800px',
        height: `${calculateDialogHeight()}px`,
        resize: 'both',
        overflow: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
    };

    return(
        <Dialog aria-labelledby='dialog-title' open={blastPlayDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: dialogStyles }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Prepare blast for clipboard copy</DialogTitle>
            <DialogContent>
                {selectedGenericGridRow && selectedGenericGridRow.contents.includes("FLOWS") && <div className="flows ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '10px'}}>
                    <div className="grid-title">Interesting Flows</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={columnDefs}
                        rowData={flows}
                        onGridReady={onGridReady}
                        rowSelection={'multiple'}
                        rowHeight={25}
                        headerHeight={25}
                        processCellForClipboard={processCellForClipboard}/>
                </div>}
                {selectedGenericGridRow && selectedGenericGridRow.contents.includes("NEWS") && <div className="news ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '8px'}}>
                    <div className="grid-title">Relevant News</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={newsColumnDefs}
                        rowData={news}
                        onGridReady={onGridReady}
                        rowSelection={'multiple'}
                        rowHeight={25}
                        headerHeight={25}
                        processCellForClipboard={processCellForClipboard}/>
                </div>}
                {selectedGenericGridRow && selectedGenericGridRow.contents.includes("IOIs") && <div className="news ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '8px'}}>
                    <div className="grid-title">Relevant IOIs</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={columnDefs}
                        rowData={flows}
                        onGridReady={onGridReady}
                        rowSelection={'multiple'}
                        rowHeight={25}
                        headerHeight={25}
                        processCellForClipboard={processCellForClipboard}/>
                </div>}
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={false} variant='contained' onClick={handleCopyToClipboard}>Copy to Clipboard</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={false} variant='contained' onClick={() => setBlastPlayDialogOpenFlag(false)}>Cancel</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default BlastPlayDialogComponent;
