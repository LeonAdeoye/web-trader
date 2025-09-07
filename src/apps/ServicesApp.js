import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { useRecoilState } from "recoil";
import { selectedGenericGridRowState } from "../atoms/component-state";
import { LoggerService } from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const ServicesApp = () =>
{
    const [services, setServices] = useState([]);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const loggerService = useRef(new LoggerService(ServicesApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Services"), []);

    const servicesConfig = useMemo(() => [
        { name: 'Configuration Service', port: 20001, actuatorUrl: 'http://localhost:20001/health', status: 'Unknown', lastChecked: null },
        { name: 'Logging Service', port: 20002, actuatorUrl: 'http://localhost:20002/health', status: 'Unknown', lastChecked: null },
        { name: 'Users Service', port: 20003, actuatorUrl: 'http://localhost:20003/health', status: 'Unknown', lastChecked: null },
        { name: 'Domain Service', port: 20009, actuatorUrl: 'http://localhost:20009/health', status: 'Unknown', lastChecked: null },
        { name: 'Alert Service', port: 20012, actuatorUrl: 'http://localhost:20012/health', status: 'Unknown', lastChecked: null },
        { name: 'Order Service', port: 20013, actuatorUrl: 'http://localhost:20013/health', status: 'Unknown', lastChecked: null },
        { name: 'Exchange Service', port: 20014, actuatorUrl: 'http://localhost:20014/health', status: 'Unknown', lastChecked: null },
        { name: 'Limits Service', port: 20017, actuatorUrl: 'http://localhost:20017/health', status: 'Unknown', lastChecked: null },
        { name: 'Pricing Service', port: 20015, actuatorUrl: 'http://localhost:20015/health', status: 'Unknown', lastChecked: null },
        { name: 'IOI Service', port: 20018, actuatorUrl: 'http://localhost:20018/health', status: 'Unknown', lastChecked: null }
    ], []);

    // Column definitions for the ag-grid
    const columnDefs = useMemo(() => [
        { 
            headerName: 'Service Name', 
            field: 'name', 
            sortable: true, 
            minWidth: 200, 
            width: 250, 
            filter: true,
            pinned: 'left'
        },
        { 
            headerName: 'Port', 
            field: 'port', 
            sortable: true, 
            minWidth: 80, 
            width: 100, 
            filter: true,
            type: 'numericColumn'
        },
        { 
            headerName: 'Health URL',
            field: 'actuatorUrl', 
            sortable: true, 
            minWidth: 300, 
            width: 400, 
            filter: true,
            cellRenderer: (params) => 
            {
                return (
                    <a 
                        href={params.value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {params.value}
                    </a>
                );
            }
        },
        { 
            headerName: 'Status', 
            field: 'status', 
            sortable: true, 
            minWidth: 120, 
            width: 150, 
            filter: true,
            cellRenderer: (params) => 
            {
                const status = params.value;
                const color = status === 'Healthy' ? '#178000' : status === 'Unhealthy' ? '#f44336' : '#ff9800';
                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {status}
                    </span>
                );
            }
        },
        { 
            headerName: 'Last Checked', 
            field: 'lastChecked', 
            sortable: true, 
            minWidth: 150, 
            width: 180, 
            filter: true,
            cellRenderer: (params) => 
            {
                const timestamp = params.value;
                if (!timestamp) 
                {
                    return <span style={{ color: '#999', fontStyle: 'italic' }}>Never</span>;
                }
                
                const date = new Date(timestamp);
                const formattedTime = date.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                
                return <span style={{ fontSize: '12px' }}>{formattedTime}</span>;
            }
        },
        { 
            headerName: 'Test Now',
            field: 'testStatus', 
            sortable: false, 
            minWidth: 100,
            width: 100,
            filter: false,
            cellRenderer: (params) => 
            {
                return (
                    <span 
                        title="Click To Test Service Status Now!"
                        style={{ cursor: 'pointer' }}>
                        <PlayArrowIcon 
                            onClick={() => testServiceStatus(params.data)}
                            style={{ 
                                fontSize: '20px', 
                                color: '#404040',
                                cursor: 'pointer'
                            }}/>
                    </span>
                );
            }
        }
    ], []);

    // Row styling based on health status
    const getRowStyle = (params) => 
    {
        const status = params.data.status;
        if (status === 'Healthy')
            return { backgroundColor: '#e8f5e8' };
        else if (status === 'Unhealthy')
            return { backgroundColor: '#ffeaea' };
        else
            return { backgroundColor: '#fff3e0' }; // Light orange for unknown
    };

    const onCellMouseDown = (params) => 
    {
        if (params.colDef.field !== 'status' && params.colDef.field !== 'testStatus')
            setSelectedGenericGridRow(params.data);
    };

    const checkServiceHealth = async (serviceData) => 
    {
        const { name, port, actuatorUrl } = serviceData;
        const currentTime = new Date().toISOString();
        
        try 
        {
            const response = await fetch(actuatorUrl,
        {
                method: 'GET',
                headers: { 'Accept': 'text/plain'  }
            });

            if (response.ok) 
            {
                const responseText = await response.text();
                const isHealthy = responseText.trim() === 'Up';
                return { ...serviceData, status: isHealthy ? 'Healthy' : 'Unhealthy', lastChecked: currentTime };
            } 
            else
                return { ...serviceData, status: 'Unhealthy', lastChecked: currentTime };
        } 
        catch (error) 
        {
            loggerService.logError(`${name} health check failed: ${error.message}`);
            return { ...serviceData, status: 'Unhealthy', lastChecked: currentTime };
        }
    };

    const checkAllServicesHealth = async () => 
    {
        const healthPromises = servicesConfig.map(service => checkServiceHealth(service));
        
        try 
        {
            const results = await Promise.all(healthPromises);
            setServices(results);
        } 
        catch (error) 
        {
            loggerService.logError(`Health check failed: ${error.message}`);
        }
    };

    const testServiceStatus = async (serviceData) => 
    {
        const { name } = serviceData;
        loggerService.logInfo(`Manual test for ${name}`);
        setServices(prevServices => prevServices.map(service => service.name === name ? { ...service, status: 'Testing...' } : service ));
        const result = await checkServiceHealth(serviceData);
        setServices(prevServices => prevServices.map(service => service.name === name ? result : service));
    };

    useEffect(() => 
    {
        checkAllServicesHealth();
        const healthCheckInterval = setInterval(() =>
        {
            checkAllServicesHealth();
        }, 120000);

        return () => clearInterval(healthCheckInterval);
    }, []);

    const refreshServices = () => 
    {
        checkAllServicesHealth();
        loggerService.logInfo(`Manual refresh triggered`);
    };

    return(
        <>
            <TitleBarComponent 
                title="Services" 
                windowId={windowId} 
                addButtonProps={{ handler: refreshServices, tooltipText: "Refresh Services" }} 
                showChannel={false} 
                showTools={false}/>
            <div className="services-app" style={{width: '100%', height: 'calc(100vh - 72px)', float: 'left', padding: '0px', margin:'35px 0px 0px 0px'}}>
                <div className="ag-theme-alpine" style={{height: '100%', width: '100%'}}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={services}
                        getRowStyle={getRowStyle}
                        onCellMouseDown={onCellMouseDown}
                        rowSelection={'single'}
                        animateRows={true}
                        enableCellChangeFlash={true}
                        defaultColDef={{
                            resizable: true,
                            filter: true,
                            sortable: true
                        }}
                        rowHeight={32}
                        headerHeight={32}/>
                </div>
            </div>
        </>
    );
}
