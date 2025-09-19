import * as React from "react";
import { Tooltip } from '@mui/material';

const StatusRenderer = (params) => {
    const { status } = params.data;
    
    const adjustColor = (color, amount) => {
        const num = parseInt(color.replace("#", ""), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };
    
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return '#ffa726'; // Orange
            case 'ACCEPTED':
                return '#66bb6a'; // Green
            case 'REJECTED':
                return '#ef5350'; // Red
            case 'PRICING':
                return '#ab47bc'; // Purple
            case 'PRICED':
                return '#42a5f5'; // Blue
            case 'TRADED_AWAY':
                return '#ff7043'; // Deep Orange
            case 'TRADE_COMPLETED':
                return '#26a69a'; // Teal
            default:
                return '#9e9e9e'; // Gray
        }
    };

    const formatStatus = (status) => {
        if (!status) return '';
        return status.replace(/_/g, ' ')
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
    };

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
