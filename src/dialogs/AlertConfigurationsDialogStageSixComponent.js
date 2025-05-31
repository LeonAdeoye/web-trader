import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";
import {ToggleButton, ToggleButtonGroup, MenuItem, Select, TextField} from "@mui/material";
import React, {useState} from "react";

import '../styles/css/main.css';


export const AlertConfigurationsDialogStageSixComponent = ({handleInputChange}) =>
{
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    const [selectedDays, setSelectedDays] = useState([]);

    const handleChange = (event, newDays) => setSelectedDays(newDays);

    const daysMap = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5
    };

    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('16:00');
    const [frequency, setFrequency] = useState('everyMinute');
    const handleFrequencyChange = () => handleInputChange('frequency', {'cronExpression': generateCronExpression(frequency, selectedDays), 'startTime': startTime, 'endTime': endTime });

    const generateCronExpression = (frequency, selectedDays) => {
        const daysCron = selectedDays.map(day => daysMap[day]).join(",");
        let minuteField;
        switch (frequency) {
            case "everyMinute":
                minuteField = "*";
                break;
            case "every5Minutes":
                minuteField = "*/5";
                break;
            case "every10Minutes":
                minuteField = "*/10";
                break;
            case "every15Minutes":
                minuteField = "*/15";
                break;
            case "every30Minutes":
                minuteField = "*/30";
                break;
            case "everyHour":
                minuteField = "0";
                break;
            default:
                minuteField = "*";
        }
        alert(`${minuteField} * * * ${daysCron || "*"}`)
        return `${minuteField} * * * ${daysCron || "*"}`;
    };

    return (
        <div className="app-parent-with-action-button">
            <div>
                <TextField label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ margin: "4px" }}/>
                <TextField label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ margin: "4px" }}/>
            </div>

            <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="dropdown" style={{ margin: "4px", width: "274px"}}>
                <MenuItem value="everyMinute">Every Minute</MenuItem>
                <MenuItem value="every5Minutes">Every 5 Minutes</MenuItem>
                <MenuItem value="every10Minutes">Every 10 Minutes</MenuItem>
                <MenuItem value="every15Minutes">Every 15 Minutes</MenuItem>
                <MenuItem value="every30Minutes">Every 30 Minutes</MenuItem>
                <MenuItem value="everyHour">Every Hour</MenuItem>
            </Select>

            <div>
                <ToggleButtonGroup value={selectedDays} onChange={handleChange}>
                    {Object.keys(daysMap).map((day) => (
                        <ToggleButton className="dialog-action-button" key={day} value={day}
                        style={{
                            border: "1px solid #D3D3D3",
                            borderRadius: "8px",
                            marginLeft: "4px",
                            marginTop: "2px",
                        }} onClick={() => handleFrequencyChange()}>
                            {day}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>
        </div>
    );
}
