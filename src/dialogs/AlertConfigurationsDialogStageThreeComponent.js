import {TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageThreeComponent = ({handleInputChange, alertConfiguration}) =>
{
    return (<div className={"alert-config-stage-three"}>
                <TextField className="alert-configurations-message-template" size='small' value={alertConfiguration.messageTemplate}
                           onChange={(e) => handleInputChange('messageTemplate', e.target.value)} margin='normal' label='Message Template'
                           style={{marginTop: '10px', marginBottom: '5px', width:'300px', marginRight:'200px'}}/>
            </div>);
};
