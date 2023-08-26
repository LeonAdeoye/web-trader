import * as React from 'react';
import {transformLocalDataTime} from "../utilities";
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {LoggerService} from "../services/LoggerService";
import {Button, ThemeProvider, Tooltip, Typography} from "@mui/material";
import appTheme from "./appTheme";
import '../style_sheets/component-base.css';
import AddConfigurationDialogComponent from "./AddConfigurationDialogComponent";
import {addConfigDialogDisplayState} from "../atoms/DialogState";
import {useRecoilState} from "recoil";
import {FDC3Service} from "../services/FDC3Service";

export const ConfigsApp = ({user}) =>
{
    const [gridData, setGridData] = useState([]);
    const [configurationService] = useState(new ConfigurationService());
    const [loggerService] = useState(new LoggerService(ConfigsApp.name));
    const [addConfigDialogOpenFlag, setAddConfigDialogOpenFlag] = useRecoilState(addConfigDialogDisplayState);

    const columnDefs = [
        { headerName: "Id", field: 'id', hide: true },
        { headerName: "Owner", field: 'owner', sortable: true, minWidth: 100, width: 130 },
        { headerName: "Key", field: 'key', sortable: true, minWidth: 150, width: 200 },
        { headerName: "Value", field: 'value', sortable: true, minWidth: 200, width: 470 },
        { headerName: "Last Updated By", field: 'lastUpdatedBy', sortable: true, minWidth: 100, maxWidth: 170, width: 170 },
        { headerName: "Last Updated On", field: 'lastUpdatedOn', sortable: true, minWidth: 200, maxWidth: 200, width: 200, valueGetter: (params) =>
        {
            let timestamp = Number((params.data["lastUpdatedOn"]));
            return transformLocalDataTime(timestamp.valueOf());
        }}];

    useEffect(() =>
    {
        async function loadAllConfigurations(user)
        {
            await configurationService.loadConfigurations(user);
            await configurationService.loadConfigurations("system");
        }

        loadAllConfigurations(user)
            .then(() => setGridData(configurationService.getCachedConfigs()))
            .catch((error) => loggerService.logError(error));

    }, [])

    const addConfiguration = async () => setAddConfigDialogOpenFlag(true);

    const saveConfiguration = async (owner, key, value) =>
    {
        try
        {
            if(owner.trim() === '' || key.trim() === '' || value.trim() === '')
                return;

            const config = {owner: owner, key: key, value: value, lastUpdatedBy : user, lastUpdatedOn: Date.now()};
            configurationService.addConfiguration(config).then(() =>
            {
                setGridData([...gridData, config]);
            });
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const deleteConfiguration = async (id) =>
    {
        try
        {
            await configurationService.deleteConfiguration(id).then(() =>
            {
                setGridData(gridData.filter(config => config.id !== id));
            });
        }
        catch (error)
        {
            console.error("Error deleting configuration:", error);
        }
    };

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

    const addConfigDialogHandler = () => setAddConfigDialogOpenFlag(true);

    const deleteConfigDialogHandler = () =>
    {
        alert("Hello from deleteConfigDialogHandler()");
    }

    return(
        <div className="app-parent-with-action-button">
            <div>
                <GenericGridApp
                    rowHeight={25}
                    gridTheme="ag-theme-alpine"
                    rowIdArray={['id']}
                    columnDefs={columnDefs}
                    gridData={gridData}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
                <ThemeProvider theme={appTheme}>
                    <Tooltip title={<Typography fontSize={12}>Add new configuration.</Typography>}>
                        <Button className="action-button" variant="contained" color="primary"
                                onClick={addConfigDialogHandler}>Add Configuration</Button>
                    </Tooltip>
                    <Tooltip title={<Typography fontSize={12}>Delete selected configuration.</Typography>}>
                        <Button className="action-button right-most" variant="contained" color="primary"
                                onClick={deleteConfigDialogHandler}>Delete Configuration</Button>
                    </Tooltip>
                </ThemeProvider>
            </div>
            <AddConfigurationDialogComponent onCloseHandler={saveConfiguration}/>
        </div>);
};
