import {Autocomplete, MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageOneComponent = ({clientService, handleInputChange, alertConfiguration}) =>
{
    return (<div className={"alert-config-stage-one"}>
            <TextField className="alert-configurations-name" size='small' label='Enter the name of the new alert...' value={alertConfiguration.alertName}
                       onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'/>

            <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />} size='small'
                           value={alertConfiguration.clientName} className="alert-configurations-client"
                          getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                          onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />

            <TextField className="alert-configurations-desk"  size='small' label='Select the desk'
                       onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk}>
                <MenuItem value='ALL'>All Desks</MenuItem>
                <MenuItem value='LT'>Low Touch</MenuItem>
                <MenuItem value='PT'>Program Trading</MenuItem>
                <MenuItem value='HT'>High Touch</MenuItem>
                <MenuItem value='FACIL'>Facilitation</MenuItem>
            </TextField>

            <TextField className="alert-configurations-side"  size='small' label='Select the side'
                       onChange={(event) => handleInputChange('side', event.target.value)} select value={alertConfiguration.side}>
                <MenuItem value='N/A'>Not Applicable</MenuItem>
                <MenuItem value='Sell'>Sell</MenuItem>
                <MenuItem value='shortSell'>Short Sell</MenuItem>
                <MenuItem value='Buy'>Buy</MenuItem>
            </TextField>

            <TextField className="alert-configurations-market"  size='small' label='Select the market'
                       onChange={(event) => handleInputChange('market', event.target.value)} select value={alertConfiguration.market}>
                <MenuItem value='ALL'>All Markets</MenuItem>
                <MenuItem value='HK'>Hong Kong</MenuItem>
                <MenuItem value='TK'>Tokyo</MenuItem>
                <MenuItem value='SG'>Singapore</MenuItem>
                <MenuItem value='AU'>Australia</MenuItem>
                <MenuItem value='IN'>India</MenuItem>
                <MenuItem value='KR'>Korea</MenuItem>
            </TextField>
            <TextField className="alert-configurations-priority"  size='small' label='Select the priority'
                       onChange={(event) => handleInputChange('priority', event.target.value)} select value={alertConfiguration.priority}>
                <MenuItem value='High'>High</MenuItem>
                <MenuItem value='Medium'>Medium</MenuItem>
                <MenuItem value='Low'>Low</MenuItem>
            </TextField>
        </div>);
};
