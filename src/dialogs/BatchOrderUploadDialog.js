import React, {useCallback, useEffect, useState, useRef} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Tooltip, Typography, Box, Alert, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {AgGridReact} from "ag-grid-react";
import {useRecoilState} from "recoil";
import {batchOrderUploadDialogDisplayState} from "../atoms/dialog-state";
import {orderSideStyling} from "../utilities";
import {ServiceRegistry} from "../services/ServiceRegistry";
import Papa from 'papaparse';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {LoggerService} from "../services/LoggerService";

const BatchOrderUploadDialog = ({ closeHandler }) =>
{
    const [batchOrderUploadDialogOpen, setBatchOrderUploadDialogOpen] = useRecoilState(batchOrderUploadDialogDisplayState);
    const [gridData, setGridData] = useState([]);
    const [pasteData, setPasteData] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const loggerService = useRef(new LoggerService(BatchOrderUploadDialog.name)).current;

    useEffect(() =>
    {
        const loadServices = async () =>
        {
            await instrumentService.loadInstruments();
            await clientService.loadClients();
        };
        loadServices();
    }, [instrumentService, clientService]);

    const requiredColumns = ['instrumentCode', 'side', 'clientCode', 'qty', 'price', 'destination', 'instruction'];

    const validateRow = useCallback((row, index) =>
    {
        const errors = [];
        
        // Check required fields
        requiredColumns.forEach(col => 
        {
            if (!row[col] || row[col].toString().trim() === '')
                errors.push(`Row ${index + 1}: ${col} is required`);
        });

        // Validate side
        if (row.side && !['BUY', 'SELL'].includes(row.side.toUpperCase()))
            errors.push(`Row ${index + 1}: side must be BUY or SELL`);

        // Validate numeric fields
        if (row.qty && (isNaN(row.qty) || parseFloat(row.qty) <= 0))
            errors.push(`Row ${index + 1}: qty must be a positive number`);

        if (row.price && (isNaN(row.price) || parseFloat(row.price) <= 0))
            errors.push(`Row ${index + 1}: price must be a positive number`);

        // Validate instrument code exists
        if (row.instrumentCode && !instrumentService.getInstrumentByCode(row.instrumentCode))
            errors.push(`Row ${index + 1}: instrumentCode '${row.instrumentCode}' not found`);

        // Validate client code exists
        if (row.clientCode && !clientService.getClientByCode(row.clientCode))
            errors.push(`Row ${index + 1}: clientCode '${row.clientCode}' not found`);

        return errors;
    }, [instrumentService, clientService]);

    const processData = useCallback((data) =>
    {
        setIsProcessing(true);
        const errors = [];
        const processedData = data.map((row, index) => 
        {
            // Convert array to object with column names
            const rowObj = {
                instrumentCode: row[0] || '',
                side: row[1] || '',
                clientCode: row[2] || '',
                qty: row[3] || '',
                price: row[4] || '',
                destination: row[5] || '',
                instruction: row[6] || ''
            };

            const rowErrors = validateRow(rowObj, index);
            errors.push(...rowErrors);
            
            return {
                ...rowObj,
                side: rowObj.side ? rowObj.side.toUpperCase() : rowObj.side,
                qty: rowObj.qty ? parseFloat(rowObj.qty) : rowObj.qty,
                price: rowObj.price ? parseFloat(rowObj.price) : rowObj.price,
                hasErrors: rowErrors.length > 0
            };
        });

        setGridData(processedData);
        setValidationErrors(errors);
        setIsProcessing(false);
    }, [validateRow]);

    const handlePasteData = useCallback(() =>
    {
        if (!pasteData.trim()) return;

        Papa.parse(pasteData, {
            header: false,
            skipEmptyLines: true,
            complete: (results) =>
            {
                processData(results.data);
            },
            error: (error) =>
            {
                loggerService.logError('CSV parsing error:', error);
                setValidationErrors([`CSV parsing error: ${error.message}`]);
            }
        });
    }, [pasteData, processData]);

    const handleFileUpload = useCallback((event) =>
    {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results) =>
            {
                processData(results.data);
            },
            error: (error) =>
            {
                loggerService.logError('File parsing error:', error);
                setValidationErrors([`File parsing error: ${error.message}`]);
            }
        });

        if (fileInputRef.current)
            fileInputRef.current.value = '';
    }, [processData]);

    const handleClear = useCallback(() =>
    {
        setGridData([]);
        setPasteData('');
        setValidationErrors([]);
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    }, []);

    const handleCancel = useCallback(() =>
    {
        setBatchOrderUploadDialogOpen({open: false, clear: true});
    }, [setBatchOrderUploadDialogOpen]);

    const handleSubmit = useCallback(() =>
    {
        const orders = gridData.map(row => ({
            instrumentCode: row.instrumentCode,
            side: row.side,
            clientCode: row.clientCode,
            quantity: row.qty,
            price: row.price,
            destination: row.destination,
            traderInstruction: row.instruction
        }));

        closeHandler(orders);
        handleClear();
        handleCancel();
    }, [validationErrors, gridData, closeHandler, handleClear, handleCancel]);

    const canSubmit = () => gridData.length > 0 && validationErrors.length === 0;

    const columnDefs = [
        {
            headerName: 'Instrument Code',
            field: 'instrumentCode',
            width: 120,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        },
        {
            headerName: 'Side',
            field: 'side',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                const baseStyle = orderSideStyling(params.value);
                return params.data.hasErrors ? { ...baseStyle, backgroundColor: '#ffebee' } : baseStyle;
            }
        },
        {
            headerName: 'Client Code',
            field: 'clientCode',
            width: 120,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        },
        {
            headerName: 'Qty',
            field: 'qty',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        },
        {
            headerName: 'Price',
            field: 'price',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        },
        {
            headerName: 'Destination',
            field: 'destination',
            width: 120,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        },
        {
            headerName: 'Instruction',
            field: 'instruction',
            width: 150,
            sortable: false,
            filter: false,
            cellStyle: (params) => 
            {
                return params.data.hasErrors ? { backgroundColor: '#ffebee' } : {};
            }
        }
    ];

    useEffect(() =>
    {
        if (batchOrderUploadDialogOpen.clear)
            handleClear();
    }, [batchOrderUploadDialogOpen.clear, handleClear]);

    return (
        <Dialog 
            className="batch-order-upload-dialog"
            aria-labelledby='dialog-title' 
            maxWidth={false} 
            fullWidth={true} 
            open={batchOrderUploadDialogOpen.open} 
            onClose={handleCancel} 
            PaperProps={{ style: { width: '1000px', maxHeight: '90vh' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>
                Batch Order Upload
            </DialogTitle>
            <DialogContent style={{ padding: '10px' }}>
                <Grid container spacing={1} direction="column" style={{ marginTop: '0px' }}>
                    <Grid item>
                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            label="Paste Excel/CSV Data"
                            value={pasteData}
                            onChange={(e) => setPasteData(e.target.value)}
                            placeholder="Paste Excel data or upload a CSV/Excel file. Required columns: instrumentCode, side, clientCode, qty, price, destination, instruction. Side must be BUY or SELL. Qty and Price must be positive numbers."
                            InputLabelProps={{ shrink: true, style: { fontSize: '12px' } }}
                            inputProps={{ style: { fontSize: '12px', padding: '8px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { padding: '4px' } }} />
                    </Grid>
                    {validationErrors.length > 0 && (
                        <div style={{ 
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9999,
                            marginTop: '5px'
                        }}>
                            <Alert
                                severity="error"
                                style={{
                                    backgroundColor: '#8B0000',
                                    color: 'white',
                                    border: '1px solid #DC143C',
                                    borderRadius: '4px',
                                    padding: '12px',
                                    minWidth: '300px',
                                    maxWidth: '500px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                }}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => setValidationErrors([])}
                                        style={{ color: 'white' }}
                                    >
                                        <Close fontSize="inherit" />
                                    </IconButton>
                                }>
                                <div>
                                    {validationErrors.map((error, index) => (
                                        <div key={index} style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                                            • {error}
                                        </div>
                                    ))}
                                </div>
                            </Alert>
                        </div>
                    )}
                    <Grid item style={{ marginTop: '5px' }}>
                        <div 
                            className="ag-theme-alpine" 
                            style={{ 
                                height: '200px', 
                                width: '100%',
                                fontSize: '11px'
                            }}>
                            <AgGridReact
                                rowData={gridData}
                                columnDefs={columnDefs}
                                rowHeight={22}
                                headerHeight={22}
                                suppressRowClickSelection={true}
                                enableCellChangeFlash={false}
                                animateRows={false}
                                enableRangeSelection={true} />
                        </div>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions style={{height: '40px', padding: '3px 8px', marginTop: '0px'}}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}>
                </input>
                <Tooltip title={<Typography fontSize={12}>Process the pasted data and show in grid.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button" 
                            variant="contained" 
                            onClick={handlePasteData}
                            disabled={!pasteData.trim() || isProcessing}
                            size="small"
                            style={{ fontSize: '11px', minWidth: '120px', height: '35px' }}>
                            Process Pasted Data
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Select and upload a CSV/Excel file.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button" 
                            variant="outlined" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            size="small"
                            style={{ fontSize: '11px', minWidth: '80px', height: '35px' }}>
                            Upload File
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Clear all data and start over.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button" 
                            disabled={gridData.length === 0} 
                            variant='contained'
                            onClick={handleClear}
                            size="small"
                            style={{ fontSize: '11px', minWidth: '60px', height: '35px' }}>
                            Clear
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close dialog.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button" 
                            color="primary" 
                            variant='contained' 
                            onClick={handleCancel}
                            size="small"
                            style={{ fontSize: '11px', minWidth: '60px', height: '35px' }}>
                            Cancel
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit all valid orders.</Typography>}>
                    <span>
                        <Button  
                            className="dialog-action-button submit" 
                            color="primary" 
                            disabled={!canSubmit()} 
                            variant='contained' 
                            onClick={handleSubmit}
                            size="small"
                            style={{ fontSize: '11px', minWidth: '120px', height: '35px' }}>
                            Submit Orders ({gridData.length})
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default BatchOrderUploadDialog;
