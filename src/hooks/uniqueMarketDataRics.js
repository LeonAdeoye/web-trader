export const uniqueMarketDataRics = (rics) =>
    [...new Set((rics || []).filter(Boolean))].sort();
