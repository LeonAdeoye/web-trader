import * as React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AddBoxIcon from "@mui/icons-material/AddBox";
import {Tooltip} from "@mui/material";

const ActionIconsRenderer = ({data, context}) =>
{
    const {handleAction} = context;

    const ACTIONS = {
        DELETE: 'delete',
        UPDATE: 'update',
        CLONE: 'clone',
        ADD: 'add'
    };

    return (
        <div>
            <Tooltip title="Delete existing row.">
                <DeleteIcon onClick={() => handleAction(ACTIONS.DELETE, data)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Edit existing row.">
                <EditIcon onClick={() => handleAction(ACTIONS.UPDATE, data)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Clone existing row.">
                <FileCopyIcon onClick={() => handleAction(ACTIONS.CLONE, data)} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            </Tooltip>
            <Tooltip title="Add new row.">
                <AddBoxIcon onClick={() => handleAction(ACTIONS.ADD)} style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
            </Tooltip>
        </div>
    );
};

export default ActionIconsRenderer;
