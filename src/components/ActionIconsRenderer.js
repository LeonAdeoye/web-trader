import * as React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import {Tooltip} from "@mui/material";

const ActionIconsRenderer = (params) => {
    const {blastId} = params.data;
    const {handleAction} = params.context;

    const ACTIONS = {
        DELETE: 'delete',
        UPDATE: 'update',
        CLONE: 'clone',
        ADD: 'add',
        PLAY: 'play'
    };

    return (
        <div>
            <Tooltip title="Play blast.">
                <PlayCircleIcon onClick={() => handleAction(ACTIONS.PLAY, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Delete existing blast.">
                <DeleteIcon onClick={() => handleAction(ACTIONS.DELETE, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Edit existing blast.">
                <EditIcon onClick={() => handleAction(ACTIONS.UPDATE, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Clone existing blast.">
                <FileCopyIcon onClick={() => handleAction(ACTIONS.CLONE, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Add new blast.">
                <AddBoxIcon onClick={() => handleAction(ACTIONS.ADD)} style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
            </Tooltip>
        </div>
    );
};

export default ActionIconsRenderer;
