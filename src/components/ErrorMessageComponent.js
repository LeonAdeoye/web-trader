import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Tooltip } from '@mui/material';

const ErrorMessageComponent = ({ 
    message, 
    duration = 1000, 
    onDismiss, 
    position = 'bottom-right',
    maxWidth = '400px'
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsFading(true);
                // Wait for fade animation to complete before calling onDismiss
                setTimeout(() => {
                    setIsVisible(false);
                    if (onDismiss) onDismiss();
                }, 3000); // 3 second fade duration
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onDismiss]);

    const handleDismiss = () => {
        // Immediately hide the component when close icon is clicked
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!isVisible) return null;

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return { top: '20px', left: '20px' };
            case 'top-right':
                return { top: '20px', right: '20px' };
            case 'bottom-left':
                return { bottom: '20px', left: '20px' };
            case 'bottom-right':
            default:
                return { bottom: '20px', right: '20px' };
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                ...getPositionStyles(),
                backgroundColor: '#9a1c1c',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                zIndex: 9999,
                maxWidth: maxWidth,
                minHeight: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                opacity: isFading ? 0 : 1,
                transition: 'opacity 3s ease-in-out'
            }}
        >
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Tooltip title={message} placement="top">
                    <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2'
                    }}>
                        {message}
                    </div>
                </Tooltip>
            </div>
            <CloseIcon
                onClick={handleDismiss}
                style={{
                    cursor: 'pointer',
                    fontSize: '18px',
                    flexShrink: 0,
                    opacity: 0.8
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            />
        </div>
    );
};

export default ErrorMessageComponent;
