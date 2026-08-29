import { buildMetrics } from './buildMetrics';
import { buildDerivedValues } from './buidDerivedValues';

const buildLegResult = (rfq, leg, greeks) =>
{
    const metrics = buildMetrics(rfq, leg, greeks);
    return { leg, metrics, derived: buildDerivedValues(rfq, leg, metrics) };
};

export const DEFAULT_RFQ_RECALCULATION_PERIOD_SECONDS = 30;

export const getRfqRecalculationIntervalMs = (config) =>
    Math.max(1, config?.recalculationPeriodSeconds ?? DEFAULT_RFQ_RECALCULATION_PERIOD_SECONDS) * 1000;

export const resolveOptionModel = (rfq, config) =>
    rfq.optionModel ?? config?.defaultOptionModel ?? 'european';

export const prepareRfqForPricing = (rfq, { priceService, optionRequestParserService }) =>
{
    if (!rfq?.legs?.length)
        return rfq;

    const underlyingPrice = priceService.getLastTradePrice(rfq.underlying) ?? rfq.underlyingPrice;
    const daysToExpiry = rfq.maturityDate
        ? optionRequestParserService.calculateBusinessDaysToExpiry(new Date(), new Date(rfq.maturityDate))
        : rfq.daysToExpiry;

    return { ...rfq, underlyingPrice, daysToExpiry };
};

export const buildPricingRequest = (rfq, leg, optionModel) =>
({
    strike: leg.strike,
    volatility: rfq.volatility / 100,
    underlyingPrice: rfq.underlyingPrice,
    daysToExpiry: rfq.daysToExpiry || leg.daysToExpiry || 30,
    interestRate: rfq.interestRate / 100,
    isCall: leg.optionType === 'CALL',
    isEuropean: rfq.exerciseType === 'EUROPEAN',
    dayCountConvention: rfq.dayCountConvention ?? 250,
    modelType: optionModel
});

export const getOptionPricingParams = (rfq, leg, config) =>
    buildPricingRequest(rfq, leg, resolveOptionModel(rfq, config));

export const calculatePortfolioMetrics = (pricedRfq, legResults) =>
{
    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;
    let totalRho = 0;
    let totalPrice = 0;
    let totalShares = 0;
    let totalNotionalInLocal = 0;
    let totalNotionalInUSD = 0;

    for (const { leg, metrics } of legResults)
    {
        totalDelta += metrics.delta * leg.quantity;
        totalGamma += metrics.gamma * leg.quantity;
        totalTheta += metrics.theta * leg.quantity;
        totalVega += metrics.vega * leg.quantity;
        totalRho += metrics.rho * leg.quantity;
        totalPrice += metrics.price * leg.quantity;
        totalShares += metrics.shares;
        totalNotionalInLocal += metrics.notionalInLocal;
        totalNotionalInUSD += metrics.notionalInUSD;
    }

    return {
        notionalInLocal: totalNotionalInLocal,
        notionalInUSD: totalNotionalInUSD,
        daysToExpiry: pricedRfq.daysToExpiry,
        price: totalPrice,
        deltaNumber: totalDelta,
        gammaNumber: totalGamma,
        thetaNumber: totalTheta,
        vegaNumber: totalVega,
        rhoNumber: totalRho,
        shares: totalShares,
        notionalShares: totalShares * pricedRfq.underlyingPrice
    };
};

export const calculatePortfolioDerivedValues = (portfolioMetrics, pricedRfq, config) =>
{
    const { notionalInUSD, price, deltaNumber, gammaNumber, thetaNumber, vegaNumber, rhoNumber } = portfolioMetrics;
    const { spread, notionalFXRate, multiplier = 100, legs } = pricedRfq;
    const salesCreditPercentage = pricedRfq.salesCreditPercentage ?? config.defaultSalesCreditPercentage;
    const underlyingPrice = pricedRfq.underlyingPrice;
    const decimalPrecision = config.decimalPrecision;

    let weightedVolatility = 0;
    let weightedInterestRate = 0;
    let totalWeight = 0;

    for (const leg of legs)
    {
        const legWeight = leg.quantity * multiplier;
        weightedVolatility += leg.volatility * legWeight;
        weightedInterestRate += leg.interestRate * legWeight;
        totalWeight += legWeight;
    }

    const avgVolatility = totalWeight > 0 ? weightedVolatility / totalWeight : 0;
    const askPremium = price + spread / 2;
    const bidPremium = price - spread / 2;

    return {
        askPremium: askPremium.toFixed(decimalPrecision),
        bidPremium: bidPremium.toFixed(decimalPrecision),
        salesCreditPercentage,
        salesCreditAmount: ((salesCreditPercentage * notionalInUSD) / 100).toFixed(decimalPrecision),
        askImpliedVol: avgVolatility / 100,
        impliedVol: avgVolatility / 100,
        bidImpliedVol: avgVolatility / 100,
        premiumInUSD: (price / notionalFXRate).toFixed(decimalPrecision),
        premiumInLocal: price.toFixed(decimalPrecision),
        askPremiumInLocal: askPremium.toFixed(decimalPrecision),
        bidPremiumInLocal: bidPremium.toFixed(decimalPrecision),
        askPremiumPercentage: ((askPremium * 100) / underlyingPrice).toFixed(decimalPrecision),
        premiumPercentage: ((price * 100) / underlyingPrice).toFixed(decimalPrecision),
        bidPremiumPercentage: ((bidPremium * 100) / underlyingPrice).toFixed(decimalPrecision),
        deltaShares: (deltaNumber * multiplier).toFixed(decimalPrecision),
        deltaNotional: (deltaNumber * multiplier * underlyingPrice).toFixed(decimalPrecision),
        delta: deltaNumber.toFixed(decimalPrecision),
        deltaPercent: ((deltaNumber * 100) / underlyingPrice).toFixed(decimalPrecision),
        gammaShares: (gammaNumber * multiplier).toFixed(decimalPrecision),
        gammaNotional: (gammaNumber * multiplier * underlyingPrice).toFixed(decimalPrecision),
        gamma: gammaNumber.toFixed(decimalPrecision),
        gammaPercent: ((gammaNumber * 100) / underlyingPrice).toFixed(decimalPrecision),
        thetaShares: (thetaNumber * multiplier).toFixed(decimalPrecision),
        thetaNotional: (thetaNumber * multiplier * underlyingPrice).toFixed(decimalPrecision),
        theta: thetaNumber.toFixed(decimalPrecision),
        thetaPercent: ((thetaNumber * 100) / underlyingPrice).toFixed(decimalPrecision),
        vegaShares: (vegaNumber * multiplier).toFixed(decimalPrecision),
        vegaNotional: (vegaNumber * multiplier * underlyingPrice).toFixed(decimalPrecision),
        vega: vegaNumber.toFixed(decimalPrecision),
        vegaPercent: ((vegaNumber * 100) / underlyingPrice).toFixed(decimalPrecision),
        rhoShares: (rhoNumber * multiplier).toFixed(decimalPrecision),
        rhoNotional: (rhoNumber * multiplier * underlyingPrice).toFixed(decimalPrecision),
        rho: rhoNumber.toFixed(decimalPrecision),
        rhoPercent: ((rhoNumber * 100) / underlyingPrice).toFixed(decimalPrecision)
    };
};

