import { buildMetrics } from "./buildMetrics";
import { buildDerivedValues } from "./buidDerivedValues";
import { getOptionPricingParams } from './calculateRfqOptionMetrics';

export { getOptionPricingParams };

const GREEK_NAMES = ['delta', 'gamma', 'theta', 'vega', 'rho'];
const GREEK_GRID_ROWS = ['Greek', 'Notional', 'Percent', 'Shares'];

export const buildLegResult = (rfq, leg, greeks) =>
{
    const metrics = buildMetrics(rfq, leg, greeks);
    return { leg, metrics, derived: buildDerivedValues(rfq, leg, metrics) };
};

export const buildLegGreekRowValues = (leg, metrics, derived) =>
({
    greek: Object.fromEntries(GREEK_NAMES.map(name => [name, metrics[name] * leg.quantity])),
    notional: Object.fromEntries(GREEK_NAMES.map(name => [name, derived[`${name}Notional`]])),
    percent: Object.fromEntries(GREEK_NAMES.map(name => [name, derived[`${name}Percent`] * leg.quantity])),
    shares: Object.fromEntries(GREEK_NAMES.map(name => [name, derived[`${name}Shares`]]))
});

const formatGreekGridRow = (field, values, decimalPrecision) =>
({
    field,
    ...Object.fromEntries(GREEK_NAMES.map(name =>
    {
        const precision = field === 'Shares' ? 0 : decimalPrecision;
        return [name, values[name].toFixed(precision)];
    }))
});

export const buildLegGreeksGridData = (legResult, decimalPrecision) =>
{
    if (!legResult?.leg || !legResult?.metrics || !legResult?.derived)
        return [];

    const rowValues = buildLegGreekRowValues(legResult.leg, legResult.metrics, legResult.derived);

    return [
        formatGreekGridRow('Greek', rowValues.greek, decimalPrecision),
        formatGreekGridRow('Notional', rowValues.notional, decimalPrecision),
        formatGreekGridRow('Percent', rowValues.percent, decimalPrecision),
        formatGreekGridRow('Shares', rowValues.shares, decimalPrecision)
    ];
};

export const buildSummaryGreeksGridData = (legResults, decimalPrecision) =>
{
    if (!legResults?.length)
        return [];

    const legGrids = legResults.map(legResult => buildLegGreeksGridData(legResult, decimalPrecision));
    const totals =
    {
        Greek: Object.fromEntries(GREEK_NAMES.map(name => [name, 0])),
        Notional: Object.fromEntries(GREEK_NAMES.map(name => [name, 0])),
        Percent: Object.fromEntries(GREEK_NAMES.map(name => [name, 0])),
        Shares: Object.fromEntries(GREEK_NAMES.map(name => [name, 0]))
    };

    for (const legGrid of legGrids)
    {
        for (const row of legGrid)
        {
            for (const name of GREEK_NAMES)
                totals[row.field][name] += parseFloat(row[name]);
        }
    }

    return GREEK_GRID_ROWS.map(rowName => formatGreekGridRow(rowName, totals[rowName], decimalPrecision));
};

