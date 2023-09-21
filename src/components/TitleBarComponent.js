import React from 'react';
import {IconButton} from '@mui/material';
import { Close,  Minimize, Build, Lan} from '@mui/icons-material';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import '../styles/css/main.css';

const TitleBarComponent = ({title, addHandler}) =>
{
    const handleChannel = () =>
    {
        window.command.openChannels();
    };

    const handleTools = () =>
    {
        window.command.openTools();
    };

    const handleMinimize = () =>
    {
        window.command.minimize(title);
    };

    const handleMaximize = () =>
    {
        window.command.maximize(title);
    };

    const handleClose = () =>
    {
        window.command.close(title);
    };

    return(
        <div className="title-bar">
            <span className="title-bar-text">{title}</span>
            <div className="title-bar-controls">
                <IconButton className="title-bar-channel" onClick={handleChannel}>
                    <Lan/>
                </IconButton>
                <IconButton className="title-bar-tools" onClick={handleTools}>
                    <Build/>
                </IconButton>
                {addHandler !== undefined && <IconButton className="title-bar-add" onClick={addHandler}>
                    <LocalHospitalIcon/>
                </IconButton>}
                <IconButton className="title-bar-minimize" onClick={handleMinimize}>
                    <Minimize/>
                </IconButton>
                <IconButton className="title-bar-maximize" onClick={handleMaximize}>
                    <CropSquareRoundedIcon/>
                </IconButton>
                <IconButton className="title-bar-close" onClick={handleClose}>
                    <Close/>
                </IconButton>
            </div>
        </div>);
}

export default TitleBarComponent;
