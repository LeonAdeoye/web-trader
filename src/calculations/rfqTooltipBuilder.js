import { formatNumber } from "../utilities";

export const NOTIONAL_USD_HEADER_TOOLTIP = "Notional in USD = notionalInLocal / notionalFXRate";
export const NOTIONAL_LOCAL_HEADER_TOOLTIP = "Notional in Local = Σ (quantity × multiplier × strike)";
export const PREMIUM_USD_HEADER_TOOLTIP = "Fair Premium$ = premiumInLocal / notionalFXRate";
export const SALES_CREDIT_HEADER_TOOLTIP = "S.Credit$ = (salesCreditPercentage × notionalInUSD) / 100";
export const DELTA_SHARES_HEADER_TOOLTIP = "Delta Shares = delta × multiplier";
export const DELTA_NOTIONAL_HEADER_TOOLTIP = "Delta Notional = deltaShares × underlyingPrice";
export const DELTA_PERCENT_HEADER_TOOLTIP = "Delta % = (delta × 100) / underlyingPrice";
export const PREMIUM_LOCAL_HEADER_TOOLTIP = "Fair Premium = theoretical option model price (local)";
export const ASK_PREMIUM_HEADER_TOOLTIP = "Ask Premium = premiumInLocal + (spread / 2)";
export const BID_PREMIUM_HEADER_TOOLTIP = "Bid Premium = premiumInLocal − (spread / 2)";
export const PREMIUM_PERCENT_HEADER_TOOLTIP = "Fair Premium% = (premiumInLocal × 100) / underlyingPrice";
export const GAMMA_SHARES_HEADER_TOOLTIP = "Gamma Shares = gamma × multiplier";
export const GAMMA_NOTIONAL_HEADER_TOOLTIP = "Gamma Notional = gammaShares × underlyingPrice";
export const GAMMA_PERCENT_HEADER_TOOLTIP = "Gamma % = (gamma × 100) / underlyingPrice";
export const THETA_SHARES_HEADER_TOOLTIP = "Theta Shares = theta × multiplier";
export const THETA_NOTIONAL_HEADER_TOOLTIP = "Theta Notional = thetaShares × underlyingPrice";
export const THETA_PERCENT_HEADER_TOOLTIP = "Theta % = (theta × 100) / underlyingPrice";
export const VEGA_SHARES_HEADER_TOOLTIP = "Vega Shares = vega × multiplier";
export const VEGA_NOTIONAL_HEADER_TOOLTIP = "Vega Notional = vegaShares × underlyingPrice";
export const VEGA_PERCENT_HEADER_TOOLTIP = "Vega % = (vega × 100) / underlyingPrice";
export const ASK_PREMIUM_PERCENT_HEADER_TOOLTIP = "Ask Premium% = (askPremiumInLocal × 100) / underlyingPrice";
export const BID_PREMIUM_PERCENT_HEADER_TOOLTIP = "Bid Premium% = (bidPremiumInLocal × 100) / underlyingPrice";
export const RHO_SHARES_HEADER_TOOLTIP = "Rho Shares = rho × multiplier";
export const RHO_NOTIONAL_HEADER_TOOLTIP = "Rho Notional = rhoShares × underlyingPrice";
export const RHO_PERCENT_HEADER_TOOLTIP = "Rho % = (rho × 100) / underlyingPrice";

const parseNumeric = (value) =>
{
    if (value === null || value === undefined || value === '')
        return NaN;

    if (typeof value === 'number')
        return value;

    return Number(String(value).replace(/,/g, ''));
};

const formatCalcTooltip = (formula, substitution, result) =>
{
    const resultValue = parseNumeric(result);

    if (Number.isNaN(resultValue))
        return formula;

    if (substitution == null || substitution === '')
        return `${formula}\n= ${formatNumber(resultValue)}`;

    return `${formula}\n= ${substitution}\n= ${formatNumber(resultValue)}`;
};