export const aggregateLegResults = (legResults) =>
{
    const greekSums = Object.fromEntries(GREEK_NAMES.map(name => [name, 0]));
    const notionalSums = Object.fromEntries(GREEK_NAMES.map(name => [name, 0]));
    const percentSums = Object.fromEntries(GREEK_NAMES.map(name => [name, 0]));
    const sharesSums = Object.fromEntries(GREEK_NAMES.map(name => [name, 0]));

    let totalQuantity = 0;
    let totalNotionalInLocal = 0;
    let totalNotionalInUSD = 0;
    let totalPremiumInLocal = 0;
    let totalPremiumInUSD = 0;
    let totalAskPremium = 0;
    let totalBidPremium = 0;
    let totalPremiumPercentage = 0;
    let totalSalesCreditAmount = 0;

    for (const { leg, metrics, derived } of legResults)
    {
        totalQuantity += leg.quantity;
        totalNotionalInLocal += metrics.notionalInLocal;
        totalNotionalInUSD += metrics.notionalInUSD;
        totalPremiumInLocal += derived.premiumInLocal;
        totalPremiumInUSD += derived.premiumInUSD;
        totalAskPremium += metrics.price + metrics.spread / 2;
        totalBidPremium += metrics.price - metrics.spread / 2;
        totalPremiumPercentage += derived.premiumPercentage;
        totalSalesCreditAmount += derived.salesCreditAmount;

        const rowValues = buildLegGreekRowValues(leg, metrics, derived);

        for (const name of GREEK_NAMES)
        {
            greekSums[name] += rowValues.greek[name];
            notionalSums[name] += rowValues.notional[name];
            percentSums[name] += rowValues.percent[name];
            sharesSums[name] += rowValues.shares[name];
        }
    }

    return {
        totalQuantity,
        strikes: legResults.map(result => result.leg.strike).join(', '),
        totalNotionalInLocal,
        totalNotionalInUSD,
        greekSums,
        notionalSums,
        percentSums,
        sharesSums,
        totalPremiumInLocal,
        totalPremiumInUSD,
        totalAskPremium,
        totalBidPremium,
        totalPremiumPercentage,
        totalSalesCreditAmount,
        legResults
    };
};

