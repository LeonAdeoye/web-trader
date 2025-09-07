import * as React from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, Typography } from '@mui/material';

const HealthStatusRenderer = (params) => 
{
    const { isHealthy, statusText } = params.data;
    
    const iconColor = isHealthy ? '#4caf50' : '#f44336';
    const textColor = isHealthy ? '#4caf50' : '#f44336';
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isHealthy ? (
                <CheckCircleIcon sx={{ color: iconColor, fontSize: 16 }} />
            ) : (
                <ErrorIcon sx={{ color: iconColor, fontSize: 16 }} />
            )}
            <Typography 
                variant="body2" 
                sx={{ 
                    color: textColor, 
                    fontSize: '12px',
                    fontWeight: 'medium'
                }}
            >
                {statusText}
            </Typography>
        </Box>
    );
};

export default HealthStatusRenderer;
