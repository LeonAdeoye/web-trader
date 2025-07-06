import React, {useMemo, useRef} from "react";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";

export const ChildOrdersApp = () =>
{
    const loggerService = useRef(new LoggerService(ChildOrdersApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Child Orders"), []);

    return (
        <div>
            <TitleBarComponent title="Child Orders" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <h1>Child Orders App</h1>
            <p>This app manages child orders.</p>
        </div>
    );
}
