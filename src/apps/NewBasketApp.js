import React, {useMemo, useRef} from "react";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";

export const NewBasketApp = () =>
{
    const loggerService = useRef(new LoggerService(NewBasketApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("newBasket"), []);

    return (
        <div>
            <TitleBarComponent title="New Basket" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <h1>New Basket App</h1>
            <p>This app manages new basket orders.</p>
        </div>
    );
}
