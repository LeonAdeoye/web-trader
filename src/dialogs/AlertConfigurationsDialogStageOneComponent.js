import {Autocomplete, MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageOneComponent = ({clientService, handleInputChange, alertConfiguration}) =>
{
    return (
        <div className={"alert-config-stage-one"}>
            <TextField className="alert-name" size='small' label='Enter the alert name' value={alertConfiguration.alertName}
                       onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'
                       style={{marginTop: '10px', marginBottom: '5px', width:'500px'}} required/>

            <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />} size='small'
                          style={{marginTop: '5px', marginBottom: '5px', width:'500px' }} value={alertConfiguration.clientName} className="alert-client"
                          getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                          onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />

            <TextField className="alert-desk" style={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the desk'
                       onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk}>
                <MenuItem value='LT'>Low touch</MenuItem>
                <MenuItem value='PT'>Program Trading</MenuItem>
                <MenuItem value='HT'>High Touch</MenuItem>
                <MenuItem value='FACIL'>Facilitation</MenuItem>
            </TextField>

            <TextField className="alert-side" stye={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the side'
                       onChange={(event) => handleInputChange('side', event.target.value)} select value={alertConfiguration.side}>
                <MenuItem value='N/A'>Not Applicable</MenuItem>
                <MenuItem value='Sell'>Sell</MenuItem>
                <MenuItem value='shortSell'>Short Sell</MenuItem>
                <MenuItem value='Buy'>Buy</MenuItem>
            </TextField>
        </div>);
};
