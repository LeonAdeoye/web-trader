import {MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageTwoComponent = ({clientService, handleInputChange, alertConfiguration}) =>
{
    return (<div className={"alert-config-stage-two"}>
                <TextField className="alert-desk" style={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the desk'
                           onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk}>
                    <MenuItem value='LT'>Low touch</MenuItem>
                    <MenuItem value='PT'>Program Trading</MenuItem>
                    <MenuItem value='HT'>High Touch</MenuItem>
                    <MenuItem value='FACIL'>Facilitation</MenuItem>
                </TextField>
        </div>);
};
