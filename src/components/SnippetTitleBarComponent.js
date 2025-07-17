import { TextField, Tooltip, IconButton } from '@mui/material';
import { useState } from 'react';
import {Build, Close, Remove, Lan} from "@mui/icons-material";
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {useRecoilState} from "recoil";
import '../styles/css/main.css';
import {titleBarContextShareColourState} from "../atoms/component-state";

const SnippetTitleBarComponent = ({ title, windowId, addButtonProps, showChannel, showTools, snippetPrompt, validateSnippetPrompt}) =>
{
    const handleTools = () => window.command.openTools();
    const handleMinimize = () => window.command.minimize(windowId);
    const handleMaximize = () => window.command.maximize(windowId);
    const handleClose = () => window.command.close(windowId);
    const [titleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const [inputValue, setInputValue] = useState(snippetPrompt || "");

    const handleInputChange = (e) =>
    {
        const newValue = e.target.value;
        setInputValue(newValue);
        validateSnippetPrompt?.(newValue);
    };

    return (
        <div className="title-bar" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
            <span className="title-bar-text">{title}</span>

            {/* Text field centered */}
            <div style={{ flexGrow: 1, textAlign: 'center' }}>
                <TextField
                    value={inputValue}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    placeholder="Enter prompt"
                    inputProps={{ style: { fontSize: '12px' } }}
                    style={{ width: '200px', margin: '0 auto' }}/>
            </div>

            <div className="title-bar-controls" style={{ display: 'flex', alignItems: 'center' }}>
                {(addButtonProps !== undefined) && (
                    <Tooltip title={addButtonProps.tooltipText}>
                        <IconButton className="title-bar-add" onClick={addButtonProps.handler}>
                            <LocalHospitalIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {showChannel && (
                    <Tooltip
                        style={{ color: titleBarContextShareColour }}
                        title={titleBarContextShareColour.toUpperCase() === "WHITE"
                            ? "Context sharing not enabled."
                            : `Context sharing on the ${titleBarContextShareColour.toUpperCase()} channel.`}>
                        <IconButton className="title-bar-channel" style={{ color: titleBarContextShareColour }}>
                            <Lan />
                        </IconButton>
                    </Tooltip>
                )}
                {showTools && (
                    <Tooltip title="Tools">
                        <IconButton className="title-bar-tools" onClick={handleTools}>
                            <Build />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Minimize window">
                    <IconButton className="title-bar-minimize" onClick={handleMinimize}>
                        <Remove />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Maximize window">
                    <IconButton className="title-bar-maximize" onClick={handleMaximize}>
                        <CropSquareRoundedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Close window">
                    <IconButton className="title-bar-close" onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
};

export default SnippetTitleBarComponent;
