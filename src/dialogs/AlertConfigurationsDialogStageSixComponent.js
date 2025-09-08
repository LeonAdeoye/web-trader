import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";
import {MenuItem, Select, TextField} from "@mui/material";
import React, {useState} from "react";
import '../styles/css/main.css';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from "@mui/material";


export const AlertConfigurationsDialogStageSixComponent = ({handleInputChange}) =>
{
    const daysMap = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5
    };
    const [alertConfiguration] = useRecoilState(alertConfigurationState);
    const [selectedDays, setSelectedDays] = useState(Object.keys(daysMap));
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('16:00');
    const [frequency, setFrequency] = useState('everyMinute');

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
        return `${minuteField} * * * ${daysCron || "*"}`;
    };

    const handleStartTimeChange = (value) =>
    {
        setStartTime(value);
        handleInputChange('frequency', {'cronExpression': generateCronExpression(frequency, selectedDays), 'startTime': startTime, 'endTime': endTime });
    }

    const handleEndTimeChange = (value) =>
    {
        setEndTime(value);
        handleInputChange('frequency', {'cronExpression': generateCronExpression(frequency, selectedDays), 'startTime': startTime, 'endTime': endTime });
    }

    const handleDayChange = (event) =>
    {
        const { value, checked } = event.target;
        setSelectedDays((prev) =>
            checked ? [...prev, value] : prev.filter((day) => day !== value)
        );
        handleInputChange('frequency', {'cronExpression': generateCronExpression(frequency, selectedDays), 'startTime': startTime, 'endTime': endTime });
    };

    const handleFrequencyChange = (value) =>
    {
        setFrequency(value);
        handleInputChange('frequency', {'cronExpression': generateCronExpression(value, selectedDays), 'startTime': startTime, 'endTime': endTime });
    }

    return (
        <div className="alert-config-stage-six">
            <div className="alert-configurations-start-time">
                <TextField size='small' label="Start Time" type="time" value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)} margin='normal'/>
            </div>
            <div className="alert-configurations-end-time">
                <TextField size='small' label="End Time" type="time" value={endTime} onChange={(e) => handleEndTimeChange(e.target.value)} margin='normal'/>
            </div>
            <div className="alert-configurations-frequency">
                <Select size='small' value={frequency} onChange={(e) => handleFrequencyChange(e.target.value)}>
                    <MenuItem value="everyMinute">Every Minute</MenuItem>
                    <MenuItem value="every5Minutes">Every 5 Minutes</MenuItem>
                    <MenuItem value="every10Minutes">Every 10 Minutes</MenuItem>
                    <MenuItem value="every15Minutes">Every 15 Minutes</MenuItem>
                    <MenuItem value="every30Minutes">Every 30 Minutes</MenuItem>
                    <MenuItem value="everyHour">Every Hour</MenuItem>
                </Select>
            </div>
            <div className="alert-configurations-days">
                <FormControl component="fieldset">
                    <FormGroup>
                        {Object.keys(daysMap).map((day) =>
                        (
                            <FormControlLabel
                                key={day}
                                control={
                                    <Checkbox
                                        value={day}
                                        checked={selectedDays.includes(day)}
                                        onChange={handleDayChange}
                                    />
                                }
                                label={day}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </div>
        </div>
    );
}

