import React, {useMemo, useRef} from "react";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";

const NewOrderApp = () =>
{
    const loggerService = useRef(new LoggerService(NewOrderApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("newOrder"), []);

    return (
        <div>
            <TitleBarComponent title="New Order" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <h1>New Order App</h1>
            <p>This app manages new orders.</p>
        </div>
    );
}
