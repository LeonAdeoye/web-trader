import React, {useCallback, useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Tooltip,
    Typography,
    FormControl,
    FormLabel,
    Select,
    MenuItem,
    InputLabel
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {AgGridReact} from "ag-grid-react";
import {useRecoilState} from "recoil";
import {rfqCreationDialogDisplayState} from "../atoms/dialog-state";
import {orderSideStyling} from "../utilities";

const defaultRfqContract = {
    optionType: 'CALL',
    numberOfContracts: 1,
    side: 'BUY',
    underlyingInstrument: '',
    strikePrice: '',
    maturityDate: null
};

const RfqCreationDialog = ({ closeHandler, instruments }) =>
{
    const [rfqCreationDialogOpen, setRfqCreationDialogOpen] = useRecoilState(rfqCreationDialogDisplayState);
    const [rfqContract, setRfqContract] = useState(defaultRfqContract);
    const [contractsGrid, setContractsGrid] = useState([]);
    const [maturityDateLocked, setMaturityDateLocked] = useState(false);

    const canAdd = () => 
        rfqContract.optionType !== '' && 
        rfqContract.numberOfContracts > 0 && 
        rfqContract.numberOfContracts <= 100 &&
        rfqContract.side !== '' && 
        rfqContract.underlyingInstrument !== '' && 
        rfqContract.strikePrice !== '' && 
        rfqContract.maturityDate !== null;

    const canCreate = () => contractsGrid.length > 0;
    
    const canClear = () => 
        contractsGrid.length > 0 || 
        rfqContract.underlyingInstrument !== '' || 
        rfqContract.strikePrice !== '' || 
        rfqContract.maturityDate !== null ||
        rfqContract.numberOfContracts !== 1 ||
        rfqContract.optionType !== 'CALL' ||
        rfqContract.side !== 'BUY';

    const handleInputChange = useCallback((name, value) =>
    {
        setRfqContract(prevData => ({ ...prevData, [name]: value }));
    }, []);



    const handleAddContract = () =>
    {
        if (canAdd())
        {
            const newContract = {
                id: Date.now(),
                ...rfqContract
            };
            setContractsGrid(prev => [...prev, newContract]);
            
            // Lock maturity date after first contract
            if (!maturityDateLocked)
            {
                setMaturityDateLocked(true);
            }
            
            // Reset form except for maturity date and underlying
            setRfqContract(prev => ({
                ...defaultRfqContract,
                underlyingInstrument: prev.underlyingInstrument,
                maturityDate: prev.maturityDate
            }));
        }
    };

    const handleRemoveContract = (contractId) =>
    {
        setContractsGrid(prev => 
        {
            const newGrid = prev.filter(c => c.id !== contractId);
            
            // Unlock maturity date if grid is empty
            if (newGrid.length === 0)
            {
                setMaturityDateLocked(false);
            }
            
            return newGrid;
        });
    };

    const handleClear = () =>
    {
        setRfqContract(defaultRfqContract);
        setContractsGrid([]);
        setMaturityDateLocked(false);
    };

    const handleCancel = () => setRfqCreationDialogOpen({open: false, clear: true});

    const handleCreate = () =>
    {
        if (canCreate())
        {
            // Generate RFQ snippet
            const snippet = generateRfqSnippet();
            closeHandler(snippet);
            handleClear();
            handleCancel();
        }
    };

    const generateRfqSnippet = () =>
    {
        if (contractsGrid.length === 0) return '';

        // Group contracts by side and option type
        const buyCalls = contractsGrid.filter(c => c.side === 'BUY' && c.optionType === 'CALL');
        const sellCalls = contractsGrid.filter(c => c.side === 'SELL' && c.optionType === 'CALL');
        const buyPuts = contractsGrid.filter(c => c.side === 'BUY' && c.optionType === 'PUT');
        const sellPuts = contractsGrid.filter(c => c.side === 'SELL' && c.optionType === 'PUT');

        let snippet = '';

        // Add buy calls
        if (buyCalls.length > 0)
        {
            const quantities = buyCalls.map(c => c.numberOfContracts).join(',');
            snippet += `+${quantities}C `;
        }

        // Add sell calls
        if (sellCalls.length > 0)
        {
            const quantities = sellCalls.map(c => c.numberOfContracts).join(',');
            snippet += `-${quantities}C `;
        }

        // Add buy puts
        if (buyPuts.length > 0)
        {
            const quantities = buyPuts.map(c => c.numberOfContracts).join(',');
            snippet += `+${quantities}P `;
        }

        // Add sell puts
        if (sellPuts.length > 0)
        {
            const quantities = sellPuts.map(c => c.numberOfContracts).join(',');
            snippet += `-${quantities}P `;
        }

        // Add strike prices
        const strikes = contractsGrid.map(c => c.strikePrice).join(',');
        snippet += `${strikes} `;

        // Add maturity date (all contracts share same date)
        const maturityDate = contractsGrid[0].maturityDate;
        const day = maturityDate.getDate().toString().padStart(2, '0');
        const month = maturityDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const year = maturityDate.getFullYear().toString().slice(-2);
        const formattedDate = `${day}${month}${year}`;
        snippet += `${formattedDate} `;

        // Add underlying instruments
        const underlyings = contractsGrid.map(c => c.underlyingInstrument).join(',');
        snippet += underlyings;

        return snippet;
    };

    const columnDefs = [
        {
            headerName: 'Option Type',
            field: 'optionType',
            width: 100,
            sortable: false,
            filter: false,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Number of Contracts',
            field: 'numberOfContracts',
            width: 140,
            sortable: false,
            filter: false,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Side',
            field: 'side',
            width: 80,
            sortable: false,
            filter: false,
            cellStyle: params => ({
                ...orderSideStyling(params.value),
                textAlign: 'center'
            })
        },
        {
            headerName: 'Underlying Instrument',
            field: 'underlyingInstrument',
            width: 150,
            sortable: false,
            filter: false,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Strike Price',
            field: 'strikePrice',
            width: 95,
            sortable: false,
            filter: false,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Maturity Date',
            field: 'maturityDate',
            width: 110,
            sortable: false,
            filter: false,
            valueFormatter: (params) => params.value ? params.value.toLocaleDateString() : '',
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Actions',
            field: 'actions',
            width: 75,
            sortable: false,
            filter: false,
            cellStyle: { textAlign: 'center' },
            cellRenderer: (params) => (
                <Tooltip title="Remove this contract from the RFQ">
                    <DeleteIcon
                        onClick={() => handleRemoveContract(params.data.id)}
                        style={{
                            cursor: 'pointer',
                            color: '#404040',
                            height: '20px'
                        }}
                    />
                </Tooltip>
            )
        }
    ];

    useEffect(() =>
    {
        if (rfqCreationDialogOpen.clear)
        {
            handleClear();
        }
    }, [rfqCreationDialogOpen.clear]);

    return (
        <Dialog 
            className="rfq-creation-dialog"
            aria-labelledby='dialog-title' 
            maxWidth={false} 
            fullWidth={true} 
            open={rfqCreationDialogOpen.open} 
            onClose={handleCancel} 
            PaperProps={{ style: { width: '800px' } }}
        >
            <DialogTitle 
                id='dialog-title' 
                style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}
            >
                Create RFQ
            </DialogTitle>
            <DialogContent>
                                 <Grid container spacing={1} direction="column" style={{ marginTop: '10px' }}>
                                                                {/* Top Row: Option Type, Strike Price, Number of Contracts, Add Button */}
                     <Grid item container spacing={1} alignItems="flex-end">
                         <Grid item xs={3}>
                             <FormControl size="small">
                                 <ButtonGroup 
                                     variant="contained" 
                                     aria-label="Option type selection"
                                     size="small"
                                 >
                                                                         <Button 
                                         onClick={() => handleInputChange('optionType', 'CALL')}
                                         style={{ 
                                             backgroundColor: rfqContract.optionType === 'CALL' ? '#b71c1c' : '#ffcdd2',
                                             color: rfqContract.optionType === 'CALL' ? 'white' : '#666',
                                             fontSize: '11px',
                                             padding: '6px 12px',
                                             minWidth: '50px',
                                             height: '40px',
                                             textTransform: 'none'
                                         }}
                                     >
                                         Call
                                     </Button>
                                     <Button 
                                         onClick={() => handleInputChange('optionType', 'PUT')}
                                         style={{ 
                                             backgroundColor: rfqContract.optionType === 'PUT' ? '#e65100' : '#ffe0b2',
                                             color: rfqContract.optionType === 'PUT' ? 'white' : '#666',
                                             fontSize: '11px',
                                             padding: '6px 12px',
                                             minWidth: '50px',
                                             height: '40px',
                                             textTransform: 'none'
                                         }}
                                     >
                                         Put
                                     </Button>
                                </ButtonGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                size="small"
                                label="Strike Price"
                                type="number"
                                value={rfqContract.strikePrice}
                                onChange={(e) => handleInputChange('strikePrice', e.target.value)}
                                style={{ width: '100%' }}
                                InputLabelProps={{ shrink: true, style: { fontSize: '12px' } }}
                                inputProps={{ style: { fontSize: '12px' } }}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                size="small"
                                label="Number of Contracts"
                                type="number"
                                value={rfqContract.numberOfContracts}
                                onChange={(e) => handleInputChange('numberOfContracts', parseInt(e.target.value) || 1)}
                                style={{ width: '100%' }}
                                InputLabelProps={{ shrink: true, style: { fontSize: '12px' } }}
                                inputProps={{ min: 1, max: 100, style: { fontSize: '12px' } }}
                            />
                        </Grid>
                                                 <Grid item xs={3}>
                             {contractsGrid.length < 10 && canAdd() && (
                                 <Button
                                     className="dialog-action-button"
                                     variant="contained"
                                     onClick={handleAddContract}
                                     style={{ 
                                         height: '35px'
                                     }}
                                                                   >
                                      Add Leg
                                  </Button>
                             )}
                         </Grid>
                    </Grid>

                                           {/* Bottom Row: Side, Maturity Date, Underlying Instrument */}
                      <Grid item container spacing={1} alignItems="flex-end">
                          <Grid item xs={3}>
                              <FormControl size="small">
                                  <ButtonGroup 
                                      variant="contained" 
                                      aria-label="Side selection"
                                      size="small"
                                  >
                                                                           <Button 
                                          onClick={() => handleInputChange('side', 'BUY')}
                                          style={{ 
                                              backgroundColor: rfqContract.side === 'BUY' ? '#0d47a1' : '#bbdefb',
                                              color: rfqContract.side === 'BUY' ? 'white' : '#666',
                                              fontSize: '11px',
                                              padding: '6px 12px',
                                              minWidth: '50px',
                                              height: '40px',
                                              textTransform: 'none'
                                          }}
                                      >
                                          Buy
                                      </Button>
                                      <Button 
                                          onClick={() => handleInputChange('side', 'SELL')}
                                          style={{ 
                                              backgroundColor: rfqContract.side === 'SELL' ? '#1b5e20' : '#c8e6c9',
                                              color: rfqContract.side === 'SELL' ? 'white' : '#666',
                                              fontSize: '11px',
                                              padding: '6px 12px',
                                              minWidth: '50px',
                                              height: '40px',
                                              textTransform: 'none'
                                          }}
                                      >
                                          Sell
                                      </Button>
                                 </ButtonGroup>
                             </FormControl>
                         </Grid>
                         <Grid item xs={3}>
                             <TextField
                                 size="small"
                                 label="Maturity Date"
                                 type="date"
                                 value={rfqContract.maturityDate ? rfqContract.maturityDate.toISOString().split('T')[0] : ''}
                                 onChange={(e) => handleInputChange('maturityDate', new Date(e.target.value))}
                                 disabled={maturityDateLocked}
                                 style={{ width: '100%' }}
                                 InputLabelProps={{ shrink: true, style: { fontSize: '12px' } }}
                                 inputProps={{ style: { fontSize: '12px' } }}
                             />
                         </Grid>
                         <Grid item xs={3}>
                             <FormControl size="small" style={{ width: '100%' }}>
                                 <InputLabel style={{ fontSize: '12px' }}>Underlying Instrument</InputLabel>
                                 <Select
                                     value={rfqContract.underlyingInstrument}
                                     onChange={(e) => handleInputChange('underlyingInstrument', e.target.value)}
                                     label="Underlying Instrument"
                                     style={{ fontSize: '12px' }}
                                 >
                                     {instruments.map((instrument) => (
                                         <MenuItem key={instrument.instrumentCode} value={instrument.instrumentCode} style={{ fontSize: '12px' }}>
                                             {instrument.instrumentCode}
                                         </MenuItem>
                                     ))}
                                 </Select>
                             </FormControl>
                         </Grid>
                     </Grid>

                    
 
                     {/* Contracts Grid */}
                     <Grid item style={{ marginTop: '1px' }}>
                         <div 
                             className="ag-theme-alpine" 
                             style={{ 
                                 height: '180px', 
                                 width: '100%',
                                 fontSize: '11px'
                             }}
                         >
                            <AgGridReact
                                rowData={contractsGrid}
                                columnDefs={columnDefs}
                                rowHeight={22}
                                headerHeight={22}
                                suppressRowClickSelection={true}
                                enableCellChangeFlash={false}
                                animateRows={false}
                            />
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                                 <Tooltip title={<Typography fontSize={12}>Clear all entered values and the RFQ option legs in the grid.</Typography>}>
                     <span>
                         <Button 
                             className="dialog-action-button" 
                             disabled={!canClear()} 
                             variant='contained' 
                             onClick={handleClear}
                         >
                             Clear
                         </Button>
                     </span>
                 </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close RFQ creation dialog window.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button" 
                            color="primary" 
                            variant='contained' 
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Create the RFQ option legs added to the grid.</Typography>}>
                    <span>
                        <Button 
                            className="dialog-action-button submit" 
                            color="primary" 
                            disabled={!canCreate()} 
                            variant='contained' 
                            onClick={handleCreate}
                        >
                            Create
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default RfqCreationDialog;
