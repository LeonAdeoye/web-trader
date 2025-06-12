import React, { useState, useEffect, useRef } from "react";
import { TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, Button } from "@mui/material";
import { parseFIXATDL } from "../fixatdl";
import { LoggerService } from "../services/LoggerService";
import '../styles/css/main.css';

const StrategyComponent = ({ algoName }) => {
    const [jsonData, setJsonData] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState([]);
    const loggerService = useRef(new LoggerService(StrategyComponent.name)).current;

    useEffect(() =>
    {
        window.strategyLoader.getStrategyXML().then(xmlFiles =>
        {
            const selectedXml = xmlFiles.find(xml => xml.includes(`name="${algoName}"`));
            if (selectedXml)
            {
                const parsedJson = parseFIXATDL(selectedXml);
                setJsonData(parsedJson);
                loggerService.logInfo(`Loaded FIX ATDL strategy for ${algoName}:`, parsedJson);
            }
            else
                loggerService.logError(`Algorithm ${algoName} not found in XML files.`);

        })
        .catch(err => loggerService.logError(`Error loading FIX ATDL XML files: ${err}`));
    }, [algoName]);

    if (!jsonData) return <p>Loading FIX ATDL strategy for {algoName}...</p>;

    const handleChange = (event, paramName) =>
    {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setFormData({ ...formData, [paramName]: value });
    };

    const handleValidation = () =>
    {
        const validationErrors = [];
        jsonData.validationRules.forEach(rule =>
        {
            rule.conditions.forEach(condition =>
            {
                const fieldValue = formData[condition.field];
                if (condition.operator === "LT" && parseFloat(fieldValue) >= parseFloat(condition.field2))
                    validationErrors.push(rule.errorMessage);
                if (condition.operator === "GT" && parseFloat(fieldValue) <= parseFloat(condition.field2))
                    validationErrors.push(rule.errorMessage);
                if (condition.operator === "NX" && (!fieldValue || fieldValue === ""))
                    validationErrors.push(rule.errorMessage);
                if (condition.operator === "EQ" && fieldValue !== condition.value)
                    validationErrors.push(rule.errorMessage);
            });
        });
        setErrors(validationErrors);
    };

    const handleSubmit = (event) =>
    {
        event.preventDefault();
        handleValidation();
        if (errors.length === 0) alert("Form submitted successfully!");
    };

    const renderInputControl = (param) =>
    {
        const controlStyle = { width: "120px" }; // Fixed width for controls
        const fontStyle = { fontSize: "12px" }; // Smaller font size for labels and input text

        switch (param.type)
        {
            case "Boolean_t":
                return (
                    <Checkbox
                        checked={formData[param.name] || false}
                        label={param.name}
                        size="small"
                        required={param.use === "required"}
                        onChange={(event) => handleChange(event, param.name)}
                        sx={{ width: "10px" }}/>);
            case "DropDownList_t":
                return (
                    <Select
                        value={formData[param.name] || ""}
                        required={param.use === "required"}
                        onChange={(event) => handleChange(event, param.name)}
                        sx={{ height: "5px", fontSize: "12px", width: "120px" }}>
                        {param.enumPairs.map(enumOption => (
                            <MenuItem key={enumOption.enumID} value={enumOption.wireValue} sx={{ fontSize: "12px" }}>
                                {enumOption.enumID}
                            </MenuItem>
                        ))}
                    </Select>);
            case "Clock_t":
            case "UTCTimestamp_t":
                return (
                    <TextField
                        label={param.name}
                        type="time"
                        size="small"
                        required={param.use === "required"}
                        value={ new Date(formData[param.name] || "").toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
                        style={controlStyle}
                        onChange={(event) => handleChange(event, param.name)}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);
            case "Int_t":
                return (
                    <TextField
                        label={param.name}
                        type="number"
                        size="small"
                        required={param.use === "required"}
                        value={formData[param.name] || ""}
                        onChange={(event) => handleChange(event, param.name)}
                        inputProps={{ step: 1, min: 0 }} // Ensure integer values
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);

            case "Qty_t":
                return (
                    <TextField
                        label={param.name}
                        type="number"
                        size="small"
                        required={param.use === "required"}
                        value={formData[param.name] || ""}
                        onChange={(event) => handleChange(event, param.name)}
                        inputProps={{ step: 1, min: 1 }} // Enforce valid quantity
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);
            case "Price_t":
                return (
                    <TextField
                        label={param.name}
                        type="number"
                        size="small"
                        required={param.use === "required"}
                        value={formData[param.name] || ""}
                        onChange={(event) => handleChange(event, param.name)}
                        inputProps={{ step: "0.01", min: 0 }} // Ensures valid price formatting
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);

            case "Char_t":
                return (
                    <TextField
                        label={param.name}
                        type="text"
                        size="small"
                        required={param.use === "required"}
                        value={formData[param.name] || ""}
                        onChange={(event) => handleChange(event, param.name)}
                        inputProps={{ maxLength: 1 }} // Restricts to single char input
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);
            default:
                return (
                    <TextField
                        type="text"
                        variant="outlined"
                        required={param.use === "required"}
                        value={formData[param.name] || ""}
                        onChange={(event) => handleChange(event, param.name)}
                        sx={{ height: "5px", fontSize: "12px", width: "120px" }}/>);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {/*<h2 style={{ fontSize: "13px", marginBottom: "5px", width: "100%" }}>{jsonData.strategyName}</h2>*/}

            {jsonData.parameters.map(param => (
                <FormControl key={param.name} sx={{ width: "120px"}}>
                    {/*<InputLabel sx={{ fontSize: "12px" }}>{param.name}</InputLabel>*/}
                    {renderInputControl(param)}
                </FormControl>
            ))}

            {errors.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "10px", width: "100%" }}>
                    {errors.map((error, index) => <p key={index}>{error}</p>)}
                </div>
            )}
        </form>
    );
};

export default StrategyComponent;
