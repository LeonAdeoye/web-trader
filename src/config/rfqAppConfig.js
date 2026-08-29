export const DEFAULT_RFQ_APP_CONFIG =
{
    defaultSettlementCurrency: 'USD',
    defaultSettlementDays: 2,
    decimalPrecision: 3,
    defaultSpread: 1,
    defaultSalesCreditPercentage: 0.5,
    defaultVolatility: 20,
    defaultDayConvention: 250,
    defaultOptionModel: 'european',
    recalculationPeriodSeconds: 30
};

export const RFQ_CONFIG_NUMERIC_KEYS =
[
    'defaultSettlementDays',
    'decimalPrecision',
    'defaultSpread',
    'defaultSalesCreditPercentage',
    'defaultVolatility',
    'defaultDayConvention',
    'recalculationPeriodSeconds'
];

export const normalizeRfqAppConfig = (config = {}) =>
{
    const normalized = { ...DEFAULT_RFQ_APP_CONFIG, ...config };

    for (const key of RFQ_CONFIG_NUMERIC_KEYS)
    {
        if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '')
            normalized[key] = Number(normalized[key]);
    }

    return normalized;
};

export const parseRfqConfigParam = (configParam) =>
{
    if (!configParam)
        return normalizeRfqAppConfig();

    try
    {
        return normalizeRfqAppConfig(JSON.parse(decodeURIComponent(configParam)));
    }
    catch (error)
    {
        return normalizeRfqAppConfig();
    }
};
