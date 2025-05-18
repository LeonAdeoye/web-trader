import {TextField} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";

export const AlertConfigurationsDialogStageFourComponent = ({handleInputChange}) =>
{
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    return (<div className={"alert-config-stage-four"}>
                <TextField className="alert-configurations-message-template" size='small' multiline rows='12' value={alertConfiguration.messageTemplate}
                           onChange={(e) => handleInputChange('messageTemplate', e.target.value)} margin='normal' label='Message Template'/>
            </div>);
};
