import TitleBarComponent from "../components/TitleBarComponent";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import * as React from 'react';

export const LimitsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Limits"), []);
    return (<>
        <TitleBarComponent title="Limits" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
        <div style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
        </div>
    </>)
}
