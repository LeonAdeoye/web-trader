import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";
import {TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageFiveComponent = ({handleInputChange}) =>
{
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    return (
        <div className={"alert-config-stage-five"}>
            <div className="alert-configurations-email-address">
                <TextField size='small' label='Enter the email address...' value={alertConfiguration.emailAddress}
                           onChange={(e) => handleInputChange('emailAddress', e.target.value)} margin='normal'/>
            </div>
        </div>);
}
