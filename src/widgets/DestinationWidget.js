import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import React from "react";
import '../styles/css/main.css';

export const DestinationWidget = ({ handleInputChange, destinationValue, includeInternalDestination }) =>
{
    return (<FormControl size="small" style={{ width: '120px', marginTop: '0px', marginLeft: '0px' , marginRight: '5px'}}>
            <InputLabel style={{ fontSize: '0.75rem' }}>Destination</InputLabel>

            <Select
                value={destinationValue}
                label="Destination"
                onChange={(e) => handleInputChange('destination', e.target.value)}
                style={{ fontSize: '0.75rem' }}>
                <MenuItem value="DSA" style={{ fontSize: '0.75rem' }}>DSA</MenuItem>
                <MenuItem value="DMA" style={{ fontSize: '0.75rem' }}>DMA</MenuItem>
                {includeInternalDestination ? <MenuItem value="INTERNAL" style={{ fontSize: '0.75rem' }}>Internal</MenuItem> : null}
                <MenuItem value="BROKER" style={{ fontSize: '0.75rem' }}>Broker</MenuItem>
                <MenuItem value="CROSS" style={{ fontSize: '0.75rem' }}>Cross</MenuItem>
                <MenuItem value="FACIL" style={{ fontSize: '0.75rem' }}>Facilitation</MenuItem>
            </Select>
        </FormControl>);
}
