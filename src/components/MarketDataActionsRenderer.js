import * as React from "react";
import { IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

const MarketDataActionsRenderer = (params) => {
    const { data, context } = params;
    const { ric, isSubscribed } = data;
    const { onSubscribe, onUnsubscribe } = context;

    const handleSubscribe = () => {
        if (onSubscribe) {
            onSubscribe(ric);
        }
    };

    const handleUnsubscribe = () => {
        if (onUnsubscribe) {
            onUnsubscribe(ric);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <Tooltip title="Subscribe to market data">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleSubscribe}
                        disabled={isSubscribed}
                        color="primary"
                        style={{ 
                            padding: '4px',
                            opacity: isSubscribed ? 0.5 : 1
                        }}
                    >
                        <PlayArrowIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Unsubscribe from market data">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleUnsubscribe}
                        disabled={!isSubscribed}
                        color="secondary"
                        style={{ 
                            padding: '4px',
                            opacity: !isSubscribed ? 0.5 : 1
                        }}
                    >
                        <StopIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </div>
    );
};

export default MarketDataActionsRenderer;