const formatLegSum = (legs, multiplier, buildLegExpression) =>
{
    if (!legs?.length)
        return null;

    const expressions = legs.map(leg => buildLegExpression(leg, multiplier));

    if (expressions.length === 1)
        return expressions[0];

    return expressions.join(' + ');
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

    return formatCalcTooltip(NOTIONAL_USD_HEADER_TOOLTIP, `${formatNumber(notionalInLocal)} / ${formatNumber(notionalFXRate)}`, notionalInUSD);
};

export const getNotionalLocalTooltip = (row) =>
{
    if (!row)
        return NOTIONAL_LOCAL_HEADER_TOOLTIP;

    const multiplier = parseNumeric(row.multiplier);
    const notionalInLocal = parseNumeric(row.notionalInLocal);
    const substitution = formatLegSum(row.legs, multiplier, (leg, mult) => `${formatNumber(parseNumeric(leg.quantity))} × ${formatNumber(mult)} × ${formatNumber(parseNumeric(leg.strike))}`);

    if (!substitution || Number.isNaN(notionalInLocal))
        return NOTIONAL_LOCAL_HEADER_TOOLTIP;

    return formatCalcTooltip(NOTIONAL_LOCAL_HEADER_TOOLTIP, substitution, notionalInLocal);
};

export const getPremiumUSDTooltip = (row) =>
{
    if (!row)
        return PREMIUM_USD_HEADER_TOOLTIP;

    const premiumInLocal = parseNumeric(row.premiumInLocal);
    const notionalFXRate = parseNumeric(row.notionalFXRate);
    const premiumInUSD = parseNumeric(row.premiumInUSD);

    if (Number.isNaN(premiumInLocal) || Number.isNaN(notionalFXRate) || Number.isNaN(premiumInUSD))
        return PREMIUM_USD_HEADER_TOOLTIP;

    return formatCalcTooltip(PREMIUM_USD_HEADER_TOOLTIP, `${formatNumber(premiumInLocal)} / ${formatNumber(notionalFXRate)}`, premiumInUSD);
};

export const getSalesCreditTooltip = (row) =>
{
    if (!row)
        return SALES_CREDIT_HEADER_TOOLTIP;

    const salesCreditPercentage = parseNumeric(row.salesCreditPercentage);
    const notionalInUSD = parseNumeric(row.notionalInUSD);
    const salesCreditAmount = parseNumeric(row.salesCreditAmount);

    if (Number.isNaN(salesCreditPercentage) || Number.isNaN(notionalInUSD) || Number.isNaN(salesCreditAmount))
        return SALES_CREDIT_HEADER_TOOLTIP;

    return formatCalcTooltip(SALES_CREDIT_HEADER_TOOLTIP, `(${formatNumber(salesCreditPercentage)} × ${formatNumber(notionalInUSD)}) / 100`, salesCreditAmount);
};

export const getDeltaSharesTooltip = (row) =>
{
    if (!row)
        return DELTA_SHARES_HEADER_TOOLTIP;

    const delta = parseNumeric(row.delta);
    const multiplier = parseNumeric(row.multiplier);
    const deltaShares = parseNumeric(row.deltaShares);

    if (Number.isNaN(delta) || Number.isNaN(multiplier) || Number.isNaN(deltaShares))
        return DELTA_SHARES_HEADER_TOOLTIP;

    return formatCalcTooltip(DELTA_SHARES_HEADER_TOOLTIP, `${formatNumber(delta)} × ${formatNumber(multiplier)}`, deltaShares);
};

export const getDeltaNotionalTooltip = (row) =>
{
    if (!row)
        return DELTA_NOTIONAL_HEADER_TOOLTIP;

    const deltaShares = parseNumeric(row.deltaShares);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const deltaNotional = parseNumeric(row.deltaNotional);

    if (Number.isNaN(deltaShares) || Number.isNaN(underlyingPrice) || Number.isNaN(deltaNotional))
        return DELTA_NOTIONAL_HEADER_TOOLTIP;

    return formatCalcTooltip(DELTA_NOTIONAL_HEADER_TOOLTIP, `${formatNumber(deltaShares)} × ${formatNumber(underlyingPrice)}`, deltaNotional);
};

