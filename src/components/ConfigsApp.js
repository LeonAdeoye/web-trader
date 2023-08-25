import * as React from 'react';
import {transformLocalDataTime} from "../utilities";
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {LoggerService} from "../services/LoggerService";
import {Button, ThemeProvider, Tooltip, Typography} from "@mui/material";
import appTheme from "./appTheme";
import '../style_sheets/component-base.css';

export const ConfigsApp = ({user}) =>
{
    const [gridData, setGridData] = useState([]);
    const [configurationService] = useState(new ConfigurationService());
    const [loggerService] = useState(new LoggerService(ConfigsApp.name));

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

    const addConfiguration = async (config) =>
    {
        try
        {
            await configurationService.addConfiguration(config);
            setGridData([...gridData, config]);
        }
        catch (error)
        {
            console.error("Error adding configuration:", error);
        }
    };

    const deleteConfiguration = async (id) =>
    {
        try
        {
            await configurationService.deleteConfiguration(id);
            setGridData(gridData.filter(config => config.id !== id));
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

    const openAddConfigDialogHandler = () =>
    {
        alert("Hello from openAddConfigDialogHandler()");
    }

    const openDeleteConfigDialogHandler = () =>
    {
        alert("Hello from openDeleteConfigDialogHandler()");
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
                                onClick={openAddConfigDialogHandler}>Add Configuration</Button>
                    </Tooltip>
                    <Tooltip title={<Typography fontSize={12}>Delete selected configuration.</Typography>}>
                        <Button className="action-button right-most" variant="contained" color="primary"
                                onClick={openDeleteConfigDialogHandler}>Delete Configuration</Button>
                    </Tooltip>
                </ThemeProvider>
            </div>
        </div>);
};
