import {Autocomplete, MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageOneComponent = ({clientService, handleInputChange, alertConfiguration}) =>
{
    return (
        <div className={"alert-config-stage-one"}>
            <TextField className="alert-configurations-name" size='small' label='Enter the alert name' value={alertConfiguration.alertName}
                       onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'
                       style={{marginTop: '10px', marginBottom: '5px', width:'500px'}} required/>

            <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />} size='small'
                          style={{marginTop: '5px', marginBottom: '5px', width:'500px' }} value={alertConfiguration.clientName} className="alert-client"
                          getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                          onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />

            <TextField className="alert-configurations-desk" style={{marginTop: '5px', marginBottom: '5px', width:'200px', marginRight: '200px'}} size='small' label='Select the desk'
                       onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk} required>
                <MenuItem value='LT'>Low touch</MenuItem>
                <MenuItem value='PT'>Program Trading</MenuItem>
                <MenuItem value='HT'>High Touch</MenuItem>
                <MenuItem value='FACIL'>Facilitation</MenuItem>
            </TextField>

            <TextField className="alert-configurations-side" style={{marginTop: '5px', marginBottom: '5px', width: '200px', marginRight: '200px'}} size='small' label='Select the side'
                       onChange={(event) => handleInputChange('side', event.target.value)} select value={alertConfiguration.side} required>
                <MenuItem value='N/A'>Not Applicable</MenuItem>
                <MenuItem value='Sell'>Sell</MenuItem>
                <MenuItem value='shortSell'>Short Sell</MenuItem>
                <MenuItem value='Buy'>Buy</MenuItem>
            </TextField>

            <TextField className="alert-market" style={{marginTop: '5px', marginBottom: '5px', width:'200px', marginRight:'200px'}} size='small' label='Select the market'
                       onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.market} required>
                <MenuItem value='HK'>Hong Kong</MenuItem>
                <MenuItem value='TK'>Tokyo</MenuItem>
                <MenuItem value='SG'>Singapore</MenuItem>
                <MenuItem value='AU'>Australia</MenuItem>
                <MenuItem value='IN'>India</MenuItem>
                <MenuItem value='KR'>Korea</MenuItem>
            </TextField>
        </div>);
};