export const getDeltaPercentTooltip = (row) =>
{
    if (!row)
        return DELTA_PERCENT_HEADER_TOOLTIP;

    const delta = parseNumeric(row.delta);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const deltaPercent = parseNumeric(row.deltaPercent);

    if (Number.isNaN(delta) || Number.isNaN(underlyingPrice) || Number.isNaN(deltaPercent))
        return DELTA_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(DELTA_PERCENT_HEADER_TOOLTIP, `(${formatNumber(delta)} × 100) / ${formatNumber(underlyingPrice)}`, deltaPercent);
};

export const getPremiumLocalTooltip = (row) =>
{
    if (!row)
        return PREMIUM_LOCAL_HEADER_TOOLTIP;

    const premiumInLocal = parseNumeric(row.premiumInLocal);

    if (Number.isNaN(premiumInLocal))
        return PREMIUM_LOCAL_HEADER_TOOLTIP;

    return formatCalcTooltip(PREMIUM_LOCAL_HEADER_TOOLTIP, null, premiumInLocal);
};

export const getAskPremiumTooltip = (row) =>
{
    if (!row)
        return ASK_PREMIUM_HEADER_TOOLTIP;

    const premiumInLocal = parseNumeric(row.premiumInLocal);
    const spread = parseNumeric(row.spread);
    const askPremiumInLocal = parseNumeric(row.askPremiumInLocal);

    if (Number.isNaN(premiumInLocal) || Number.isNaN(spread) || Number.isNaN(askPremiumInLocal))
        return ASK_PREMIUM_HEADER_TOOLTIP;

    return formatCalcTooltip(ASK_PREMIUM_HEADER_TOOLTIP, `${formatNumber(premiumInLocal)} + (${formatNumber(spread)} / 2)`, askPremiumInLocal);
};

export const getBidPremiumTooltip = (row) =>
{
    if (!row)
        return BID_PREMIUM_HEADER_TOOLTIP;

    const premiumInLocal = parseNumeric(row.premiumInLocal);
    const spread = parseNumeric(row.spread);
    const bidPremiumInLocal = parseNumeric(row.bidPremiumInLocal);

    if (Number.isNaN(premiumInLocal) || Number.isNaN(spread) || Number.isNaN(bidPremiumInLocal))
        return BID_PREMIUM_HEADER_TOOLTIP;

    return formatCalcTooltip(BID_PREMIUM_HEADER_TOOLTIP, `${formatNumber(premiumInLocal)} − (${formatNumber(spread)} / 2)`, bidPremiumInLocal);
};

export const getPremiumPercentTooltip = (row) =>
{
    if (!row)
        return PREMIUM_PERCENT_HEADER_TOOLTIP;

    const premiumInLocal = parseNumeric(row.premiumInLocal);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const premiumPercentage = parseNumeric(row.premiumPercentage);

    if (Number.isNaN(premiumInLocal) || Number.isNaN(underlyingPrice) || Number.isNaN(premiumPercentage))
        return PREMIUM_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(PREMIUM_PERCENT_HEADER_TOOLTIP, `(${formatNumber(premiumInLocal)} × 100) / ${formatNumber(underlyingPrice)}`, premiumPercentage);
};

export const getGammaSharesTooltip = (row) =>
{
    if (!row)
        return GAMMA_SHARES_HEADER_TOOLTIP;

    const gamma = parseNumeric(row.gamma);
    const multiplier = parseNumeric(row.multiplier);
    const gammaShares = parseNumeric(row.gammaShares);

    if (Number.isNaN(gamma) || Number.isNaN(multiplier) || Number.isNaN(gammaShares))
        return GAMMA_SHARES_HEADER_TOOLTIP;

    return formatCalcTooltip(GAMMA_SHARES_HEADER_TOOLTIP, `${formatNumber(gamma)} × ${formatNumber(multiplier)}`, gammaShares);
};

export const getGammaNotionalTooltip = (row) =>
{
    if (!row)
        return GAMMA_NOTIONAL_HEADER_TOOLTIP;

    const gammaShares = parseNumeric(row.gammaShares);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const gammaNotional = parseNumeric(row.gammaNotional);

    if (Number.isNaN(gammaShares) || Number.isNaN(underlyingPrice) || Number.isNaN(gammaNotional))
        return GAMMA_NOTIONAL_HEADER_TOOLTIP;

    return formatCalcTooltip(GAMMA_NOTIONAL_HEADER_TOOLTIP, `${formatNumber(gammaShares)} × ${formatNumber(underlyingPrice)}`, gammaNotional);
};

