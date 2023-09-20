import React from 'react';
import {Button, IconButton} from '@mui/material';
import { Close,  Minimize, Build, Lan} from '@mui/icons-material';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import '../styles/css/main.css';

const TitleBarComponent = ({title}) =>
{
    const handleChannel = () =>
    {
        console.log("channel button clicked!");
    };

    const handleTools = () =>
    {
        console.log("tools button clicked!");
    };

    const handleMinimize = () =>
    {
        console.log("minimize button clicked!");
    };

    const handleMaximize = () =>
    {
        console.log("maximize button clicked!");
    };

    const handleClose = () =>
    {
        console.log("close button clicked!");
    };

    return(
        <div className="title-bar">
            {/*  TODO <img className="title-bar-icon" src={iconSource}/>*/}
            <span className="title-bar-text">{title}</span>
            <div className="title-bar-controls">
                <IconButton className="title-bar-channel" onClick={handleChannel}>
                    <Lan/>
                </IconButton>
                <IconButton className="title-bar-tools" onClick={handleTools}>
                    <Build/>
                </IconButton>
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
