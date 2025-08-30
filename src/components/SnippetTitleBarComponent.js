import { TextField, Tooltip, IconButton, Box, Alert, IconButton as MuiIconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import {Build, Close, Remove, Lan, Settings} from "@mui/icons-material";
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {useRecoilState} from "recoil";
import '../styles/css/main.css';
import {titleBarContextShareColourState} from "../atoms/component-state";

const SnippetTitleBarComponent = ({ title, windowId, addButtonProps, showChannel, showTools, showConfig, snippetPrompt, onSnippetSubmit}) =>
{
    const handleTools = () => window.command.openTools();
    const handleMinimize = () => window.command.minimize(windowId);
    const handleMaximize = () => window.command.maximize(windowId);
    const handleClose = () => window.command.close(windowId);
    const [titleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleKeyPress = (e) =>
    {
        if (e.key === 'Enter' && onSnippetSubmit)
        {
            const result = onSnippetSubmit(inputValue);
            console.log('Snippet submit result:', result); // Debug logging
            
            if (result && result.success)
            {
                setInputValue("");
                setShowError(false);
                setErrorMessage("");
            }
            else
            {
                const errorMsg = result?.error || "Invalid snippet format";
                console.log('Setting error message:', errorMsg); // Debug logging
                setErrorMessage(errorMsg);
                setShowError(true);
            }
        }
    };

    const handleCloseError = () =>
    {
        setShowError(false);
        setErrorMessage("");
    };

    useEffect(() =>
    {
        console.log('Error state changed:', { showError, errorMessage });
    }, [showError, errorMessage]);

    return (
        <div className="snippet-title-bar">
            <span className="title-bar-text">{title}</span>
            
            <div className="snippet-input-container">
                <TextField
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    autoFocus={false}
                    placeholder={snippetPrompt}
                    inputProps={{ style: { fontSize: '12px' } }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            height: '22.5px',
                            width: '100%',
                            '& fieldset': {
                                borderColor: '#ccc',
                            },
                            '&:hover fieldset': {
                                borderColor: '#999',
                            },
                        },
                    }}/>
            </div>

            {showError && (
                <div className="snippet-error-container">
                    <Alert
                        severity="error"
                        className="snippet-error-alert"
                        action={
                            <MuiIconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={handleCloseError}
                            >
                                <Close fontSize="inherit" />
                            </MuiIconButton>
                        }>
                        <div>
                            {errorMessage.includes('\n\nExamples of valid formats:') ? (
                                <>
                                    <span className="error-main-text">
                                        {errorMessage.split('\n\nExamples of valid formats:')[0]}
                                    </span>
                                    <div className="error-examples">
                                        Examples of valid formats:{errorMessage.split('\n\nExamples of valid formats:')[1]}
                                    </div>
                                </>
                            ) : (
                                <span className="error-main-text">
                                    {errorMessage}
                                </span>
                            )}
                        </div>
                    </Alert>
                </div>
            )}

            <div className="title-bar-controls">
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
                {(showConfig !== undefined) && (
                    <Tooltip title={"Click to change RFQ settings"}>
                        <IconButton className="title-bar-tools" onClick={showConfig.handler}>
                            <Settings/>
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
