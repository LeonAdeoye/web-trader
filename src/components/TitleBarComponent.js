import React from 'react';
import {IconButton, Tooltip} from '@mui/material';
import { Close,  Remove, Build, Lan} from '@mui/icons-material';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import '../styles/css/main.css';

const TitleBarComponent = ({title, windowId, addButtonProps, showChannel, showTools}) =>
{
    const handleChannel = () =>  window.command.openChannels();
    const handleTools = () => window.command.openTools();
    const handleMinimize = () => window.command.minimize(windowId);
    const handleMaximize = () => window.command.maximize(windowId);
    const handleClose = () => window.command.close(windowId);

    return(
        <div className="title-bar">
            <span className="title-bar-text">{title}</span>
            <div className="title-bar-controls">
                {(addButtonProps !== undefined) && <Tooltip title={`${addButtonProps.tooltipText}`}><IconButton className="title-bar-add" onClick={addButtonProps.handler}>
                    <LocalHospitalIcon/>
                </IconButton></Tooltip>}
                {showChannel && <IconButton className="title-bar-channel" onClick={handleChannel}>
                    <Lan/>
                </IconButton>}
                {showTools && <Tooltip title={"Tools"}><IconButton className="title-bar-tools" onClick={handleTools}>
                    <Build/>
                </IconButton></Tooltip>}
                <Tooltip title={"Minimize window"}>
                    <IconButton className="title-bar-minimize" onClick={handleMinimize}>
                        <Remove/>
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Maximize window"}>
                    <IconButton className="title-bar-maximize" onClick={handleMaximize}>
                        <CropSquareRoundedIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title={"Maximize window"}>
                    <IconButton className="title-bar-close" onClick={handleClose}>
                        <Close/>
                    </IconButton>
                </Tooltip>
            </div>
        </div>);
}

export default TitleBarComponent;
