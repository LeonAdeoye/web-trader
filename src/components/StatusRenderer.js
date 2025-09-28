import * as React from "react";
import { Tooltip } from '@mui/material';
import { getStatusColor, formatStatus, adjustColor } from "../utilities";

const StatusRenderer = (params) => {
    const { status } = params.data;
    

    const color = getStatusColor(status);
    const displayStatus = formatStatus(status);
    
    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            padding: '0', 
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'visible'
        }}>
            <Tooltip title={`click to change status and participate in the workflow.`} arrow>
                <div
                    style={{
                        background: `linear-gradient(145deg, ${color}, ${adjustColor(color, -20)})`,
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        width: '120%',
                        height: '100%',
                        position: 'absolute',
                        left: '-10%',
                        top: '0',
                        boxShadow: `
                            0 3px 6px rgba(0,0,0,0.3),
                            0 1px 3px rgba(0,0,0,0.2),
                            inset 0 1px 0 rgba(255,255,255,0.2),
                            inset 0 -1px 0 rgba(0,0,0,0.1)
                        `,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.3px',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px 4px',
                        margin: '0',
                        boxSizing: 'border-box',
                        minHeight: '20px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                    }}
            >
                {displayStatus}
            </div>
        </Tooltip>
        </div>
    );
};

export default StatusRenderer;
