import React, {useMemo, useRef} from "react";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";

export const NewBasketApp = () =>
{
    const loggerService = useRef(new LoggerService(NewBasketApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("New Basket"), []);

    return (
        <div>
            <TitleBarComponent title="New Basket" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '20px', margin: '45px 0px 0px 0px' }}>
                <h1>New Basket App</h1>
                <p>This app manages new basket orders.</p>
            </div>
        </div>
    );
}
