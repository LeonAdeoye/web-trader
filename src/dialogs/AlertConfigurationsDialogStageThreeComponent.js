import {Card, CardContent, List, ListItem, ListItemButton, ListItemText, TextField} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";

export const AlertConfigurationsDialogStageThreeComponent = ({handleInputChange, alertConfiguration, alertConfigurationsService}) =>
{
    const [, setIsAlertTypeVisible] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState("");
    const listItemRef = useRef(null);

    useEffect(() =>
    {
        const currentListItem = listItemRef.current;
        if (currentListItem)
        {
            currentListItem.addEventListener('click', () => handleAlertTypeSelection({}));
            return () => currentListItem.removeEventListener('click', () => handleAlertTypeSelection('Using useRef'));
        }
    }, []);

    const handleAlertTypeSelection = (alertConfig) =>
    {
        setSelectedAlert(alertConfig);
        alertConfiguration.type = alert.type;
    }

    const handle = (value) => setSelectedAlert(value);

    return (
        <div className={"alert-config-stage-three"}>
            <TextField className="alert-configurations-name" size='small' label='Enter the type of the alert...' value={selectedAlert}
               onFocus={() => setIsAlertTypeVisible(true)} onBlur={() => setIsAlertTypeVisible(false)}
               onChange={(e) => handle(e.target.value)} margin='normal' style={{width: '400px'}}/>
            <Card style={{width:'800px', marginBottom:'10px'}}>
                <CardContent>
                    <List>
                        {alertConfigurationsService.getTypes().filter(config => config.type.toUpperCase().includes(selectedAlert.toUpperCase()) || selectedAlert === "").map((alertConfig, index) => (
                        <ListItem key={index} disablePadding ref={listItemRef}>
                            <ListItemButton>
                                <ListItemText className="customListItemText" primary={alertConfig.type} secondary={alertConfig.expression}
                                  sx={{
                                        '.MuiListItemText-primary':
                                        {
                                            fontSize: '0.9rem',  fontWeight: 'bold'
                                        },
                                        '.MuiListItemText-secondary':
                                        {
                                            fontSize: '0.75rem'
                                        }
                                    }}/>
                            </ListItemButton>
                        </ListItem>))}
                    </List>
                </CardContent>
            </Card>
        </div>
    );
};

