import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {useRecoilState} from "recoil";
import {blastPlayDialogDisplayState} from "../atoms/dialog-state";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Typography} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";


const BlastPlayDialogComponent = ({ onCloseHandler }) =>
{
    const [blastPlayDialogOpenFlag, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [isStarred, setIsStarred] = useState(false);
    const [gridApi, setGridApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    useEffect(() =>
    {
        const clickHandler = (e) =>
        {
            // Use event object 'e' to filter and check if the click is on the ag-Grid header
            if(e.target && e.target.className && e.target.className instanceof String && e.target.className.indexOf('ag-header-cell-label') !== -1)
            {
                // Get column info and perform actions accordingly
                const colId = e.target.getAttribute('col-id');
                if(colId)
                    console.log(`Header Clicked: ${colId}`);
            }
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    }, []);

    const columnDefs = [
        { headerName: 'Name', field: 'name', colId: 'name' },
        { headerName: 'Age', field: 'age', colId: 'age' },
    ];

    const rowData = [
        { name: 'John', age: 25 },
        { name: 'Mike', age: 30 },
        { name: 'Sara', age: 35 },
    ];

    const handleCancel = () => {
        setBlastPlayDialogOpenFlag(false);
    }

    return(
        <Dialog aria-labelledby='dialog-title' open={Boolean(blastPlayDialogOpenFlag)} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Blast</DialogTitle>
            <DialogContent>
                <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        onGridReady={onGridReady}
                    />
                </div>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={false} variant='contained' onClick={() => console.log("clicked")}>Copy to Clipboard</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={false} variant='contained'>Cancel</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default BlastPlayDialogComponent;
