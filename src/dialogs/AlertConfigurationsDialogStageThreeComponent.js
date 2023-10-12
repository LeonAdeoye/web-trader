import {Autocomplete, Card, CardContent, TextField, Typography} from "@mui/material";
import React from "react";
import {blue} from "@mui/material/colors";

export const AlertConfigurationsDialogStageThreeComponent = ({handleInputChange, alertConfiguration, alertConfigurationsService}) =>
{
    const [alertType, setAlertType] = React.useState({});

    const findAlertByType = (type) =>
    {
        return alertConfigurationsService.getTypes().find(alert => alert.type === type);
    };

    const handleTypeChange = (_, newValue) =>
    {
        setAlertType(findAlertByType(newValue));
    };

    return (
        <div className={"alert-config-stage-three"}>
            <Autocomplete
                renderInput={(params) => <TextField {...params} label='Select the alert type' />}
                size='small'
                style={{marginTop: '10px', marginBottom: '10px', width:'500px' }}
                value={alertConfiguration.type}
                className="alert-type"
                getOptionLabel={(option) => String(option)}
                options={alertConfigurationsService.getTypes().map(alert => alert.type)}
                onChange={handleTypeChange}
                required />
            <Card sx={{ minWidth: 300, minHeight: 300, backgroundColor: blue }}>
                <CardContent>
                    <div style={{marginBottom: '20px'}}>
                        <Typography component="span" sx={{ fontWeight: 'bold', fontSize: 16}}>
                            {`Classification:   `}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: 14}}>
                            {alertType.classification || ''}
                        </Typography>
                    </div>
                    <div style={{marginBottom: '20px'}}>
                        <Typography component="span" sx={{ fontWeight: 'bold', fontSize: 16}}>
                            {`Explanation:   `}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: 14}}>
                            {alertType.explanation || ''}
                        </Typography>
                    </div>
                    <div style={{marginBottom: '20px'}}>
                        <Typography component="span" sx={{ fontWeight: 'bold', fontSize: 16}}>
                            {`Expression:   `}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: 14}}>
                            {alertType.expression || ''}
                        </Typography>
                    </div>
                    <div>
                        <Typography component="span" sx={{ fontWeight: 'bold', fontSize: 16}}>
                            {`Message Template:   `}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: 14}}>
                            {alertType.messageTemplate || ''}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

};

