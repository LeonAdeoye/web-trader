import {Card, CardContent, List, ListItem, ListItemButton, ListItemText, TextField} from "@mui/material";
import React, {useRef, useState} from "react";
import {AlertTypeDetailsCardComponent} from "./AlertTypeDetailsCardComponent";
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";

export const AlertConfigurationsDialogStageThreeComponent = ({handleInputChange, alertConfigurationsService}) =>
{
    const [isAlertTypeVisible, setIsAlertTypeVisible] = useState(false);
    const [selectedAlertType, setSelectedAlertType] = useState('');
    const [selectedAlert, setSelectedAlert] = useState({});
    const listItemRef = useRef(null);
    const [alertConfiguration] = useRecoilState(alertConfigurationState);

    const handleAlertTypeSelection = (alertConfig) =>
    {
        setSelectedAlert(alertConfig);
        setSelectedAlertType(alertConfig.type);
        setIsAlertTypeVisible(false);
        handleInputChange("alertType", alertConfig.type);
    };

    return (
        <div className={"alert-config-stage-three"}>
            <TextField className="alert-configurations-name" size='small' label='Enter the type of the alert...' value={selectedAlertType} style={{width: '400px'}}
               onFocus={() => setIsAlertTypeVisible(true)} margin='normal' onChange={(e) => setSelectedAlertType(e.target.value)} />
            {isAlertTypeVisible ? <Card style={{width:'800px', height: '320px', marginBottom:'10px'}}>
                <CardContent>
                    <List>
                        {alertConfigurationsService.getTypes().filter(config => config.type.toUpperCase().includes(selectedAlertType.toUpperCase()) || selectedAlertType.trim() === "").slice(0,4).map((alertConfig, index) => (
                        <ListItem key={index} disablePadding ref={listItemRef}>
                            <ListItemButton onClick={() => handleAlertTypeSelection(alertConfig)}>
                                <ListItemText className="customListItemText" primary={alertConfig.type} secondary={alertConfig.expression}
                                  sx={{'.MuiListItemText-primary': {fontSize: '0.9rem',  fontWeight: 'bold'}, '.MuiListItemText-secondary': {fontSize: '0.75rem'}}}/>
                            </ListItemButton>
                        </ListItem>))}
                    </List>
                </CardContent>
            </Card>: ""}
            <br/>
            {!isAlertTypeVisible && selectedAlertType ? <AlertTypeDetailsCardComponent alertSelection={selectedAlert}/>: ""}
            <br/>
        </div>
    );
};

