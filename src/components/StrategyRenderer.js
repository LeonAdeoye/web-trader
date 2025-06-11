import React from "react";
import { TextField, Select, MenuItem, Checkbox, FormControlLabel, InputLabel, FormControl } from "@mui/material";
import {xmlToJson} from "../utilities";

const POV = `<?xml version="1.0" encoding="UTF-8"?>
<Strategies xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Strategy name="POV">
        <Parameters>
            <Parameter name="OrderQty" xsi:type="Double_t" />
            <Parameter name="ParticipationRate" xsi:type="Double_t" />
            <Parameter name="Aggressive" xsi:type="Boolean_t" />
        </Parameters>
        <StrategyLayout>
            <StrategyPanel orientation="VERTICAL">
                <Control ID="OrderQtyCtrl" parameterRef="OrderQty" xsi:type="TextField_t" label="Order Quantity" />
                <Control ID="ParticipationRateCtrl" parameterRef="ParticipationRate" xsi:type="TextField_t" label="Participation Rate (%)" />
                <Control ID="AggressiveCtrl" parameterRef="Aggressive" xsi:type="CheckBox_t" label="Aggressive Execution" />
            </StrategyPanel>
        </StrategyLayout>
    </Strategy>
</Strategies>`

const TWAP = `<?xml version="1.0" encoding="UTF-8"?>
<Strategies xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Strategy name="TWAP">
        <Parameters>
            <Parameter name="OrderQty" xsi:type="Double_t" />
            <Parameter name="StartTime" xsi:type="UtcTimeOnly_t" />
            <Parameter name="EndTime" xsi:type="UtcTimeOnly_t" />
            <Parameter name="Urgency" xsi:type="String_t" />
        </Parameters>
        <StrategyLayout>
            <StrategyPanel orientation="VERTICAL">
                <Control ID="OrderQtyCtrl" parameterRef="OrderQty" xsi:type="TextField_t" label="Order Quantity" />
                <Control ID="StartTimeCtrl" parameterRef="StartTime" xsi:type="Clock_t" label="Start Time" />
                <Control ID="EndTimeCtrl" parameterRef="EndTime" xsi:type="Clock_t" label="End Time" />
                <Control ID="UrgencyCtrl" parameterRef="Urgency" xsi:type="DropDownList_t" label="Urgency">
                    <ListItem EnumID="Low" Value="low" Label="Low" />
                    <ListItem EnumID="Medium" Value="medium" Label="Medium" />
                    <ListItem EnumID="High" Value="high" Label="High" />
                </Control>
            </StrategyPanel>
        </StrategyLayout>
    </Strategy>
</Strategies>`;

const VWAP = `<?xml version="1.0" encoding="UTF-8"?>
<Strategies xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Strategy name="VWAP">
        <Parameters>
            <Parameter name="OrderQty" xsi:type="Double_t" />
            <Parameter name="Side" xsi:type="String_t" />
            <Parameter name="StartTime" xsi:type="UtcTimeOnly_t" />
            <Parameter name="EndTime" xsi:type="UtcTimeOnly_t" />
            <Parameter name="IgnoreOpens" xsi:type="Boolean_t" />
        </Parameters>
        <StrategyLayout>
            <StrategyPanel orientation="VERTICAL">
                <Control ID="OrderQtyCtrl" parameterRef="OrderQty" xsi:type="TextField_t" label="Order Quantity" />
                <Control ID="SideCtrl" parameterRef="Side" xsi:type="DropDownList_t" label="Side">
                    <ListItem EnumID="Buy" Value="1" Label="Buy" />
                    <ListItem EnumID="Sell" Value="2" Label="Sell" />
                </Control>
                <Control ID="StartTimeCtrl" parameterRef="StartTime" xsi:type="Clock_t" label="Start Time" />
                <Control ID="EndTimeCtrl" parameterRef="EndTime" xsi:type="Clock_t" label="End Time" />
                <Control ID="IgnoreOpensCtrl" parameterRef="IgnoreOpens" xsi:type="CheckBox_t" label="Ignore Market Open" />
            </StrategyPanel>
        </StrategyLayout>
    </Strategy>
</Strategies>`;

const jsonData = xmlToJson(TWAP);

const renderControl = (control, key) => {
    const type = control["xsi:type"]; // Correctly access xsi:type
    const { label, ListItem } = control;
    const controlStyle = { width: "120px" }; // Fixed width for controls
    const fontStyle = { fontSize: "12px" }; // Smaller font size for labels and input text

    switch (type) {
        case "TextField_t":
            return (
                <TextField
                    key={key}
                    label={label}
                    size="small"
                    fullWidth
                    variant="outlined"
                    style={controlStyle}
                    InputLabelProps={{ style: fontStyle }}
                    InputProps={{ style: fontStyle }}
                />
            );
        case "DropDownList_t":
            return (
                <FormControl key={key} size="small" style={controlStyle}>
                    <InputLabel style={fontStyle}>{label}</InputLabel>
                    <Select label={label} style={fontStyle}>
                        {ListItem?.map((item, i) => (
                            <MenuItem key={i} value={item.Value} style={fontStyle}>
                                {item.Label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case "Clock_t":
            return (
                <TextField
                    key={key}
                    label={label}
                    type="time"
                    size="small"
                    fullWidth
                    style={controlStyle}
                    InputLabelProps={{ shrink: true, style: fontStyle }}
                    InputProps={{ style: fontStyle }}
                />
            );
        case "CheckBox_t":
            return (
                <FormControlLabel
                    key={key}
                    control={<Checkbox size="small" />}
                    label={<span style={fontStyle}>{label}</span>}
                    style={controlStyle}
                />
            );
        default:
            return null;
    }
};

const StrategyRenderer = () => {
    if (!jsonData || !jsonData.Strategy) return <div>No strategy data available</div>;

    const { Strategy } = jsonData;
    const controls = Strategy.StrategyLayout.StrategyPanel.Control;

    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {controls.map((ctrl, index) => renderControl(ctrl, index))}
            </div>
        </div>
    );
};

export default StrategyRenderer;
