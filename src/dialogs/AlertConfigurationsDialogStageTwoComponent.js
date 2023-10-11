import {MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageTwoComponent = ({clientService, handleInputChange, alertConfiguration}) =>
{
    return (<div className={"alert-config-stage-two"}>
                <TextField className="alert-market" style={{marginTop: '10px', marginBottom: '5px', width:'200px', marginRight:'200px'}} size='small' label='Select the market'
                           onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.market}>
                    <MenuItem value='HK'>Hong Kong</MenuItem>
                    <MenuItem value='TK'>Tokyo</MenuItem>
                    <MenuItem value='SG'>Singapore</MenuItem>
                    <MenuItem value='AU'>Australia</MenuItem>
                    <MenuItem value='IN'>India</MenuItem>
                    <MenuItem value='KR'>Korea</MenuItem>
                </TextField>
                <TextField className="alert-configurations-adv-min" size='small' value={alertConfiguration.advMin}
                           onChange={(e) => handleInputChange('advMin', e.target.value)} margin='normal' label='ADV% Min'
                           style={{marginTop: '5px', marginBottom: '5px', width:'150px', marginRight:'10px'}}/>
                <TextField className="alert-configurations-adv-max" size='small' value={alertConfiguration.advMax}
                           onChange={(e) => handleInputChange('advMax', e.target.value)} margin='normal' label='ADV% Max'
                           style={{marginTop: '5px', marginBottom: '5px', width:'150px', marginRight:'200px'}}/>

                <TextField className="alert-configurations-notional-min" size='small' value={alertConfiguration.notionalMin}
                           onChange={(e) => handleInputChange('notionalMin', e.target.value)} margin='normal' label='Notional Min'
                           style={{marginTop: '5px', marginBottom: '5px', width:'150px', marginRight:'10px'}}/>
                <TextField className="alert-configurations-notional-max" size='small' value={alertConfiguration.notionalMax}
                           onChange={(e) => handleInputChange('notionalMax', e.target.value)} margin='normal' label='Notional Max'
                           style={{marginTop: '5px', marginBottom: '5px', width:'150px', marginRight:'200px'}}/>
            </div>);
};
