import { formatNumber } from "../utilities";

export const NOTIONAL_USD_HEADER_TOOLTIP = "Notional in USD = notionalInLocal / notionalFXRate";

const parseNumeric = (value) =>
{
    if (value === null || value === undefined || value === '')
        return NaN;

    if (typeof value === 'number')
        return value;

    return Number(String(value).replace(/,/g, ''));
};

export const getNotionalUSDTooltip = (row) =>
{
    if (!row)
        return NOTIONAL_USD_HEADER_TOOLTIP;

    const notionalFXRate = parseNumeric(row.notionalFXRate);
    let notionalInLocal = parseNumeric(row.notionalInLocal);
    let notionalInUSD = parseNumeric(row.notionalInUSD);

    if (Number.isNaN(notionalInLocal) && !Number.isNaN(notionalInUSD) && !Number.isNaN(notionalFXRate) && notionalFXRate !== 0)
        notionalInLocal = notionalInUSD * notionalFXRate;

    if (Number.isNaN(notionalInUSD) && !Number.isNaN(notionalInLocal) && !Number.isNaN(notionalFXRate) && notionalFXRate !== 0)
        notionalInUSD = notionalInLocal / notionalFXRate;

    if (Number.isNaN(notionalInLocal) || Number.isNaN(notionalFXRate) || Number.isNaN(notionalInUSD))
        return NOTIONAL_USD_HEADER_TOOLTIP;

    return `${NOTIONAL_USD_HEADER_TOOLTIP}\n= ${formatNumber(notionalInLocal)} / ${formatNumber(notionalFXRate)}\n= ${formatNumber(notionalInUSD)}`;
};