export const calculateRfqOptionMetrics = async (rfq, config, { optionPricingService, optionRequestParserService, priceService }) =>
{
    if (!rfq?.legs?.length)
        return null;

    const pricedRfq = prepareRfqForPricing(rfq, { priceService, optionRequestParserService });
    const optionModel = resolveOptionModel(pricedRfq, config);

    const legResults = await Promise.all(pricedRfq.legs.map(async (leg) =>
    {
        const greeks = await optionPricingService.calculateOptionPrice(buildPricingRequest(pricedRfq, leg, optionModel));
        return buildLegResult(pricedRfq, leg, greeks);
    }));

    const portfolioMetrics = calculatePortfolioMetrics(pricedRfq, legResults);
    const derivedValues = calculatePortfolioDerivedValues(portfolioMetrics, pricedRfq, config);

    return { pricedRfq, optionModel, legResults, portfolioMetrics, derivedValues };
};

export const buildRfqPricingFieldUpdates = (pricingResult, config, optionRequestParserService) =>
{
    const { pricedRfq, optionModel, portfolioMetrics, derivedValues } = pricingResult;
    const premiumSettlementDate = optionRequestParserService.calculateSettlementDate(
        pricedRfq.maturityDate,
        pricedRfq.premiumSettlementDaysOverride ?? config.defaultSettlementDays
    );

    return {
        underlyingPrice: pricedRfq.underlyingPrice,
        daysToExpiry: pricedRfq.daysToExpiry,
        optionModel,
        pricedAt: new Date().toISOString(),
        notionalInUSD: portfolioMetrics.notionalInUSD.toFixed(config.decimalPrecision),
        notionalInLocal: portfolioMetrics.notionalInLocal,
        salesCreditAmount: derivedValues.salesCreditAmount,
        premiumSettlementDate,
        askImpliedVol: derivedValues.askImpliedVol,
        impliedVol: derivedValues.impliedVol,
        bidImpliedVol: derivedValues.bidImpliedVol,
        askPremiumInLocal: derivedValues.askPremiumInLocal,
        premiumInUSD: derivedValues.premiumInUSD,
        premiumInLocal: derivedValues.premiumInLocal,
        bidPremiumInLocal: derivedValues.bidPremiumInLocal,
        askPremiumPercentage: derivedValues.askPremiumPercentage,
        premiumPercentage: derivedValues.premiumPercentage,
        bidPremiumPercentage: derivedValues.bidPremiumPercentage,
        deltaShares: derivedValues.deltaShares,
        deltaNotional: derivedValues.deltaNotional,
        delta: derivedValues.delta,
        deltaPercent: derivedValues.deltaPercent,
        gammaShares: derivedValues.gammaShares,
        gammaNotional: derivedValues.gammaNotional,
        gamma: derivedValues.gamma,
        gammaPercent: derivedValues.gammaPercent,
        thetaShares: derivedValues.thetaShares,
        thetaNotional: derivedValues.thetaNotional,
        theta: derivedValues.theta,
        thetaPercent: derivedValues.thetaPercent,
        vegaShares: derivedValues.vegaShares,
        vegaNotional: derivedValues.vegaNotional,
        vega: derivedValues.vega,
        vegaPercent: derivedValues.vegaPercent,
        rhoShares: derivedValues.rhoShares,
        rhoNotional: derivedValues.rhoNotional,
        rho: derivedValues.rho,
        rhoPercent: derivedValues.rhoPercent
    };
};

export const getPortfolioDelta = (summary) => summary?.greekSums?.delta ?? null;
