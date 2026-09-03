import * as React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import {Tooltip} from "@mui/material";

const IoiActionIconsRenderer = ({data, context}) =>
{
    const {handleAction} = context;

    return (
        <div>
            <Tooltip title="Cancel this IOI. A FIX cancel will be sent and the IOI will not be regenerated.">
                <DeleteIcon onClick={() => handleAction("delete", data)} style={{cursor: "pointer", marginRight: "5px", color: "#404040", height: "20px"}} />
            </Tooltip>
            <Tooltip title="Clone this IOI into a new create dialog.">
                <FileCopyIcon onClick={() => handleAction("clone", data)} style={{cursor: "pointer", color: "#404040", height: "20px"}} />
            </Tooltip>
        </div>
    );
};

export default IoiActionIconsRenderer;
