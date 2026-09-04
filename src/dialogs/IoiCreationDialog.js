import {Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {ioiCreationDialogDisplayState} from "../atoms/dialog-state";
import {InstrumentAutoCompleteWidget} from "../widgets/InstrumentAutoCompleteWidget";
import {TraderIdAutoCompleteWidget} from "../widgets/TraderIdAutoCompleteWidget";
import {SideWidget} from "../widgets/SideWidget";
import {IOIQualifierWidget} from "../widgets/IOIQualifierWidget";
import '../styles/css/main.css';

const defaultIoi =
{
    ric: "",
    instrumentCode: "",
    trader: "",
    quantity: "",
    side: "BUY",
    price: "",
    originalMarket: "",
    originalOrderType: "LIMIT",
    lifeTimeInMinutes: 15,
    comment: "",
    BloombergQualifier: "NONE",
    clientIds: ""
};

const fieldSx = {
    width: "220px",
    marginTop: "0px",
    "& .MuiInputBase-root": { height: "40px" }
};

const IoiCreationDialog = ({closeHandler, instruments, traders, seed}) =>
{
    const [ioiCreationDialogOpen, setIoiCreationDialogOpen] = useRecoilState(ioiCreationDialogDisplayState);
    const [ioi, setIoi] = useState(defaultIoi);

    const handleInputChange = useCallback((name, value) =>
    {
        setIoi(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleInstrumentChange = (name, value) =>
    {
        if (name !== "instrumentCode")
            return handleInputChange(name, value);

        const instrument = (instruments || []).find(item => item.instrumentCode === value);
        setIoi(prev => ({
            ...prev,
            instrumentCode: value || "",
            ric: instrument?.ric || value || "",
            originalMarket: instrument?.exchangeAcronym || ""
        }));
    };

    const handleTraderChange = (name, value) =>
    {
        handleInputChange("trader", name === "ownerId" ? value : value);
    };

    const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== "";

    const canClear = () => ioi.ric !== "" || ioi.trader !== "" || ioi.quantity !== "" || ioi.comment !== "" || ioi.price !== "" || ioi.clientIds !== "";

    const canSubmit = () => hasValue(ioi.instrumentCode) && hasValue(ioi.ric) && hasValue(ioi.trader) && hasValue(ioi.side)
        && hasValue(ioi.quantity) && hasValue(ioi.price) && hasValue(ioi.originalMarket) && hasValue(ioi.originalOrderType)
        && hasValue(ioi.lifeTimeInMinutes) && hasValue(ioi.BloombergQualifier) && hasValue(ioi.clientIds) && hasValue(ioi.comment);

    const handleClear = () => setIoi(defaultIoi);
    const handleCancel = () => setIoiCreationDialogOpen({open: false, clear: true});
    const handleSubmit = () =>
    {
        closeHandler({
            ...ioi,
            BloombergQualifier: ioi.BloombergQualifier === "NONE" ? "" : ioi.BloombergQualifier,
            clientIds: ioi.clientIds ? ioi.clientIds.split(",").map(item => item.trim()).filter(Boolean) : []
        });
        handleClear();
        handleCancel();
    };

    useEffect(() =>
    {
        if (ioiCreationDialogOpen.open && seed && !ioiCreationDialogOpen.clear)
        {
            const instrument = (instruments || []).find(item => item.ric === seed.ric || item.instrumentCode === seed.ric);
            setIoi({
                ric: seed.ric || "",
                instrumentCode: instrument?.instrumentCode || seed.ric || "",
                trader: seed.trader || "",
                quantity: seed.quantity ?? "",
                side: seed.side || "BUY",
                price: seed.price ?? "",
                originalMarket: instrument?.exchangeAcronym || seed.originalMarket || "",
                originalOrderType: seed.originalOrderType || "LIMIT",
                lifeTimeInMinutes: seed.lifeTimeInMinutes ?? 15,
                comment: seed.comment || "",
                BloombergQualifier: seed.BloombergQualifier || seed.bloombergQualifier || "NONE",
                clientIds: Array.isArray(seed.clientIds) ? seed.clientIds.join(",") : (seed.clientIds || "")
            });
        }
        else if (ioiCreationDialogOpen.clear)
            setIoi(defaultIoi);
    }, [ioiCreationDialogOpen, seed, instruments]);

    return (
        <Dialog className="ioi-creation-dialog" aria-labelledby="dialog-title" maxWidth={false} fullWidth={false} open={ioiCreationDialogOpen.open} onClose={handleCancel} PaperProps={{ style: { width: "1040px" } }}>
            <DialogTitle id="dialog-title" style={{fontSize: 15, backgroundColor: "#404040", color: "white", height: "20px"}}>
                {seed ? "Clone IOI" : "Create IOI"}
            </DialogTitle>
            <DialogContent>
                <div className="ioi-dialog-body">
                    <div className="ioi-dialog-row">
                        <InstrumentAutoCompleteWidget instruments={instruments} handleInputChange={handleInstrumentChange} instrumentCode={ioi.instrumentCode} className="ioi-dialog-control" />
                        <TraderIdAutoCompleteWidget traders={traders} handleInputChange={handleTraderChange} ownerId={ioi.trader} className="ioi-dialog-control" />
                        <SideWidget handleSideChange={(event) => handleInputChange("side", event.target.value)} sideValue={ioi.side} className="ioi-dialog-control" />
                        <TextField size="small" label="Quantity" value={ioi.quantity} onChange={(event) => handleInputChange("quantity", event.target.value)}
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control" sx={fieldSx} />
                    </div>
                    <div className="ioi-dialog-row">
                        <TextField size="small" label="Price" value={ioi.price} onChange={(event) => handleInputChange("price", event.target.value)}
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control" sx={fieldSx} />
                        <TextField size="small" label="Market" value={ioi.originalMarket} disabled
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" }, readOnly: true }}
                            className="ioi-dialog-control" sx={fieldSx} />
                        <TextField size="small" select label="Order Type" value={ioi.originalOrderType} onChange={(event) => handleInputChange("originalOrderType", event.target.value)}
                            InputLabelProps={{ style: { fontSize: "0.75rem" } }} SelectProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control" sx={fieldSx}>
                            <MenuItem value="LIMIT" style={{ fontSize: "0.75rem" }}>Limit</MenuItem>
                            <MenuItem value="MARKET" style={{ fontSize: "0.75rem" }}>Market</MenuItem>
                            <MenuItem value="IOC" style={{ fontSize: "0.75rem" }}>IOC</MenuItem>
                            <MenuItem value="STOP_LOSS" style={{ fontSize: "0.75rem" }}>Stop Loss</MenuItem>
                        </TextField>
                        <TextField size="small" label="Lifetime (mins)" value={ioi.lifeTimeInMinutes} onChange={(event) => handleInputChange("lifeTimeInMinutes", event.target.value)}
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control" sx={fieldSx} />
                    </div>
                    <div className="ioi-dialog-row">
                        <IOIQualifierWidget handleQualifierChange={(event) => handleInputChange("BloombergQualifier", event.target.value)} qualifier={ioi.BloombergQualifier} className="ioi-dialog-control" />
                        <TextField size="small" label="Client IDs" value={ioi.clientIds} onChange={(event) => handleInputChange("clientIds", event.target.value)}
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control" sx={fieldSx} />
                        <TextField size="small" label="Comment" value={ioi.comment} onChange={(event) => handleInputChange("comment", event.target.value)}
                            InputLabelProps={{ shrink: true, style: { fontSize: "0.75rem" } }} inputProps={{ style: { fontSize: "0.75rem" } }}
                            className="ioi-dialog-control ioi-dialog-comment" sx={{ ...fieldSx, width: "460px" }} />
                    </div>
                </div>
            </DialogContent>
            <DialogActions style={{height: "48px", padding: "8px 24px 16px 24px"}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={!canClear()} variant="contained" onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close IOI dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant="contained" onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>{canSubmit() ? "Submit IOI." : "All fields are mandatory."}</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" disabled={!canSubmit()} color="primary" variant="contained" onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default IoiCreationDialog;
