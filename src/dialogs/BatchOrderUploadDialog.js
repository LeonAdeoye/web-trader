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

    const convertSideToStandard = useCallback((side) =>
    {
        if (!side) return side;
        const upperSide = side.toUpperCase();
        if (upperSide === 'B') return 'BUY';
        if (upperSide === 'S') return 'SELL';
        if (upperSide === 'SS' || upperSide === 'SHORT_SELL' || upperSide === 'SHORT SELL') return 'SHORT_SELL';
        return upperSide;
    }, []);

    const calculateLevenshteinDistance = useCallback((str1, str2) =>
    {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++)
        {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++)
        {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++)
        {
            for (let j = 1; j <= len1; j++)
            {
                if (str2.charAt(i - 1) === str1.charAt(j - 1))
                {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else
                {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }, []);

    const findBestMatch = useCallback((searchTerm, candidates, maxResults = 1) =>
    {
        if (!searchTerm || !candidates || candidates.length === 0) return null;

        const searchUpper = searchTerm.toUpperCase();
        const results = [];

        candidates.forEach(candidate =>
        {
            const candidateUpper = candidate.toUpperCase();
            
            // Exact match gets highest priority
            if (candidateUpper === searchUpper)
            {
                results.push({ value: candidate, score: 0, type: 'exact' });
                return;
            }

            // Starts with match
            if (candidateUpper.startsWith(searchUpper))
            {
                results.push({ value: candidate, score: 1, type: 'starts_with' });
                return;
            }

            // Contains match
            if (candidateUpper.includes(searchUpper))
            {
                results.push({ value: candidate, score: 2, type: 'contains' });
                return;
            }

            // Levenshtein distance for fuzzy matching
            const distance = calculateLevenshteinDistance(searchUpper, candidateUpper);
            const maxLength = Math.max(searchUpper.length, candidateUpper.length);
            const similarity = 1 - (distance / maxLength);
            
            if (similarity > 0.3) // Only consider matches with >30% similarity
            {
                results.push({ value: candidate, score: 3 + distance, type: 'fuzzy' });
            }
        });

        // Sort by score (lower is better) and return the best match
        results.sort((a, b) => a.score - b.score);
        return results.length > 0 ? results[0] : null;
    }, [calculateLevenshteinDistance]);

    const validateRow = useCallback((row, index) =>
    {
        const errors = [];
        requiredColumns.forEach(col => 
        {
            if ((!row[col] || row[col].toString().trim() === '') && col !== 'instruction')
                errors.push(`Row ${index + 1}: ${col} is required`);
        });

        if (row.side && !['BUY', 'SELL', 'SHORT_SELL', 'B', 'S', 'SS', 'SHORT SELL'].includes(row.side.toUpperCase()))
            errors.push(`Row ${index + 1}: side must be BUY, SELL, SHORT_SELL, B, S, SS, or SHORT SELL`);

        if (row.qty !== undefined && row.qty !== null && row.qty !== '')
        {
            if (isNaN(row.qty) || parseFloat(row.qty) <= 0)
                errors.push(`Row ${index + 1}: qty must be a positive number`);
        }

        if (row.price !== undefined && row.price !== null && row.price !== '')
        {
            if (isNaN(row.price) || parseFloat(row.price) <= 0)
                errors.push(`Row ${index + 1}: price must be a positive number`);
        }

        if (row.instrumentCode && !instrumentService.getInstrumentByCode(row.instrumentCode))
        {
            const instruments = instrumentService.getInstruments();
            const instrumentCodes = instruments.map(inst => inst.instrumentCode);
            const bestMatch = findBestMatch(row.instrumentCode, instrumentCodes);
            const errorMsg = bestMatch ? 
                `Row ${index + 1}: instrumentCode '${row.instrumentCode}' not found. Do you mean '${bestMatch.value}'?` :
                `Row ${index + 1}: instrumentCode '${row.instrumentCode}' not found`;
            errors.push(errorMsg);
        }

        if (row.clientCode && !clientService.getClients().find(client => client.clientCode === row.clientCode))
        {
            const clients = clientService.getClients();
            const clientCodes = clients.map(client => client.clientCode);
            const bestMatch = findBestMatch(row.clientCode, clientCodes);
            const errorMsg = bestMatch ? 
                `Row ${index + 1}: clientCode '${row.clientCode}' not found. Do you mean '${bestMatch.value}'?` :
                `Row ${index + 1}: clientCode '${row.clientCode}' not found`;
            errors.push(errorMsg);
        }

        return errors;
    }, [instrumentService, clientService, findBestMatch]);

    const processData = useCallback((data) =>
    {
        setIsProcessing(true);
        const errors = [];
        const processedData = [];
        
        data.forEach((row, index) => 
        {
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
            
            // Only add rows without validation errors to the grid
            if (rowErrors.length === 0)
            {
                processedData.push({
                    ...rowObj,
                    side: convertSideToStandard(rowObj.side),
                    qty: rowObj.qty ? parseFloat(rowObj.qty) : rowObj.qty,
                    price: rowObj.price ? parseFloat(rowObj.price) : rowObj.price,
                    hasErrors: false
                });
            }
        });

        setGridData(processedData);
        setValidationErrors(errors);
        setIsProcessing(false);
    }, [validateRow, convertSideToStandard]);

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
            filter: false
        },
        {
            headerName: 'Side',
            field: 'side',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: (params) => orderSideStyling(params.value)
        },
        {
            headerName: 'Client Code',
            field: 'clientCode',
            width: 120,
            sortable: false,
            filter: false
        },
        {
            headerName: 'Qty',
            field: 'qty',
            width: 80,
            sortable: false,
            filter: false
        },
        {
            headerName: 'Price',
            field: 'price',
            width: 80,
            sortable: false,
            filter: false
        },
        {
            headerName: 'Destination',
            field: 'destination',
            width: 120,
            sortable: false,
            filter: false
        },
        {
            headerName: 'Instruction',
            field: 'instruction',
            width: 150,
            sortable: false,
            filter: false
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
                            placeholder="Paste Excel data or upload a CSV/Excel file. Required columns: instrumentCode, side, clientCode, qty, price, destination, instruction. Side must be BUY, SELL, SHORT_SELL, B, S, SS, or SHORT SELL. Qty and Price must be positive numbers."
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
