import {
    Button,
    ButtonGroup,
    FormControl,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Switch,
    TextField
} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";

export const AlertConfigurationsDialogStageTwoComponent = ({handleInputChange}) =>
{
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    return (<div className={"alert-config-stage-two"}>
                <TextField className="alert-configurations-adv-min" size='small' value={alertConfiguration.advMin}
                           onChange={(e) => handleInputChange('advMin', e.target.value)} margin='normal' label='ADV% Min'/>
                <TextField className="alert-configurations-adv-max" size='small' value={alertConfiguration.advMax}
                           onChange={(e) => handleInputChange('advMax', e.target.value)} margin='normal' label='ADV% Max'/>
                <br/>
                <FormControl component="fieldset">
                    <FormGroup row>
                        <FormControlLabel
                            value={alertConfiguration.notionalOrADV}
                            control={<Switch/>} label="OR" labelPlacement="start"
                            onChange={(e) => handleInputChange('notionalOrADV', e.target.checked)}/>
                        <FormControlLabel
                            value={alertConfiguration.notionalAndADV}
                            control={<Switch/>} label="AND" labelPlacement="start"
                            onChange={(e) => handleInputChange('notionalAndADV', e.target.checked)}/>
                    </FormGroup>
                </FormControl>
                <br/>
                <TextField className="alert-configurations-notional-min" size='small' value={alertConfiguration.notionalMin}
                           onChange={(e) => handleInputChange('notionalMin', e.target.value)} margin='normal' label='Notional Min'/>
                <TextField className="alert-configurations-notional-max" size='small' value={alertConfiguration.notionalMax}
                           onChange={(e) => handleInputChange('notionalMax', e.target.value)} margin='normal' label='Notional Max'/>
            </div>);
};
