import React, {useMemo, useCallback, useRef, useState} from 'react';
import {useRecoilState} from "recoil";
import {blastPlayDialogDisplayState} from "../atoms/dialog-state";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, Typography} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {numberFormatter} from "../utilities";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {DataService} from "../services/DataService";
import {FDC3Service} from "../services/FDC3Service";

const BlastPlayDialogComponent = () =>
{
    const dataService = useRef(new DataService()).current;
    const [blastPlayDialogOpenFlag, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const flowsGridApiRef = useRef(null);
    const newsGridApiRef = useRef(null);
    const ioisGridApiRef = useRef(null);
    const [isRowSelected, setIsRowSelected] = useState(false);

    const unwantedHeaders = ['Qty', 'Notional', 'From Client'];
    const unwantedFields = ['qty', 'notional', 'client'];

    const columnDefs = useMemo(() =>
    [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 25},
        { headerName: 'StockCode', field: 'stockCode', width: 100 },
        { headerName: 'Stock Desc.', field: 'stockDescription', width: 155},
        { headerName: 'Side', field: 'side' , width: 90},
        { headerName: 'Qty', field: 'qty' , width: 75, valueFormatter: numberFormatter, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}},
        { headerName: 'Notional', field: 'notional', width: 85, valueFormatter: numberFormatter, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}},
        { headerName: 'From Client', field: 'client', width: 168, cellStyle: { backgroundColor: '#e0e0e0', color:'white'}}
    ], []);

    const newsColumnDefs = useMemo(() =>
        [
            { headerCheckboxSelection: true, checkboxSelection: true, width: 25},
            { headerName: 'Stock code', field: 'stockCode', width: 100},
            { headerName: 'Source', field: 'source', width: 90},
            { headerName: 'Description', field: 'description', width: 390},
            { headerName: 'Date', field: 'date', width: 100},
            { headerName: 'Link', field: 'link', width: 0, hide: true}
        ], []);

    const extractDataFromGrid = (gridApi, columnDefs) =>
    {
        if(!isAnyRowSelected(gridApi))
            return;

        const selectedData = gridApi.current.getSelectedNodes().map(node => node.data);

        const headers = columnDefs
            .map(colDef => colDef.headerName)
            .filter(header => !unwantedHeaders.includes(header))
            .join('\t');

        const rows = selectedData.map(data =>
        {
            return columnDefs
                .filter(colDef => !unwantedFields.includes(colDef.field))
                .map(colDef => data[colDef.field])
                .join('\t');
        });

        return [headers, ...rows].join('\n');
    };

    const extractSelectedDataForClipboard = () =>
    {
        let gridData = [];

        const flowsData = extractDataFromGrid(flowsGridApiRef, columnDefs);
        if(flowsData)
            gridData.push(flowsData);

        const newsData = extractDataFromGrid(newsGridApiRef, newsColumnDefs);
        if(newsData)
            gridData.push(newsData);

        const ioisData = extractDataFromGrid(ioisGridApiRef, columnDefs);
        if(ioisData)
            gridData.push(ioisData);

        if(gridData.length > 0)
            return gridData.filter(data => data.trim() !== '').join('\n\n');
        else
            return "";
    };

    const handleCancel = () =>
    {
        setIsRowSelected(false);
        setBlastPlayDialogOpenFlag(false);
    };

    const handleCopyToClipboard = () =>
    {
        const clipboardData = extractSelectedDataForClipboard();

        if(clipboardData.trim() !== "")
            window.messenger.sendMessageToMain(FDC3Service.createBlastContextShare(clipboardData));

        handleCancel();
    }

    // This is a workaround because getSelectedNodes() does not work as expected.
    const isAnyRowSelected = (gridApiRef) =>
    {
        let result = false;
        try
        {
            result = gridApiRef?.current?.getSelectedNodes()?.length > 0 || false;
        }
        catch (e)
        {
            result = false;
        }
        finally
        {
            return result;
        }
    }

    const handleRowSelectionChange = useCallback(() =>
    {
        const isAnyRowSelectedInFlows = isAnyRowSelected(flowsGridApiRef);
        const isAnyRowSelectedInNews = isAnyRowSelected(newsGridApiRef);
        const isAnyRowSelectedInIoIs = isAnyRowSelected(ioisGridApiRef);

        setIsRowSelected(isAnyRowSelectedInFlows || isAnyRowSelectedInNews || isAnyRowSelectedInIoIs);
    }, []);

    const calculateDialogHeight = useCallback(() =>
    {
        if(selectedGenericGridRow?.contents.length > 0)
        {
            switch (selectedGenericGridRow.contents.length)
            {
                case 1:
                    return 340;
                case 2:
                    return 550;
                case 3:
                    return 755;
                default:
                    return 500;
            }
        }
    }, [selectedGenericGridRow]);

    const dialogStyles =
    {
        width: '800px',
        height: `${calculateDialogHeight()}px`,
        resize: 'both',
        overflow: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        paddingBottom: '5px'
    };

    return(
        <Dialog aria-labelledby='dialog-title' open={blastPlayDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: dialogStyles }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Prepare blast for clipboard copy</DialogTitle>
            <DialogContent>
                {selectedGenericGridRow?.contents.includes("FLOWS") && <div className="flows ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '10px'}}>
                    <div className="grid-title">Interesting Flows</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={columnDefs}
                        rowData={dataService.getData(DataService.FLOWS)}
                        onGridReady={({ api }) => {
                            flowsGridApiRef.current = api;
                            api.deselectAll();
                        }}
                        rowSelection={'multiple'}
                        onSelectionChanged={handleRowSelectionChange}
                        rowHeight={25}
                        headerHeight={25}/>
                </div>}
                {selectedGenericGridRow?.contents.includes("NEWS") && <div className="news ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '8px'}}>
                    <div className="grid-title">Relevant News</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={newsColumnDefs}
                        rowData={dataService.getData(DataService.NEWS)}
                        onGridReady={({ api }) => {
                            newsGridApiRef.current = api;
                            api.deselectAll();
                        }}
                        rowSelection={'multiple'}
                        onSelectionChanged={handleRowSelectionChange}
                        rowHeight={25}
                        headerHeight={25}/>
                </div>}
                {selectedGenericGridRow?.contents.includes("IOIs") && <div className="news ag-theme-alpine" style={{ height: '200px', width: '750px', marginTop: '8px'}}>
                    <div className="grid-title">Relevant IOIs</div>
                    <AgGridReact
                        domLayout='autoHeight'
                        columnDefs={columnDefs}
                        rowData={dataService.getData(DataService.IOIs)}
                        onGridReady={({ api }) => {
                            ioisGridApiRef.current = api;
                            api.deselectAll();
                        }}
                        rowSelection={'multiple'}
                        onSelectionChanged={handleRowSelectionChange}
                        rowHeight={25}
                        headerHeight={25}/>
                </div>}
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Copy selected rows to clipboard then close.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" variant='contained' disabled={!isRowSelected} onClick={handleCopyToClipboard}>Copy to Clipboard</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" variant='contained' onClick={() => setBlastPlayDialogOpenFlag(false)}>Cancel</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default BlastPlayDialogComponent;
