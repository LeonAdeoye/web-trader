import React, {useMemo} from "react";
import TitleBarComponent from "../components/TitleBarComponent";

export const PlaceholderApp = ({ title }) =>
{
    const windowId = useMemo(() => window.command.getWindowId(title), [title]);

    return (
        <>
            <TitleBarComponent title={title} windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '20px', margin: '45px 0px 0px 0px' }}/>
        </>
    );
};
