import React, { useMemo } from 'react';
import { buildGreeksGridData, buildRfqDetailsTextFields } from '../calculations/rfqDetailsViewModel';
import { RfqDetailsPanel } from './RfqDetailsPanel';

export const RfqDetailsComponent = ({ rfq, editable, mode = 'leg', legResult, legResults, summary, loading, config }) =>
{
    const isSummary = mode === 'summary';

    const viewContext = useMemo(() =>
        ({ mode, legResult, legResults, summary }),
    [mode, legResult, legResults, summary]);

    const gridData = useMemo(() =>
        buildGreeksGridData(viewContext, config.decimalPrecision),
    [viewContext, config.decimalPrecision]);

    const textFields = useMemo(() =>
        buildRfqDetailsTextFields(rfq, viewContext, config.decimalPrecision),
    [rfq, viewContext, config.decimalPrecision]);

    if (!rfq?.legs?.length || loading)
        return <div>No RFQ data available</div>;

    if (isSummary && !summary)
        return <div>No RFQ data available</div>;

    if (!isSummary && !legResult)
        return <div>No RFQ data available</div>;

    return (
        <RfqDetailsPanel
            gridData={gridData}
            textFields={textFields}
            editable={!isSummary && editable}/>
    );
};
