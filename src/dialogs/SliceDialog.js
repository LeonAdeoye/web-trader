import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {useRecoilState} from "recoil";
import {sliceDialogDisplayState} from "../atoms/dialog-state";
import {Button,Dialog,DialogContent,DialogTitle,Grid,Paper,Tooltip,Typography,TextField,MenuItem,} from "@mui/material";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {numberFormatter} from "../utilities";
import {DestinationWidget } from "../widgets/DestinationWidget";

const SliceDialog = () =>
{
    const [sliceDialogOpenFlag, setSliceDialogOpenFlag] = useRecoilState(sliceDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [sliceOption, setSliceOption] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [childOrders, setChildOrders] = useState([]);
    const [childDestination, setChildDestination] = useState('');

    const handleCancel = () =>
    {
        handleClear();
        setSliceDialogOpenFlag(false);
    }

    useEffect(() =>
    {
        console.log("selectedGenericGridRow changed: ", JSON.stringify(selectedGenericGridRow));
    }, []);

    const handleClear = useCallback(() =>
    {
        setSliceOption('');
        setInputValue('');
        setChildOrders([]);
        setChildDestination('');
    }, []);

    const handleSend = () =>
    {
        setSliceDialogOpenFlag(false);
        handleClear();
    };

    const handleInputChange = (field, value) =>
    {
        if(field === 'destination')
            setChildDestination(value);
    }

    const handleSlice = useCallback(() =>
    {
        const price = selectedGenericGridRow.price;
        const remainingQty = selectedGenericGridRow.quantity;

        let sliceQty = 0;
        if (sliceOption.endsWith('%'))
        {
            const percent = parseFloat(sliceOption) || parseFloat(inputValue);
            sliceQty = Math.floor((percent / 100) * remainingQty);
        }
        else
            sliceQty = parseInt(inputValue);

        if (sliceQty <= 0 || sliceQty > remainingQty) return;

        const newChild = {
            orderId: crypto.randomUUID(),
            slicedQuantity: sliceQty,
            slicedNotionalValue: sliceQty * price,
            percentageOfParentOrder: ((sliceQty / remainingQty) * 100).toFixed(2),
            destination: childDestination
        };

        setChildOrders(prev => [...prev, newChild]);
    }, [selectedGenericGridRow, inputValue, sliceOption, childDestination]);

    const sliceOptions = ["5%", "10%", "20%", "25%", "30%", "50%", "75%", "100%", "Variable Percent", "Variable Quantity"];
    const showInputField = sliceOption === "Variable Percent" || sliceOption === "Variable Quantity";

    const dialogStyles =
    {
        width: '1130px',
        height: `430px`,
        resize: 'both',
        overflow: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        paddingBottom: '0px'
    };

    const parentColumnDefs = useMemo(() =>
    [
        { headerName: "Parent Order Id", field: "orderId", sortable: true, minWidth: 215, width: 215, filter: true },
        { headerName: "Instrument", field: "instrumentCode", sortable: true, minWidth: 105, width: 105, filter: true },
        { headerName: "Client", field: "clientDescription", sortable: true, minWidth: 160, width: 160, filter: true },
        { headerName: "Price", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Local price of the instrument', valueFormatter: numberFormatter },
        { headerName: "Quantity", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Total original order quantity', valueFormatter: numberFormatter },
        { headerName: "Remaining Qty", field: "quantity", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Remaining quantity available to be sliced', valueFormatter: numberFormatter },
        { headerName: "Remaining Notional", field: "orderNotionalValueInLocal", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Remaining notional value in local currency', valueFormatter: numberFormatter },
        { headerName: "Destination", field: "destination", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Destination for the child order' },
    ], []);

    const childColumnDefs = useMemo(() =>
    [
        { headerName: "Child Order Id", field: "orderId", sortable: true, minWidth: 225, width: 225, filter: true, headerTooltip: 'Generated GUID for the sliced child order' },
        { headerName: "Sliced Qty", field: "slicedQuantity", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Quantity of the sliced child order', valueFormatter: numberFormatter },
        { headerName: "Sliced Notional", field: "slicedNotionalValue", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Notional value of the child order in local currency', valueFormatter: numberFormatter },
        { headerName: "% of Parent", field: "percentageOfParentOrder", sortable: true, minWidth: 120, width: 120, filter: false, headerTooltip: 'Percentage this child order represents of the parent order quantity', valueFormatter: numberFormatter },
        { headerName: "Destination", field: "destination", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Destination for the child order' },
    ], []);

    return (
        <Dialog aria-labelledby='dialog-title' open={sliceDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: dialogStyles }}>
            <DialogTitle id='dialog-title' style={{ fontSize: 16, backgroundColor: '#404040', color: 'white', height: '15px' }}>
                Slice Parent Order
            </DialogTitle>
            <DialogContent>
                <div style={{ padding: '5px', marginLeft: '-22px', marginRight: '-22px', fontSize: '0.75rem' }}>
                    <Paper elevation={4} style={{ padding: '5px', marginBottom: '5px' }}>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item xs={8} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                <DestinationWidget handleInputChange={handleInputChange} destinationValue={childDestination} includeInternalDestination={false}/>
                                <TextField
                                    select size="small" label="Slice Option" value={sliceOption} onChange={(e) => { setSliceOption(e.target.value); setInputValue(''); }}
                                    InputProps={{ style: { fontSize: '0.75rem' } }} InputLabelProps={{ style: { fontSize: '0.75rem' } }} style={{ width: '150px', marginRight: '5px' }}>
                                    {sliceOptions.map(opt => (<MenuItem key={opt} value={opt} style={{ fontSize: '0.75rem' }}>{opt}</MenuItem>))}
                                </TextField>
                                {showInputField && (<TextField size="small" label={sliceOption.includes('Percent') ? "Enter %" : "Enter Qty"} type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                    InputProps={{ style: { fontSize: '0.75rem' } }} InputLabelProps={{ style: { fontSize: '0.75rem' } }} style={{ width: '150px', marginRight: '5px' }}/>)}
                            </Grid>
                            <Grid item xs={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Tooltip title={<Typography fontSize={12}>Cancel and close.</Typography>}>
                                    <span>
                                        <Button color="primary" variant='contained' size="small" style={{ marginRight: '5px', fontSize: '0.75rem'}}
                                            className="dialog-action-button submit" onClick={handleCancel}>Cancel</Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<Typography fontSize={12}>Clear all child order slices.</Typography>}>
                                    <span>
                                        <Button color="primary" variant="contained" className="dialog-action-button submit" size="small" onClick={handleClear}
                                            disabled={childDestination === '' && childOrders.length === 0 && ((showInputField && (!inputValue || inputValue <= 0)) || !showInputField) && sliceOption === '' }
                                            style={{ marginRight: '5px', fontSize: '0.75rem'}}>Clear</Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<Typography fontSize={12}>Send all slices to selected destination.</Typography>}>
                                    <span>
                                        <Button color="primary" variant='contained' size="small" disabled={childOrders.length === 0}
                                             style={{ marginRight: '5px', fontSize: '0.75rem'}} className="dialog-action-button submit"onClick={handleSend}>Send</Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<Typography fontSize={12}>Send all slices to selected destination.</Typography>}>
                                    <span>
                                        <Button color="primary" variant="contained" className="dialog-action-button submit" size="small"
                                            disabled={childDestination === '' || (showInputField && (inputValue === '' || inputValue < 0)) || sliceOption === ''}
                                            onClick={handleSlice} style={{marginRight: '0px', fontSize: '0.75rem'}}>Slice</Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Paper elevation={4} style={{ padding: '5px', marginBottom: '5px', height: '60px' }}>
                        <GenericGridComponent
                            gridTheme="ag-theme-alpine"
                            rowHeight={22}
                            domLayout="autoHeight"
                            rowIdArray={["orderId"]}
                            columnDefs={parentColumnDefs}
                            gridData={[selectedGenericGridRow]}
                            style={{ fontSize: '0.75rem' }}
                        />
                    </Paper>
                    <Paper elevation={4} style={{ padding: '5px', height: '210px'}}>
                        <GenericGridComponent
                            gridTheme="ag-theme-alpine"
                            rowHeight={22}
                            domLayout="autoHeight"
                            rowIdArray={["orderId"]}
                            columnDefs={childColumnDefs}
                            gridData={childOrders.slice(0, 10)}
                            sortModel={{ colId: 'quantity', sort: 'desc' }}
                            style={{ fontSize: '0.75rem' }}/>
                    </Paper>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SliceDialog;
