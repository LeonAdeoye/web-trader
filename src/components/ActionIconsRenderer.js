import * as React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

const ActionIconsRenderer = (params) =>
{
    const {blastId} = params.data;

    const handleDelete = () =>
    {
        console.log(`Delete: ${blastId}`);
    };

    const handleEdit = () =>
    {
        console.log(`Edit: ${blastId}`);
    };

    const handleClone = () =>
    {
        console.log(`Clone: ${blastId}`);
    };

    const handleAdd = () =>
    {
        console.log(`Add: ${blastId}`);
    };

    const handlePlay = () =>
    {
        console.log(`Play: ${blastId}`);
    };

    return (<div>
            <PlayCircleIcon onClick={handlePlay} style={{cursor: 'pointer', marginRight: '5px', color:'#4F81BD', height:'20px'}}/>
            <DeleteIcon onClick={handleDelete} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            <EditIcon onClick={handleEdit} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            <FileCopyIcon onClick={handleClone} style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
            <AddBoxIcon onClick={handleAdd} style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
        </div>);
};

export default ActionIconsRenderer;
