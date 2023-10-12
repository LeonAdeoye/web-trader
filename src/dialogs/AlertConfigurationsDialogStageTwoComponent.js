import {Button, ButtonGroup, MenuItem, TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageTwoComponent = ({handleInputChange, alertConfiguration}) =>
{
    return (<div className={"alert-config-stage-two"}>
                <TextField className="alert-configurations-adv-min" size='small' value={alertConfiguration.advMin}
                           onChange={(e) => handleInputChange('advMin', e.target.value)} margin='normal' label='ADV% Min'/>
                <TextField className="alert-configurations-adv-max" size='small' value={alertConfiguration.advMax}
                           onChange={(e) => handleInputChange('advMax', e.target.value)} margin='normal' label='ADV% Max'/>
                <br/>
                <ButtonGroup variant="contained">
                    <Button className="dialog-action-button AND" color="primary" variant='contained' onClick={() => handleInputChange("notionalAndADV", true)}>And</Button>
                    <Button className="dialog-action-button OR" color="primary" variant='contained' onClick={() => handleInputChange("notionalOrADV", true)}>Or</Button>
                </ButtonGroup>
                <br/>
                <TextField className="alert-configurations-notional-min" size='small' value={alertConfiguration.notionalMin}
                           onChange={(e) => handleInputChange('notionalMin', e.target.value)} margin='normal' label='Notional Min'/>
                <TextField className="alert-configurations-notional-max" size='small' value={alertConfiguration.notionalMax}
                           onChange={(e) => handleInputChange('notionalMax', e.target.value)} margin='normal' label='Notional Max'/>
            </div>);
};
