import React, { useState, useEffect, useRef } from "react";
import { TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, Button, FormControlLabel } from "@mui/material";
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
        const loadStrategyXML = async () =>
        {
            try
            {
                const xmlFiles = await window.strategyLoader.getStrategyXML();
                const selectedXml = xmlFiles.find(xml => xml.includes(`name="${algoName}"`));

                if (selectedXml)
                {
                    const parsedJson = parseFIXATDL(selectedXml);
                    setJsonData(parsedJson);
                    loggerService.logInfo(`Loaded FIX ATDL strategy for ${algoName}:`, parsedJson);
                }
                else
                    loggerService.logError(`Algorithm ${algoName} not found in XML files.`);
            }
            catch (err)
            {
                loggerService.logError(`Error loading FIX ATDL XML files: ${err}`);
            }
        };

        loadStrategyXML();
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

    const renderInputControl = (param, control) =>
    {
        const controlStyle = { width: "160px" };
        const fontStyle = { fontSize: "12px" };
        const label = control.label;
        const paramName = control.parameterRef;
        const isRequired = param?.use === "required";

        switch (control.type)
        {
            case "lay:CheckBox_t":
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData[paramName] || false}
                                size="small"
                                required={isRequired}
                                onChange={(event) => handleChange(event, paramName)}
                                sx={{ marginLeft: "10px", width: "10px", height: "15px" }}/>
                        }
                        label={label} // Use extracted label
                        sx={{ "& .MuiTypography-root": { fontSize: "11px"} }}/>);
            case "lay:DropDownList_t":
                return (

                    <FormControl size="small" style={{ width: '160px'}}>
                        <InputLabel style={{ fontSize: '0.75rem' }}>{label}</InputLabel>
                        <Select
                            value={formData[paramName] || ""}
                            required={param.use === "required"}
                            onChange={(event) => handleChange(event, paramName)}
                            sx={{ height: "35px", fontSize: "12px", width: "160px" }}>
                            {param.enumPairs.map(enumOption => (
                                <MenuItem key={enumOption.enumID} value={enumOption.wireValue} sx={{ fontSize: "12px" }}>
                                    {enumOption.enumID}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>);
            case "lay:Clock_t":
                return (
                    <TextField
                        label={label}
                        type="time"
                        size="small"
                        required={isRequired}
                        value={ new Date(formData[paramName] || "").toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
                        style={controlStyle}
                        onChange={(event) => handleChange(event, paramName)}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);
            case "lay:SingleSpinner_t":
                return (
                    <FormControl size="small" style={{ width: '160px'}}>
                        {/*<InputLabel style={{ fontSize: '0.75rem' }}>{label}</InputLabel>*/}
                        <TextField
                        label={label}
                        type="number"
                        size="small"
                        required={isRequired}
                        value={formData[paramName] || ""}
                        onChange={(event) => handleChange(event, paramName)}
                        inputProps={{ step: 1, min: 0 }} // Ensure integer values
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>
                    </FormControl>);
            default:
                return (
                    <TextField
                        label={label}
                        type="text"
                        size="small"
                        required={isRequired}
                        value={formData[paramName] || ""}
                        onChange={(event) => handleChange(event, paramName)}
                        inputProps={{ maxLength: 1 }}
                        style={controlStyle}
                        InputLabelProps={{ shrink: true, style: fontStyle }}
                        InputProps={{ style: fontStyle }}/>);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "660px"}}>
            {jsonData.controls.map(control => {
                const param = jsonData.parameters.find(p => p.name === control.parameterRef);
                return (
                    <FormControl key={control.id} sx={{ width: "160px", marginBottom: "5px"}}>
                        {renderInputControl(param, control)}
                    </FormControl>
                );
            })}

            {errors.length > 0 && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "10px", width: "100%" }}>
                    {errors.map((error, index) => <p key={index}>{error}</p>)}
                </div>
            )}
        </form>
    );

};

export default StrategyComponent;