export const getGammaPercentTooltip = (row) =>
{
    if (!row)
        return GAMMA_PERCENT_HEADER_TOOLTIP;

    const gamma = parseNumeric(row.gamma);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const gammaPercent = parseNumeric(row.gammaPercent);

    if (Number.isNaN(gamma) || Number.isNaN(underlyingPrice) || Number.isNaN(gammaPercent))
        return GAMMA_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(GAMMA_PERCENT_HEADER_TOOLTIP, `(${formatNumber(gamma)} × 100) / ${formatNumber(underlyingPrice)}`, gammaPercent);
};

export const getThetaSharesTooltip = (row) =>
{
    if (!row)
        return THETA_SHARES_HEADER_TOOLTIP;

    const theta = parseNumeric(row.theta);
    const multiplier = parseNumeric(row.multiplier);
    const thetaShares = parseNumeric(row.thetaShares);

    if (Number.isNaN(theta) || Number.isNaN(multiplier) || Number.isNaN(thetaShares))
        return THETA_SHARES_HEADER_TOOLTIP;

    return formatCalcTooltip(THETA_SHARES_HEADER_TOOLTIP, `${formatNumber(theta)} × ${formatNumber(multiplier)}`, thetaShares);
};

export const getThetaNotionalTooltip = (row) =>
{
    if (!row)
        return THETA_NOTIONAL_HEADER_TOOLTIP;

    const thetaShares = parseNumeric(row.thetaShares);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const thetaNotional = parseNumeric(row.thetaNotional);

    if (Number.isNaN(thetaShares) || Number.isNaN(underlyingPrice) || Number.isNaN(thetaNotional))
        return THETA_NOTIONAL_HEADER_TOOLTIP;

    return formatCalcTooltip(THETA_NOTIONAL_HEADER_TOOLTIP, `${formatNumber(thetaShares)} × ${formatNumber(underlyingPrice)}`, thetaNotional);
};

export const getThetaPercentTooltip = (row) =>
{
    if (!row)
        return THETA_PERCENT_HEADER_TOOLTIP;

    const theta = parseNumeric(row.theta);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const thetaPercent = parseNumeric(row.thetaPercent);

    if (Number.isNaN(theta) || Number.isNaN(underlyingPrice) || Number.isNaN(thetaPercent))
        return THETA_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(THETA_PERCENT_HEADER_TOOLTIP, `(${formatNumber(theta)} × 100) / ${formatNumber(underlyingPrice)}`, thetaPercent);
};

export const getVegaSharesTooltip = (row) =>
{
    if (!row)
        return VEGA_SHARES_HEADER_TOOLTIP;

    const vega = parseNumeric(row.vega);
    const multiplier = parseNumeric(row.multiplier);
    const vegaShares = parseNumeric(row.vegaShares);

    if (Number.isNaN(vega) || Number.isNaN(multiplier) || Number.isNaN(vegaShares))
        return VEGA_SHARES_HEADER_TOOLTIP;

    return formatCalcTooltip(VEGA_SHARES_HEADER_TOOLTIP, `${formatNumber(vega)} × ${formatNumber(multiplier)}`, vegaShares);
};

export const getVegaNotionalTooltip = (row) =>
{
    if (!row)
        return VEGA_NOTIONAL_HEADER_TOOLTIP;

    const vegaShares = parseNumeric(row.vegaShares);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const vegaNotional = parseNumeric(row.vegaNotional);

    if (Number.isNaN(vegaShares) || Number.isNaN(underlyingPrice) || Number.isNaN(vegaNotional))
        return VEGA_NOTIONAL_HEADER_TOOLTIP;

    return formatCalcTooltip(VEGA_NOTIONAL_HEADER_TOOLTIP, `${formatNumber(vegaShares)} × ${formatNumber(underlyingPrice)}`, vegaNotional);
};

