import * as React from 'react';
import {isEmptyString, transformLocalDataTime} from "../utilities";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useMemo, useRef} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {LoggerService} from "../services/LoggerService";
import {Button, ThemeProvider, Tooltip, Typography} from "@mui/material";
import appTheme from "../components/appTheme";
import '../styles/css/main.css';
import ConfigurationDialog from "../dialogs/ConfigurationDialog";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {configDialogDisplayState} from "../atoms/dialog-state";
import {useRecoilState} from "recoil";
import TitleBarComponent from "../components/TitleBarComponent";

export const ConfigsApp = () =>
{
    const [loggedInUser, setLoggedInUser] = useState('');
    const [gridData, setGridData] = useState([]);

    const configurationService = useRef(new ConfigurationService()).current;
    const loggerService = useRef(new LoggerService(ConfigsApp.name)).current;

    const [, setConfigDialogOpenFlag] = useRecoilState(configDialogDisplayState);
    const [selectedGenericGridRow, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const windowId = useMemo(() => window.command.getWindowId("Configs"), []);
    const columnDefs = useMemo(() => ([
        { headerName: "Id", field: 'id', hide: true },
        { headerName: "Owner", field: 'owner', sortable: true, minWidth: 100, width: 130 },
        { headerName: "Key", field: 'key', sortable: true, minWidth: 150, width: 200 },
        { headerName: "Value", field: 'value', sortable: true, minWidth: 200, width: 470 },
        { headerName: "Last Updated By", field: 'lastUpdatedBy', sortable: true, minWidth: 100, maxWidth: 170, width: 170 },
        { headerName: "Last Updated On", field: 'lastUpdatedOn', sortable: true, minWidth: 200, maxWidth: 200, width: 200, valueGetter: (params) =>
        {
            let timestamp = Number((params.data["lastUpdatedOn"]));
            return transformLocalDataTime(timestamp.valueOf());
        }}]), []);

    useEffect(() =>
    {
        const loadOwner = async () =>  setLoggedInUser(await window.configurations.getLoggedInUserId());
    }, [])

    useEffect(() =>
    {
        async function loadAllConfigurations()
        {
            await configurationService.loadConfigurations("system");

            if(!isEmptyString(loggedInUser))
                await configurationService.loadConfigurations(loggedInUser);
        }

        loadAllConfigurations()
            .then(() => setGridData(configurationService.getCachedConfigs()))
            .catch((error) => loggerService.logError(error));

    }, [loggedInUser])

    const addConfiguration = async () => setConfigDialogOpenFlag(true);

    const saveConfiguration = async (owner, key, value) =>
    {
        try
        {
            if(isEmptyString(owner) || isEmptyString(key) || isEmptyString(value))
                return;

            loggerService.logInfo(`User ${loggedInUser} adding new configuration: owner=${owner}, key=${key}, value=${value}`);
            configurationService.addNewConfiguration(owner, key, value)
                .then((id) => setGridData([...gridData, {id: id, owner: owner, key: key, value: value, lastUpdatedBy : loggedInUser, lastUpdatedOn: Date.now()}]));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const deleteConfiguration = (id) =>
    {
        try
        {
            configurationService.deleteConfiguration(id).then(() =>
            {
                setGridData(gridData.filter(config => config.id !== id));
                setSelectedGenericGridRow(undefined);
            });
        }
        catch (error)
        {
            console.error("Error deleting configuration:", error);
        }
    };

    const updateConfiguration = (owner, key, value, id) =>
    {
        try
        {
            if(isEmptyString(owner) || isEmptyString(key) || isEmptyString(value) || isEmptyString(id))
                return;

            loggerService.logInfo(`User ${loggedInUser} updating existing configuration: owner=${owner}, key=${key}, value=${value}, id=${id}`);
            configurationService.updateConfiguration(id, owner, key, value)
                .then(() => setGridData(previousGridData =>
                {
                    const index = previousGridData.findIndex(config => config.id === id);
                    previousGridData[index] = {id: id, owner: owner, key: key, value: value, lastUpdatedBy : loggedInUser, lastUpdatedOn: Date.now()};
                    setSelectedGenericGridRow(previousGridData[index]);
                    return [...previousGridData];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const uploadConfigurationsFromCSV = async (csvData) =>
    {
        try
        {
            const newConfigs = configurationService.parseCSVData(csvData);
            await configurationService.uploadConfigurations(newConfigs);
            setGridData([...gridData, ...newConfigs]);
        }
        catch (error)
        {
            console.error("Error uploading configurations:", error);
        }
    };

    const addConfigDialogHandler = () =>
    {
        setSelectedGenericGridRow(undefined);
        setConfigDialogOpenFlag(true);
    }

    const deleteConfigDialogHandler = () => deleteConfiguration(selectedGenericGridRow.id);
    const updateConfigDialogHandler = () => setConfigDialogOpenFlag(true);

    return(
        <>
            <TitleBarComponent title="Configurations" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div className="configs-app" style={{width: '100%', height: 'calc(100vh - 72px)', float: 'left', padding: '0px', margin:'35px 0px 0px 0px'}}>
                <div className="app-parent-with-action-button">
                    <div>
                        <GenericGridComponent
                            rowHeight={22}
                            gridTheme="ag-theme-alpine"
                            rowIdArray={['id']}
                            columnDefs={columnDefs}
                            gridData={gridData}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
                        <ThemeProvider theme={appTheme}>
                            <Tooltip title={<Typography fontSize={12}>Update selected configuration.</Typography>}>
                                <span>
                                    <Button className="action-button" variant="contained" color="primary"
                                            onClick={updateConfigDialogHandler} disabled={selectedGenericGridRow === undefined}>Update Configuration</Button>
                                </span>
                            </Tooltip>
                            <Tooltip title={<Typography fontSize={12}>Delete selected configuration.</Typography>}>
                                <span>
                                    <Button className="action-button" variant="contained" color="primary"
                                        onClick={deleteConfigDialogHandler} disabled={selectedGenericGridRow === undefined}>Delete Configuration</Button>
                                </span>
                            </Tooltip>
                            <Tooltip title={<Typography fontSize={12}>Add new configuration.</Typography>}>
                                <Button className="action-button right-most" variant="contained" color="primary"
                                        onClick={addConfigDialogHandler}>Add Configuration</Button>
                            </Tooltip>
                        </ThemeProvider>
                    </div>
                    <ConfigurationDialog onCloseHandler={selectedGenericGridRow === undefined ? saveConfiguration : updateConfiguration}/>
                </div>
            </div>
        </>);
};
