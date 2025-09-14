import * as React from 'react';
import '../styles/css/main.css';
import {useCallback, useEffect, useState, useRef, useMemo} from "react";
import {LoggerService} from "../services/LoggerService";
import {ConfigurationService} from "../services/ConfigurationService";
import {ServiceRegistry} from "../services/ServiceRegistry";
import LoginDialog from "../dialogs/LoginDialog";
import TitleBarComponent from "../components/TitleBarComponent";
import ErrorMessageComponent from "../components/ErrorMessageComponent";

const LaunchPadApp = () =>
{
    const [apps, setApps] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [, setIsLoggedIn] = useState(false);
    const loggerService = useRef(new LoggerService(LaunchPadApp.name)).current;
    const configurationService = useRef(new ConfigurationService()).current;
    const windowId = useMemo(() => window.command.getMainWindowId("Launch Pad"), []);

    const createDefaultApps = useCallback(() =>
    {
        return [
            { title: 'Users', icon: 'file:///assets/users.png', url: 'http://localhost:3000/users' },
            { title: 'Configs', icon: 'file:///assets/configurations.png', url: 'http://localhost:3000/configs' },
            { title: 'Services', icon: 'file:///assets/services.png', url: 'http://localhost:3000/services' }
        ];
    }, []);

    useEffect(() =>
    {
        const loadApps = async () =>
        {
            try
            {
                const listOfApps = await configurationService.getAllApps();
                if (listOfApps && listOfApps.length > 0)
                {
                    setApps(listOfApps);
                    loggerService.logInfo(`Loaded ${listOfApps.length} apps from service`);
                }
                else
                {
                    setApps(createDefaultApps());
                    loggerService.logInfo("No apps found from service, using default apps");
                }
            }
            catch (error)
            {
                setApps(createDefaultApps());
                loggerService.logError("Failed to load apps from service, using default apps: " + error.message);
            }
        };

        loadApps().then(() => loggerService.logInfo("Launch Pad initialized with list of apps."));
    }, [configurationService])

    const launchApp = useCallback((url, title) =>
    {
        window.launchPad.openApp({url: url, title: title});
    }, []);

    const handleLoginSuccess = useCallback(() =>
    {
        loggerService.logInfo('Login successful, starting health check...');
        setIsLoggedIn(true);

        const checkServicesHealth = async () =>
        {
            try
            {
                loggerService.logInfo('Checking services health...');
                const healthResults = await ServiceRegistry.checkAllServicesHealth();
                loggerService.logInfo(`Health check results: ${JSON.stringify(healthResults)}`);
                const unhealthyServices = healthResults.filter(service => !service.isHealthy);
                if (unhealthyServices.length > 0)
                {
                    const serviceNames = unhealthyServices.map(s => s.name).join(', ');
                    setErrorMessage(`System issue identified. Service(s) down: ${serviceNames}`);
                    loggerService.logError(`Unhealthy services detected: ${serviceNames}`);
                }
                else
                    loggerService.logInfo('All services are healthy');
            }
            catch (error)
            {
                setErrorMessage('Failed to check service health');
                loggerService.logError(`Health check failed: ${error.message}`);
            }
        };

        setTimeout(() => 
        {
            checkServicesHealth();
        }, 500);
    }, [loggerService]);

    return (
        <>
            <TitleBarComponent title="Launch Pad" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={true}/>
            <div className="launch-pad" style={{marginTop: '55px'}}>
                <LoginDialog onLoginSuccess={handleLoginSuccess}/>
                {apps.map((app) => (
                    <div key={app.title} className="launch-pad__app" onClick={() => launchApp(app.url, app.title)}>
                        <img className="launch-pad__icon" src={app.icon} alt={app.title}/>
                        <span className="launch-pad__name">{app.title}</span>
                    </div>
                ))}
            </div>
            {errorMessage && (
                <ErrorMessageComponent 
                    message={errorMessage}
                    duration={10000}
                    onDismiss={() => setErrorMessage(null)}
                    position="bottom-right"
                />
            )}
        </>
    );
};

export default LaunchPadApp;
