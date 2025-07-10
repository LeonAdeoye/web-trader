import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import {useRecoilState} from "recoil";
import {sliceDialogDisplayState} from "../atoms/dialog-state";
import {Button,Dialog,DialogContent,DialogTitle,Grid,Paper,Tooltip,Typography,TextField,MenuItem,} from "@mui/material";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {numberFormatter, orderSideStyling} from "../utilities";
import {DestinationWidget } from "../widgets/DestinationWidget";
import {ExchangeRateService} from "../services/ExchangeRateService";

const SliceDialog = ({handleSendSlice}) =>
{
    const [sliceDialogOpenFlag, setSliceDialogOpenFlag] = useRecoilState(sliceDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [sliceOption, setSliceOption] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [childOrders, setChildOrders] = useState([]);
    const [childDestination, setChildDestination] = useState('');
    const [originalParentOrder, setOriginalParentOrder] = useState(null);
    const [parentOrder, setParentOrder] = useState(null);
    const [remainingQty , setRemainingQty] = useState(0);
    const exchangeRateService = useRef(new ExchangeRateService()).current;

    const handleCancel = () =>
    {
        handleClear();
        setSliceDialogOpenFlag(false);
    }

    useEffect(() =>
    {
        if(selectedGenericGridRow && !originalParentOrder)
        {
            setOriginalParentOrder(selectedGenericGridRow);
            setParentOrder(selectedGenericGridRow);
            setRemainingQty(selectedGenericGridRow.pending);
        }
    }, [selectedGenericGridRow, originalParentOrder]);

    const handleClear = useCallback(() =>
    {
        setSliceOption('');
        setInputValue('');
        setChildOrders([]);
        setChildDestination('');
        setRemainingQty(originalParentOrder.pending);
        setParentOrder(prev => ({
            ...prev,
            pending: originalParentOrder.pending,
            residualNotionalValueInLocal: originalParentOrder.residualNotionalValueInLocal
        }));
    }, [originalParentOrder]);

    const handleSend = () =>
    {
        setSliceDialogOpenFlag(false);
        if(handleSendSlice) handleSendSlice(childOrders);
        handleClear();
    };

    const handleInputChange = (field, value) =>
    {
        if(field === 'destination')
            setChildDestination(value);
    }

    const disableSlicing = () =>
    {
        return childDestination === '' || (showInputField && (inputValue === '' || inputValue < 0)) || sliceOption === '' || remainingQty === 0;
    }

    const disableSending = () =>
    {
        return childOrders.length === 0;
    }

    const disableClear = () =>
    {
        return childDestination === '' && childOrders.length === 0 && ((showInputField && (!inputValue || inputValue <= 0)) || !showInputField) && sliceOption === '';
    }

    const handleSlice = useCallback(() =>
    {
        const price = parentOrder.price;
        setRemainingQty(parentOrder.pending);
        const originalQty = parentOrder.quantity;

        let sliceQty = 0;
        if (sliceOption.endsWith('%'))
        {
            const percent = parseFloat(sliceOption);
            sliceQty = Math.floor((percent / 100) * originalQty);
        }
        else if(sliceOption === "Variable Percent")
        {
            const percent = parseFloat(inputValue);
            sliceQty = Math.floor((percent / 100) * originalQty);
        }
        else
            sliceQty = parseInt(inputValue);

        if (sliceQty <= 0 || sliceQty > remainingQty) return;

        const usdPrice = originalParentOrder.settlementCurrency === 'USD' ? originalParentOrder.price : exchangeRateService.convert(originalParentOrder.price, originalParentOrder.settlementCurrency, 'USD');

        const newChild =
        {
            orderId: crypto.randomUUID(),
            parentOrderId: originalParentOrder.orderId,
            slicedQuantity: sliceQty,
            price: price,
            slicedNotionalValue: sliceQty * price,
            percentageOfParentOrder: ((sliceQty / originalQty) * 100).toFixed(2),
            destination: childDestination,
            ownerId: originalParentOrder.ownerId,
            state: 'NEW_ORDER',
            traderInstruction: originalParentOrder.traderInstruction,
            actionEvent: 'SUBMIT_TO_OMS',
            side: originalParentOrder.side,
            instrumentCode: originalParentOrder.instrumentCode,
            arrivalTime: new Date().toLocaleTimeString(),
            arrivalPrice: originalParentOrder.priceType === '2' ? originalParentOrder.price : '0',
            pending: sliceQty,
            executed: '0',
            executedNotionalValueInUSD: '0',
            orderNotionalValueInUSD: (originalParentOrder.priceType === '2' && originalParentOrder.price !== '') ? (sliceQty * usdPrice).toFixed(2) : '0',
            orderNotionalValueInLocal: (originalParentOrder.priceType === '2' && originalParentOrder.price !== '') ? (sliceQty * originalParentOrder.price).toFixed(2) : '0',
            residualNotionalValueInLocal: originalParentOrder.orderNotionalValueInLocal,
            residualNotionalValueInUSD: originalParentOrder.orderNotionalValueInUSD,
            averagePrice: '0'
        };

        const updatedQty = remainingQty - sliceQty;
        setRemainingQty(updatedQty);
        const updatedNotional = updatedQty * price;
        setParentOrder(prev => ({
            ...prev,
            pending: updatedQty,
            residualNotionalValueInLocal: updatedNotional
        }));

        setChildOrders(prev => [...prev, newChild]);
    }, [parentOrder, inputValue, sliceOption, childDestination]);

    const sliceOptions = ["5%", "10%", "20%", "25%", "30%", "50%", "75%", "100%", "Variable Percent", "Variable Quantity"];
    const showInputField = sliceOption === "Variable Percent" || sliceOption === "Variable Quantity";

    const dialogStyles =
    {
        width: '1205px',
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
        { headerName: "Side", field: "side", sortable: true, minWidth: 75, width: 75, filter: true, cellStyle: params => orderSideStyling(params.value)},
        { headerName: "Client", field: "clientDescription", sortable: true, minWidth: 160, width: 160, filter: true },
        { headerName: "Price", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Local price of the instrument', valueFormatter: numberFormatter },
        { headerName: "Quantity", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Total original order quantity', valueFormatter: numberFormatter },
        { headerName: "Remaining Qty", field: "pending", sortable: true, minWidth: 120, width: 120, filter: true, headerTooltip: 'Remaining quantity available to be sliced', valueFormatter: numberFormatter },
        { headerName: "Residual Notional", field: "residualNotionalValueInLocal", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Remaining notional value in local currency', valueFormatter: numberFormatter },
        { headerName: "Destination", field: "destination", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Destination for the child order' },
    ], []);

    const childColumnDefs = useMemo(() =>
    [
        { headerName: "Child Order Id", field: "orderId", sortable: true, minWidth: 225, width: 225, filter: true, headerTooltip: 'Generated GUID for the sliced child order' },
        { headerName: "Destination", field: "destination", sortable: true, minWidth: 150, width: 150, filter: true, headerTooltip: 'Destination for the child order' },
        { headerName: "Price", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Local price of the instrument', valueFormatter: numberFormatter },
        { headerName: "Sliced Notional", field: "slicedNotionalValue", sortable: true, minWidth: 130, width: 130, filter: true, headerTooltip: 'Notional value of the child order in local currency', valueFormatter: numberFormatter },
        { headerName: "% of Parent", field: "percentageOfParentOrder", sortable: true, minWidth: 120, width: 120, filter: false, headerTooltip: 'Percentage this child order represents of the parent order quantity', valueFormatter: numberFormatter },
        { headerName: "Sliced Qty", field: "slicedQuantity", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Quantity of the sliced child order', valueFormatter: numberFormatter },
        { headerName: "Side", field: "side", sortable: true, minWidth: 75, width: 75, filter: true, cellStyle: params => orderSideStyling(params.value), headerTooltip: 'Side of the child order' },
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
                                            disabled={disableClear()}
                                            style={{ marginRight: '5px', fontSize: '0.75rem'}}>Clear</Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<Typography fontSize={12}>Send all slices to selected destination.</Typography>}>
                                    <span>
                                        <Button color="primary" variant='contained' size="small" disabled={disableSending()}
                                             style={{ marginRight: '5px', fontSize: '0.75rem'}} className="dialog-action-button submit"onClick={handleSend}>Send</Button>
                                    </span>
                                </Tooltip>
                                <Tooltip title={<Typography fontSize={12}>Send all slices to selected destination.</Typography>}>
                                    <span>
                                        <Button color="primary" variant="contained" className="dialog-action-button submit" size="small"
                                            disabled={disableSlicing()}
                                            onClick={handleSlice} style={{marginRight: '0px', fontSize: '0.75rem'}}>Slice</Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Paper elevation={4} style={{ padding: '5px', marginBottom: '5px', height: '60px' }}>
                        <GenericGridComponent gridTheme="ag-theme-alpine" rowHeight={22} domLayout="autoHeight" rowIdArray={["orderId"]} columnDefs={parentColumnDefs} gridData={[parentOrder]} style={{ fontSize: '0.75rem' }}/>
                    </Paper>
                    <Paper elevation={4} style={{ padding: '5px', height: '210px'}}>
                        <GenericGridComponent gridTheme="ag-theme-alpine" rowHeight={22} domLayout="autoHeight" rowIdArray={["orderId"]} columnDefs={childColumnDefs} gridData={childOrders.slice(0, 10)} sortModel={{ colId: 'quantity', sort: 'desc' }} style={{ fontSize: '0.75rem' }}/>
                    </Paper>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SliceDialog;
