import {Autocomplete, MenuItem, TextField} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";
import {useEffect, useRef} from "react";
import { ServiceRegistry } from "../services/ServiceRegistry";

export const AlertConfigurationsDialogStageOneComponent = ({handleInputChange}) =>
{
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const [alertConfiguration, setAlertConfiguration] = useRecoilState(alertConfigurationState);

    useEffect(() =>
    {
        const loadClientAsync = async () => await clientService.loadClients();
        loadClientAsync();
    }, []);

    return (
        <div className={"alert-config-stage-one"}>
            <TextField className="alert-configurations-name" size='small' label='Enter the name of the new alert...' value={alertConfiguration.alertName}
                   onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'/>
            <br/>
            <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />}
                  value={alertConfiguration.clientName || null} className="alert-configurations-client" size='small' required
                  getOptionLabel={(option) => String(option)}
                  options={(clientService.getClients() || []).map(client => client.clientName)}
                  isOptionEqualToValue={(option, value) => option.clientId === value.clientId}
                  onChange={(_, newValue) => handleInputChange('clientName', newValue.clientName)}/>
            <TextField className="alert-configurations-desk"  size='small' label='Select the desk' select value={alertConfiguration.desk}
                   onChange={(event) => handleInputChange('desk', event.target.value)}>
                <MenuItem value='ALL'>All Desks</MenuItem>
                <MenuItem value='LT'>Low Touch</MenuItem>
                <MenuItem value='PT'>Program Trading</MenuItem>
                <MenuItem value='HT'>High Touch</MenuItem>
                <MenuItem value='FACIL'>Facilitation</MenuItem>
            </TextField>
            <br/>
            <TextField className="alert-configurations-side"  size='small' label='Select the side' select value={alertConfiguration.side}
                       onChange={(event) => handleInputChange('side', event.target.value)}>
                <MenuItem value='N/A'>Not Applicable</MenuItem>
                <MenuItem value='Sell'>Sell</MenuItem>
                <MenuItem value='ShortSell'>Short Sell</MenuItem>
                <MenuItem value='Buy'>Buy</MenuItem>
            </TextField>
            <br/>
            <TextField className="alert-configurations-market"  size='small' label='Select the market' select value={alertConfiguration.market}
                       onChange={(event) => handleInputChange('market', event.target.value)}>
                <MenuItem value='ALL'>All Markets</MenuItem>
                <MenuItem value='HK'>Hong Kong</MenuItem>
                <MenuItem value='TK'>Tokyo</MenuItem>
                <MenuItem value='SG'>Singapore</MenuItem>
                <MenuItem value='AU'>Australia</MenuItem>
                <MenuItem value='IN'>India</MenuItem>
                <MenuItem value='KR'>Korea</MenuItem>
            </TextField>
            <br/>
            <TextField className="alert-configurations-priority"  size='small' label='Select the priority' select value={alertConfiguration.priority}
                       onChange={(event) => handleInputChange('priority', event.target.value)}>
                <MenuItem value='High'>High</MenuItem>
                <MenuItem value='Medium'>Medium</MenuItem>
                <MenuItem value='Low'>Low</MenuItem>
            </TextField>
        </div>);
};
