import { useEffect, useState } from 'react';
import { DEFAULT_RFQ_APP_CONFIG, normalizeRfqAppConfig } from '../config/rfqAppConfig';

export const useRfqAppConfig = (initialConfig = DEFAULT_RFQ_APP_CONFIG) =>
{
    const [config, setConfig] = useState(() => normalizeRfqAppConfig(initialConfig));

    useEffect(() =>
    {
        const handleConfigUpdate = (event) =>
        {
            if (event.detail)
                setConfig(prev => normalizeRfqAppConfig({ ...prev, ...event.detail }));
        };

        window.addEventListener('refresh-rfq-config', handleConfigUpdate);
        return () => window.removeEventListener('refresh-rfq-config', handleConfigUpdate);
    }, []);

    return config;
};
