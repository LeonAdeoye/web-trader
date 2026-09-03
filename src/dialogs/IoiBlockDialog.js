import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {ioiBlockDialogDisplayState} from "../atoms/dialog-state";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {TraderIdAutoCompleteWidget} from "../widgets/TraderIdAutoCompleteWidget";
import '../styles/css/main.css';

const IoiBlockDialog = ({traders, instruments, exchanges, onBlock, onUnblock}) =>
{
    const [open, setOpen] = useRecoilState(ioiBlockDialogDisplayState);
    const [blockType, setBlockType] = useState("trader");
    const [trader, setTrader] = useState("");
    const [stock, setStock] = useState("");
    const [market, setMarket] = useState("");

    const selectedValue = () =>
    {
        if (blockType === "trader")
            return trader;
        if (blockType === "stock")
            return stock;
        return market;
    };

    const canSubmit = () => selectedValue() !== "";

    const handleClose = () => setOpen(false);

    const handleBlock = async () =>
    {
        if (!canSubmit())
            return;
        await onBlock(blockType, selectedValue());
        handleClose();
    };

    const handleUnblock = async () =>
    {
        if (!canSubmit())
            return;
        await onUnblock(blockType, selectedValue());
        handleClose();
    };

    useEffect(() =>
    {
        if (!open)
        {
            setTrader("");
            setStock("");
            setMarket("");
            setBlockType("trader");
        }
    }, [open]);

    return (
        <Dialog className="ioi-creation-dialog" aria-labelledby="dialog-title" maxWidth={false} open={open} onClose={handleClose} PaperProps={{ style: { width: "380px" } }}>
            <DialogTitle id="dialog-title" style={{fontSize: 15, backgroundColor: "#404040", color: "white", height: "20px"}}>Block IOIs</DialogTitle>
            <DialogContent>
                <Grid container spacing={1} direction="column" style={{ marginTop: "8px" }}>
                    <Grid item>
                        <TextField size="small" select label="Block by" value={blockType} onChange={(event) => setBlockType(event.target.value)}
                            InputLabelProps={{ style: { fontSize: "0.75rem" } }} SelectProps={{ style: { fontSize: "0.75rem" } }} fullWidth>
                            <MenuItem value="trader" style={{ fontSize: "0.75rem" }}>Trader</MenuItem>
                            <MenuItem value="stock" style={{ fontSize: "0.75rem" }}>Stock</MenuItem>
                            <MenuItem value="market" style={{ fontSize: "0.75rem" }}>Market</MenuItem>
                        </TextField>
                    </Grid>
                    {blockType === "trader" && (
                        <Grid item>
                            <TraderIdAutoCompleteWidget traders={traders} handleInputChange={(name, value) => setTrader(value)} ownerId={trader} className="ioi-block-trader" />
                        </Grid>
                    )}
                    {blockType === "stock" && (
                        <Grid item>
                            <InstrumentAutoCompleteWidget instruments={instruments} handleInputChange={(name, value) => setStock(value)} instrumentCode={stock} className="ioi-block-stock" />
                        </Grid>
                    )}
                    {blockType === "market" && (
                        <Grid item>
                            <TextField size="small" select label="Market" value={market} onChange={(event) => setMarket(event.target.value)}
                                InputLabelProps={{ style: { fontSize: "0.75rem" } }} SelectProps={{ style: { fontSize: "0.75rem" } }} fullWidth>
                                {(exchanges || []).map(exchange => (
                                    <MenuItem key={exchange.exchangeAcronym} value={exchange.exchangeAcronym} style={{ fontSize: "0.75rem" }}>{exchange.exchangeAcronym}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions style={{height: "35px"}}>
                <Tooltip title={<Typography fontSize={12}>Close dialog.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" variant="contained" onClick={handleClose}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Remove this block.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={!canSubmit()} variant="contained" onClick={handleUnblock}>Unblock</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Block IOIs matching this selection.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" disabled={!canSubmit()} variant="contained" onClick={handleBlock}>Block</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default IoiBlockDialog;