export const getVegaPercentTooltip = (row) =>
{
    if (!row)
        return VEGA_PERCENT_HEADER_TOOLTIP;

    const vega = parseNumeric(row.vega);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const vegaPercent = parseNumeric(row.vegaPercent);

    if (Number.isNaN(vega) || Number.isNaN(underlyingPrice) || Number.isNaN(vegaPercent))
        return VEGA_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(VEGA_PERCENT_HEADER_TOOLTIP, `(${formatNumber(vega)} × 100) / ${formatNumber(underlyingPrice)}`, vegaPercent);
};

export const getAskPremiumPercentTooltip = (row) =>
{
    if (!row)
        return ASK_PREMIUM_PERCENT_HEADER_TOOLTIP;

    const askPremiumInLocal = parseNumeric(row.askPremiumInLocal);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const askPremiumPercentage = parseNumeric(row.askPremiumPercentage);

    if (Number.isNaN(askPremiumInLocal) || Number.isNaN(underlyingPrice) || Number.isNaN(askPremiumPercentage))
        return ASK_PREMIUM_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(ASK_PREMIUM_PERCENT_HEADER_TOOLTIP, `(${formatNumber(askPremiumInLocal)} × 100) / ${formatNumber(underlyingPrice)}`, askPremiumPercentage);
};

export const getBidPremiumPercentTooltip = (row) =>
{
    if (!row)
        return BID_PREMIUM_PERCENT_HEADER_TOOLTIP;

    const bidPremiumInLocal = parseNumeric(row.bidPremiumInLocal);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const bidPremiumPercentage = parseNumeric(row.bidPremiumPercentage);

    if (Number.isNaN(bidPremiumInLocal) || Number.isNaN(underlyingPrice) || Number.isNaN(bidPremiumPercentage))
        return BID_PREMIUM_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(BID_PREMIUM_PERCENT_HEADER_TOOLTIP, `(${formatNumber(bidPremiumInLocal)} × 100) / ${formatNumber(underlyingPrice)}`, bidPremiumPercentage);
};

export const getRhoSharesTooltip = (row) =>
{
    if (!row)
        return RHO_SHARES_HEADER_TOOLTIP;

    const rho = parseNumeric(row.rho);
    const multiplier = parseNumeric(row.multiplier);
    const rhoShares = parseNumeric(row.rhoShares);

    if (Number.isNaN(rho) || Number.isNaN(multiplier) || Number.isNaN(rhoShares))
        return RHO_SHARES_HEADER_TOOLTIP;

    return formatCalcTooltip(RHO_SHARES_HEADER_TOOLTIP, `${formatNumber(rho)} × ${formatNumber(multiplier)}`, rhoShares);
};

export const getRhoNotionalTooltip = (row) =>
{
    if (!row)
        return RHO_NOTIONAL_HEADER_TOOLTIP;

    const rhoShares = parseNumeric(row.rhoShares);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const rhoNotional = parseNumeric(row.rhoNotional);

    if (Number.isNaN(rhoShares) || Number.isNaN(underlyingPrice) || Number.isNaN(rhoNotional))
        return RHO_NOTIONAL_HEADER_TOOLTIP;

    return formatCalcTooltip(RHO_NOTIONAL_HEADER_TOOLTIP, `${formatNumber(rhoShares)} × ${formatNumber(underlyingPrice)}`, rhoNotional);
};

export const getRhoPercentTooltip = (row) =>
{
    if (!row)
        return RHO_PERCENT_HEADER_TOOLTIP;

    const rho = parseNumeric(row.rho);
    const underlyingPrice = parseNumeric(row.underlyingPrice);
    const rhoPercent = parseNumeric(row.rhoPercent);

    if (Number.isNaN(rho) || Number.isNaN(underlyingPrice) || Number.isNaN(rhoPercent))
        return RHO_PERCENT_HEADER_TOOLTIP;

    return formatCalcTooltip(RHO_PERCENT_HEADER_TOOLTIP, `(${formatNumber(rho)} × 100) / ${formatNumber(underlyingPrice)}`, rhoPercent);
};
