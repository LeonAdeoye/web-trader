import React, { useMemo } from 'react';
import { buildGreeksGridData, buildRfqDetailsTextFields } from '../calculations/rfqDetailsViewModel';
import { RfqDetailsPanel } from './RfqDetailsPanel';

export const RfqDetailsComponent = ({ rfq, editable, mode = 'leg', legResult, legResults, summary, initialLoading, config, fieldOptions, dirtyKeys, draftEpoch, onFieldChange }) =>
{
    const isSummary = mode === 'summary';

    const viewContext = useMemo(() =>
        ({ mode, legResult, legResults, summary }),
    [mode, legResult, legResults, summary]);

    const gridData = useMemo(() =>
        buildGreeksGridData(viewContext, config.decimalPrecision),
    [viewContext, config.decimalPrecision]);

    const textFields = useMemo(() =>
        buildRfqDetailsTextFields(rfq, viewContext, config.decimalPrecision, fieldOptions),
    [rfq, viewContext, config.decimalPrecision, fieldOptions]);

    if (!rfq?.legs?.length)
        return <div>No RFQ data available</div>;

    const hasDisplayData = isSummary ? !!summary : !!legResult;

    if (initialLoading && !hasDisplayData)
        return <div>No RFQ data available</div>;

    if (!hasDisplayData)
        return <div>No RFQ data available</div>;

    return (
        <RfqDetailsPanel
            gridData={gridData}
            textFields={textFields}
            editable={!isSummary && editable}
            dirtyKeys={dirtyKeys}
            draftEpoch={draftEpoch}
            onFieldChange={onFieldChange}/>
    );
};
