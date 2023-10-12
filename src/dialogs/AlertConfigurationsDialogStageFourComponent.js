import {TextField} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogMessageTemplateState} from "../atoms/dialog-state";

export const AlertConfigurationsDialogStageFourComponent = ({handleInputChange, alertConfiguration}) =>
{
    const [alertConfigurationsDialogMessageTemplate, setAlertConfigurationsDialogMessageTemplate] = useRecoilState(alertConfigurationsDialogMessageTemplateState);
    return (<div className={"alert-config-stage-four"}>
                <TextField className="alert-configurations-message-template" size='small' multiline rows='12' value={alertConfigurationsDialogMessageTemplate}
                           onChange={(e) => handleInputChange('messageTemplate', e.target.value)} margin='normal' label='Message Template'/>
            </div>);
};
