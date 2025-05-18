import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";
import {TextField} from "@mui/material";
import React from "react";

export const AlertConfigurationsDialogStageFiveComponent = ({handleInputChange}) =>
{
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    const handleEmailAddressChange = (value) =>
    {
        if(value.endsWith('@gmail.com'))
            handleInputChange('emailAddress', value);
        else
            alert('Email address must end with @gmail.com');
    }

    return (<TextField className="alert-configurations-email-address" size='small' label='Enter the email address...' value={alertConfiguration.emailAddress}
               onChange={(e) => handleEmailAddressChange(e.target.value)} margin='normal'/>);
}
