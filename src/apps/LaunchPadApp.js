import * as React from 'react';
import '../styles/css/main.css';
import {useCallback, useEffect, useState, useRef} from "react";
import {LoggerService} from "../services/LoggerService";
import {ConfigurationService} from "../services/ConfigurationService";
import LoginDialogComponent from "../components/LoginDialogComponent";
import TitleBarComponent from "../components/TitleBarComponent";
import {useMemo} from "react";

const LaunchPadApp = () =>
{
    const [apps, setApps] = useState([]);
    const loggerService = useRef(new LoggerService(LaunchPadApp.name)).current;
    const configurationService = useRef(new ConfigurationService()).current;
    const windowId = useMemo(() => window.command.getWindowId("launch-pad"), []);

    useEffect(() =>
    {
        configurationService.loadConfigurations('system')
            .then(() =>
            {
                try
                {
                    const appList = JSON.parse(configurationService.getConfigValue("system", "app-list-with-display-properties")) ??
                        [
                            { title: 'Users', icon: 'file:///assets/users.png', url: 'http://localhost:3000/users' },
                            { title: 'Configs', icon: 'file:///assets/configurations.png', url: 'http://localhost:3000/configs' }
                        ];

                    setApps(appList);
                }
                catch(err)
                {
                    loggerService.logError("While loading and parsing configurations in the launch pad, the following errors occurred: " + err);
                }
            });

    }, [])

    const launchApp = useCallback((url, title) =>
    {
        window.launchPad.openApp({url: url, title: title});
    }, []);

    return (
        <>
            <TitleBarComponent title="Launch Pad" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div className="launch-pad">
                <LoginDialogComponent/>
                {apps.map((app) => (
                    <div key={app.title} className="launch-pad__app" onClick={() => launchApp(app.url, app.title)}>
                        <img className="launch-pad__icon" src={app.icon} alt={app.title}/>
                        <span className="launch-pad__name">{app.title}</span>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LaunchPadApp;
