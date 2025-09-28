import * as React from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {Tooltip} from "@mui/material";

const RfqActionIconsRenderer = ({data, context}) =>
{
    const {handleRfqAction} = context;

    const ACTIONS = {
        DELETE: 'delete',
        CLONE: 'clone',
        EDIT: 'edit',
        STATS: 'stats',
        CHART: 'chart',
        VIEW: 'view'
    };

    return (
        <div>
            <Tooltip title="Delete this RFQ request completely from the system. This action cannot be undone and will permanently remove the selected RFQ row.">
                <DeleteIcon 
                    onClick={() => handleRfqAction(ACTIONS.DELETE, data)} 
                    style={{cursor: 'pointer', marginRight: '-4px', color:'#404040', height:'20px'}}
                />
            </Tooltip>
            <Tooltip title="Create a duplicate copy of this RFQ request. The new RFQ will have the same parameters but can be modified independently.">
                <FileCopyIcon 
                    onClick={() => handleRfqAction(ACTIONS.CLONE, data)} 
                    style={{cursor: 'pointer', marginRight: '-4px', color:'#404040', height:'20px'}}
                />
            </Tooltip>
            <Tooltip title="Open this RFQ request in edit mode. All fields will be editable allowing you to modify the RFQ parameters, pricing, and other details.">
                <EditIcon 
                    onClick={() => handleRfqAction(ACTIONS.EDIT, data)} 
                    style={{cursor: 'pointer', marginRight: '-4px', color:'#404040', height:'20px'}}
                />
            </Tooltip>
            <Tooltip title="Open RFQ statistics window.">
                <BarChartIcon 
                    onClick={() => handleRfqAction(ACTIONS.STATS, data)} 
                    style={{cursor: 'pointer', marginRight: '-4px', color:'#404040', height:'20px'}}
                />
            </Tooltip>
            <Tooltip title="Open option pricing scenario charts.">
                <ShowChartIcon 
                    onClick={() => handleRfqAction(ACTIONS.CHART, data)} 
                    style={{cursor: 'pointer', marginRight: '-4px', color:'#404040', height:'20px'}}
                />
            </Tooltip>
            <Tooltip title="View this RFQ request in read-only mode. All fields will be displayed but cannot be modified.">
                <VisibilityIcon 
                    onClick={() => handleRfqAction(ACTIONS.VIEW, data)} 
                    style={{cursor: 'pointer', color:'#404040', height:'20px'}}
                />
            </Tooltip>
        </div>
    );
};

export default RfqActionIconsRenderer;