const parseDateValue = (dateValue) =>
{
    if (!dateValue) return null;

    if (dateValue instanceof Date)
        return isNaN(dateValue.getTime()) ? null : dateValue;

    if (typeof dateValue === 'string')
    {
        const slashMatch = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slashMatch)
        {
            const [, day, month, year] = slashMatch;
            const parsedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
        }

        const parsedDate = new Date(dateValue);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatRfqDetailsDate = (dateValue) =>
{
    const parsedDate = parseDateValue(dateValue);
    if (!parsedDate) return "";

    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = parsedDate.toLocaleString('en-US', { month: 'short' });
    const year = parsedDate.getFullYear();
    return `${day} ${month} ${year}`;
};

const formatMaturityDate = (maturityDate) => formatRfqDetailsDate(maturityDate);

const formatPremiumSettlementDate = (premiumSettlementDate) => formatRfqDetailsDate(premiumSettlementDate);

export const toDateInputValue = (dateValue) =>
{
    const parsedDate = parseDateValue(dateValue);
    if (!parsedDate)
        return '';

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const textField = (key, label, value, extras = {}) =>
({
    key,
    label,
    value: value ?? '',
    editable: false,
    type: 'text',
    ...extras
});

const withCurrentOption = (options, current) =>
{
    const list = options || [];
    if (current == null || current === '' || list.some(option => String(option) === String(current)))
        return list;
    return [current, ...list];
};

const formatNotionalInLocal = (value) =>
{
    if (value == null || value === '') return '';
    return Math.round(Number(value)).toString();
};

const formatNotionalInUSD = (value, decimalPrecision) =>
{
    if (value == null || value === '') return '';
    return Number(value).toFixed(decimalPrecision);
};

export const buildGreeksGridData = (viewContext, decimalPrecision) =>
{
    const { mode, legResult, legResults, summary } = viewContext;

    if (mode === 'summary')
    {
        if (legResults?.length)
            return buildSummaryGreeksGridData(legResults, decimalPrecision);

        if (!summary)
            return [];

        return [
            formatGreekGridRow('Greek', summary.greekSums, decimalPrecision),
            formatGreekGridRow('Notional', summary.notionalSums, decimalPrecision),
            formatGreekGridRow('Percent', summary.percentSums, decimalPrecision),
            formatGreekGridRow('Shares', summary.sharesSums, decimalPrecision)
        ];
    }

    return buildLegGreeksGridData(legResult, decimalPrecision);
};

export const RFQ_DETAILS_NUMERIC_KEYS = Object.freeze([
    'underlyingPrice', 'volatility', 'interestRate', 'multiplier', 'notionalFXRate',
    'dayCountConvention', 'spread', 'salesCreditPercentage', 'premiumSettlementDaysOverride',
    'premiumSettlementFXRate'
]);

export const RFQ_DETAILS_RECALC_KEYS = Object.freeze([
    'notionalFXRate', 'interestRate', 'volatility', 'dayCountConvention', 'multiplier',
    'salesCreditPercentage', 'premiumSettlementDaysOverride', 'spread', 'underlyingPrice'
]);

export const RFQ_DETAILS_EDITABLE_KEYS = Object.freeze([
    'client', 'bookCode', 'underlyingPrice', 'multiplier', 'volatility', 'interestRate',
    'dayCountConvention', 'spread', 'notionalFXRate', 'premiumSettlementCurrency',
    'premiumSettlementDate', 'premiumSettlementDaysOverride', 'premiumSettlementFXRate',
    'salesCreditPercentage'
]);

export const rfqDetailsFieldValuesEqual = (key, left, right) =>
{
    if (key === 'premiumSettlementDate')
        return toDateInputValue(left) === toDateInputValue(right);

    if (RFQ_DETAILS_NUMERIC_KEYS.includes(key))
        return Number(left) === Number(right);

    return String(left ?? '') === String(right ?? '');
};

export const coerceRfqDetailsFieldValue = (key, rawValue) =>
{
    if (key === 'premiumSettlementDate')
    {
        const ymd = toDateInputValue(rawValue);
        if (!ymd)
            return rawValue;
        return new Date(`${ymd}T00:00:00`).toISOString();
    }

    if (RFQ_DETAILS_NUMERIC_KEYS.includes(key))
    {
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? parsed : rawValue;
    }

    return rawValue;
};

export const buildRfqDetailsDirtyChanges = (draft, baseline) =>
    RFQ_DETAILS_EDITABLE_KEYS
        .filter(key => !rfqDetailsFieldValuesEqual(key, draft?.[key], baseline?.[key]))
        .map(key => ({
            fieldName: key,
            oldValue: baseline?.[key],
            newValue: coerceRfqDetailsFieldValue(key, draft?.[key]),
            changeType: 'UPDATE'
        }));

export const buildRfqDetailsTextFields = (rfq, viewContext, decimalPrecision, fieldOptions = {}) =>
{
    const { mode, legResult, summary } = viewContext;
    const leg = legResult?.leg;
    const metrics = legResult?.metrics;
    const derived = legResult?.derived;
    const isSummary = mode === 'summary';

    const maturityDate = formatMaturityDate(isSummary ? rfq.maturityDate : leg?.maturityDate);
    const premiumSettlementDate = formatPremiumSettlementDate(rfq.premiumSettlementDate);

    return [
        textField('arrivalTime', 'Arrival Time', rfq.arrivalTime),
        textField('quantity', 'Quantity', isSummary ? summary?.totalQuantity : leg?.quantity),
        textField('maturityDate', 'Maturity Date', maturityDate),
        textField('daysToExpiry', 'Days To Expiry', isSummary ? rfq.daysToExpiry : leg?.daysToExpiry),
        textField('rfqId', 'RFQ ID', rfq.rfqId),
        textField('status', 'Status', rfq.status),
        textField('client', 'Client', rfq.client, { editable: true, type: 'select', options: withCurrentOption(fieldOptions.client, rfq.client) }),
        textField('bookCode', 'Book', rfq.bookCode, { editable: true, type: 'select', options: withCurrentOption(fieldOptions.bookCode, rfq.bookCode) }),
        textField('underlying', 'Underlying', isSummary ? rfq.underlying : leg?.underlying),
        textField('underlyingPrice', 'Underlying Price', rfq.underlyingPrice, { editable: true, type: 'number' }),
        textField('exerciseType', 'Exercise Type', rfq.exerciseType),
        textField('currency', 'Currency', isSummary ? (rfq.notionalCurrency || leg?.currency) : leg?.currency),
        textField('strike', 'Strike', isSummary ? summary?.strikes : leg?.strike),
        textField('multiplier', 'Multiplier', rfq.multiplier, { editable: true, type: 'number' }),
        textField('volatility', 'Volatility', rfq.volatility, { editable: true, type: 'number' }),
        textField('interestRate', 'Interest Rate', rfq.interestRate, { editable: true, type: 'number' }),
        textField('dayCountConvention', 'Day Count', rfq.dayCountConvention, { editable: true, type: 'select', options: withCurrentOption(fieldOptions.dayCountConvention || [360, 365, 250], rfq.dayCountConvention) }),
        textField('spread', 'Spread', rfq.spread, { editable: true, type: 'number' }),
        textField('notionalCurrency', 'Notional Currency', rfq.notionalCurrency),
        textField('notionalFXRate', 'Notional FX Rate', rfq.notionalFXRate, { editable: true, type: 'number' }),
        textField('notionalInLocal', 'Notional In Local', isSummary
            ? formatNotionalInLocal(summary?.totalNotionalInLocal)
            : formatNotionalInLocal(metrics?.notionalInLocal ?? rfq.notionalInLocal)),
        textField('notionalInUSD', 'Notional In USD', isSummary
            ? formatNotionalInUSD(summary?.totalNotionalInUSD, decimalPrecision)
            : formatNotionalInUSD(metrics?.notionalInUSD ?? rfq.notionalInUSD, decimalPrecision)),
        textField('premiumInLocal', 'Premium In Local', isSummary
            ? summary?.totalPremiumInLocal.toFixed(decimalPrecision) || ''
            : derived?.premiumInLocal.toFixed(decimalPrecision) || ''),
        textField('premiumInUSD', 'Premium In USD', isSummary
            ? summary?.totalPremiumInUSD.toFixed(decimalPrecision) || ''
            : derived?.premiumInUSD.toFixed(decimalPrecision) || ''),
        textField('askPremium', 'Ask Premium', isSummary
            ? summary?.totalAskPremium.toFixed(decimalPrecision) || ''
            : metrics ? (metrics.price + metrics.spread / 2).toFixed(decimalPrecision) : ''),
        textField('bidPremium', 'Bid Premium', isSummary
            ? summary?.totalBidPremium.toFixed(decimalPrecision) || ''
            : metrics ? (metrics.price - metrics.spread / 2).toFixed(decimalPrecision) : ''),
        textField('premiumPercentage', 'Premium Percentage', isSummary
            ? summary?.totalPremiumPercentage.toFixed(decimalPrecision) || ''
            : derived?.premiumPercentage.toFixed(decimalPrecision) || ''),
        textField('premiumSettlementCurrency', 'Premium Settlement Currency', rfq.premiumSettlementCurrency, { editable: true, type: 'select', options: withCurrentOption(fieldOptions.premiumSettlementCurrency, rfq.premiumSettlementCurrency) }),
        textField('premiumSettlementDate', 'Premium Settlement Date', premiumSettlementDate, { editable: true, type: 'date' }),
        textField('premiumSettlementDaysOverride', 'Premium Settlement Days Override', rfq.premiumSettlementDaysOverride, { editable: true, type: 'number' }),
        textField('premiumSettlementFXRate', 'Premium Settlement FX Rate', rfq.premiumSettlementFXRate, { editable: true, type: 'number' }),
        textField('salesCreditAmount', 'Sales Credit Amount', isSummary
            ? summary?.totalSalesCreditAmount.toFixed(decimalPrecision) || ''
            : derived?.salesCreditAmount.toFixed(decimalPrecision) || ''),
        textField('salesCreditPercentage', 'Sales Credit Percentage', rfq.salesCreditPercentage, { editable: true, type: 'number' })
    ];
};

export const RFQ_CELL_FLASH_DELAY_MS = 2000;

export const GREEKS_COLUMN_DEFS =
[
    { headerName: 'Field', field: 'field', width: 100, pinned: 'left', cellStyle: { backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '12px' }},
    { headerName: 'Delta', field: 'delta', width: 120 },
    { headerName: 'Gamma', field: 'gamma', width: 120 },
    { headerName: 'Theta', field: 'theta', width: 120 },
    { headerName: 'Vega', field: 'vega', width: 120 },
    { headerName: 'Rho', field: 'rho', width: 120 }
];
