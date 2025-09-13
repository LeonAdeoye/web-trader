import * as React from "react";

const StatusRenderer = (params) => {
    const { status } = params.data;
    
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
        return status.replace(/_/g, ' ');
    };

    const color = getStatusColor(status);
    const displayStatus = formatStatus(status);
    
    return (
        <span
            style={{
                color,
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "not-allowed",
            }}
        >
            {displayStatus}
        </span>
    );
};

export default StatusRenderer;
