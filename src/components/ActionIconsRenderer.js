import * as React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

const ActionIconsRenderer = (params) =>
{
    const {blastId} = params.data;
    const {handleAction} = params.context;

    const ACTIONS = {
        DELETE: 'delete',
        EDIT: 'edit',
        CLONE: 'clone',
        ADD: 'add',
        PLAY: 'play',
    };

    return (<div>
        <PlayCircleIcon onClick={() => handleAction(ACTIONS.PLAY, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
        <DeleteIcon onClick={() => handleAction(ACTIONS.DELETE, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
        <EditIcon onClick={() => handleAction(ACTIONS.EDIT, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
        <FileCopyIcon onClick={() => handleAction(ACTIONS.CLONE, blastId)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
        <AddBoxIcon onClick={() => handleAction(ACTIONS.ADD, blastId)} style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
    </div>);
};


export default ActionIconsRenderer;
