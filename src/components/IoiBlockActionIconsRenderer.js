import * as React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {Tooltip} from "@mui/material";

const IoiBlockActionIconsRenderer = ({data, context}) =>
{
    const {handleAction} = context;

    return (
        <div>
            <Tooltip title="Unblock this trader, stock, or market.">
                <DeleteIcon onClick={() => handleAction("delete", data)} style={{cursor: "pointer", color: "#404040", height: "20px"}} />
            </Tooltip>
        </div>
    );
};

export default IoiBlockActionIconsRenderer;
