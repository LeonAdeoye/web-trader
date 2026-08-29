import { buildMetrics } from "./buildMetrics";
import { buildDerivedValues } from "./buidDerivedValues";

const GREEK_NAMES = ['delta', 'gamma', 'theta', 'vega', 'rho'];
const GREEK_GRID_ROWS = ['Greek', 'Notional', 'Percent', 'Shares'];

export const getOptionPricingParams = (rfq, leg, config) =>
({
    strike: leg.strike,
    volatility: rfq.volatility / 100,
    underlyingPrice: rfq.underlyingPrice,
    daysToExpiry: rfq.daysToExpiry || leg.daysToExpiry || 30,
    interestRate: rfq.interestRate / 100,
    isCall: leg.optionType === 'CALL',
    isEuropean: rfq.exerciseType === "EUROPEAN",
    dayCountConvention: rfq.dayCountConvention || '365',
    ...(config?.defaultOptionModel ? { modelType: config.defaultOptionModel } : {})
});

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

export const buildRfqDetailsTextFields = (rfq, viewContext, decimalPrecision) =>
{
    const { mode, legResult, summary } = viewContext;
    const leg = legResult?.leg;
    const metrics = legResult?.metrics;
    const derived = legResult?.derived;
    const isSummary = mode === 'summary';

    const maturityDate = formatMaturityDate(isSummary ? rfq.maturityDate : leg?.maturityDate);
    const premiumSettlementDate = formatPremiumSettlementDate(rfq.premiumSettlementDate);

    return [
        { label: "Arrival Time", value: rfq.arrivalTime || '' },
        { label: "Quantity", value: isSummary ? summary?.totalQuantity || '' : leg?.quantity || '' },
        { label: "Maturity Date", value: maturityDate },
        { label: "Days To Expiry", value: isSummary ? (rfq.daysToExpiry || '') : (leg?.daysToExpiry || '') },
        { label: "RFQ ID", value: rfq.rfqId || '' },
        { label: "Status", value: rfq.status || '' },
        { label: "Multiplier", value: rfq.multiplier || '' },
        { label: "Volatility", value: rfq.volatility || '' },
        { label: "Underlying", value: isSummary ? (rfq.underlying || '') : (leg?.underlying || '') },
        { label: "Underlying Price", value: rfq.underlyingPrice || '' },
        { label: "Exercise Type", value: rfq.exerciseType || '' },
        { label: "Currency", value: isSummary ? (rfq.notionalCurrency || leg?.currency || '') : (leg?.currency || '') },
        { label: "Strike", value: isSummary ? (summary?.strikes || '') : (leg?.strike || '') },
        { label: "Interest Rate", value: rfq.interestRate || '' },
        { label: "Notional Currency", value: rfq.notionalCurrency || '' },
        { label: "Notional FX Rate", value: rfq.notionalFXRate || '' },
        {
            label: "Notional In Local",
            value: isSummary
                ? summary?.totalNotionalInLocal.toFixed(decimalPrecision) || ''
                : (rfq.notionalInLocal || '')
        },
        {
            label: "Notional In USD",
            value: isSummary
                ? summary?.totalNotionalInUSD.toFixed(decimalPrecision) || ''
                : (rfq.notionalInUSD || '')
        },
        {
            label: "Premium In Local",
            value: isSummary
                ? summary?.totalPremiumInLocal.toFixed(decimalPrecision) || ''
                : derived?.premiumInLocal.toFixed(decimalPrecision) || ''
        },
        {
            label: "Premium In USD",
            value: isSummary
                ? summary?.totalPremiumInUSD.toFixed(decimalPrecision) || ''
                : derived?.premiumInUSD.toFixed(decimalPrecision) || ''
        },
        {
            label: "Ask Premium",
            value: isSummary
                ? summary?.totalAskPremium.toFixed(decimalPrecision) || ''
                : metrics ? (metrics.price + metrics.spread / 2).toFixed(decimalPrecision) : ''
        },
        {
            label: "Bid Premium",
            value: isSummary
                ? summary?.totalBidPremium.toFixed(decimalPrecision) || ''
                : metrics ? (metrics.price - metrics.spread / 2).toFixed(decimalPrecision) : ''
        },
        {
            label: "Premium Percentage",
            value: isSummary
                ? summary?.totalPremiumPercentage.toFixed(decimalPrecision) || ''
                : derived?.premiumPercentage.toFixed(decimalPrecision) || ''
        },
        { label: "Premium Settlement Currency", value: rfq.premiumSettlementCurrency || '' },
        { label: "Premium Settlement Date", value: premiumSettlementDate },
        { label: "Premium Settlement Days Override", value: rfq.premiumSettlementDaysOverride || '' },
        { label: "Premium Settlement FX Rate", value: rfq.premiumSettlementFXRate || '' },
        {
            label: "Sales Credit Amount",
            value: isSummary
                ? summary?.totalSalesCreditAmount.toFixed(decimalPrecision) || ''
                : derived?.salesCreditAmount.toFixed(decimalPrecision) || ''
        },
        { label: "Sales Credit Percentage", value: rfq.salesCreditPercentage || '' }
    ];
};

export const GREEKS_COLUMN_DEFS =
[
    { headerName: 'Field', field: 'field', width: 100, pinned: 'left', cellStyle: { backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '12px' }},
    { headerName: 'Delta', field: 'delta', width: 120 },
    { headerName: 'Gamma', field: 'gamma', width: 120 },
    { headerName: 'Theta', field: 'theta', width: 120 },
    { headerName: 'Vega', field: 'vega', width: 120 },
    { headerName: 'Rho', field: 'rho', width: 120 }
];
