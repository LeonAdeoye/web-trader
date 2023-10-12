import {Autocomplete, Card, CardContent, TextField, Typography} from "@mui/material";
import {alertConfigurationsDialogMessageTemplateState} from "../atoms/dialog-state";
import React from "react";
import {useRecoilState} from "recoil";

export const AlertConfigurationsDialogStageThreeComponent = ({handleInputChange, alertConfiguration, alertConfigurationsService}) =>
{
    const [alertType, setAlertType] = React.useState({});
    const [alertConfigurationsDialogMessageTemplate, setAlertConfigurationsDialogMessageTemplate] = useRecoilState(alertConfigurationsDialogMessageTemplateState);


    const findAlertByType = (type) =>
    {
        return alertConfigurationsService.getTypes().find(alert => alert.type === type);
    };

    const handleTypeChange = (_, newValue) =>
    {
        setAlertType(findAlertByType(newValue));
        setAlertConfigurationsDialogMessageTemplate(findAlertByType(newValue)?.messageTemplate || '');
    };

    return (
        <div className={"alert-config-stage-three"}>
            <Autocomplete
                renderInput={(params) => <TextField {...params} label='Select the alert type' />}
                size='small'
                value={alertConfiguration.type}
                className="alert-configurations-type"
                getOptionLabel={(option) => String(option)}
                options={alertConfigurationsService.getTypes().map(alert => alert.type)}
                onChange={handleTypeChange}
                required />
            <Card>
                <CardContent>
                    <div className="alert-configurations-classification">
                        <Typography component="span">
                            {`Classification:   `}
                        </Typography>
                        <Typography className="alert-configurations-value">
                            {alertType?.classification || ''}
                        </Typography>
                    </div>
                    <div className="alert-configurations-explanation">
                        <Typography component="span">
                            {`Explanation:   `}
                        </Typography>
                        <Typography className="alert-configurations-value">
                            {alertType?.explanation || ''}
                        </Typography>
                    </div>
                    <div className="alert-configurations-expression">
                        <Typography component="span">
                            {`Expression:   `}
                        </Typography>
                        <Typography className="alert-configurations-value">
                            {alertType?.expression || ''}
                        </Typography>
                    </div>
                    <div className="alert-configurations-message-template">
                        <Typography component="span">
                            {`Message Template:   `}
                        </Typography>
                        <Typography className="alert-configurations-value">
                            {alertType?.messageTemplate || ''}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

