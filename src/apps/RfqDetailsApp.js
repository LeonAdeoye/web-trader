import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { LoggerService } from '../services/LoggerService';
import { OptionPricingService } from '../services/OptionPricingService';
import { OptionRequestParserService } from '../services/OptionRequestParserService';
import { BookService } from '../services/BookService';
import { ServiceRegistry } from '../services/ServiceRegistry';
import TitleBarComponent from "../components/TitleBarComponent";
import { RfqDetailsComponent } from "../components/RfqDetailsComponent";
import { useRfqAllLegCalculations } from '../hooks/useRfqAllLegCalculations';
import { useRfqAppConfig } from '../hooks/useRfqAppConfig';
import { parseRfqConfigParam } from '../config/rfqAppConfig';
import { buildRfqDetailsDirtyChanges } from '../calculations/rfqDetailsViewModel';

const DAY_COUNT_CONVENTIONS = [360, 365, 250];

const RfqDetailsContent = ({ initialRfq, config, editable, windowId }) =>
{
    const loggerService = useRef(new LoggerService(RfqDetailsApp.name)).current;
    const optionPricingService = useMemo(() => new OptionPricingService(), []);
    const optionRequestParserService = useMemo(() => new OptionRequestParserService(), []);
    const rfqService = useRef(ServiceRegistry.getRfqService()).current;
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const bookService = useRef(new BookService()).current;
    const exchangeRateService = useRef(ServiceRegistry.getExchangeRateService()).current;

    const [savedRfq, setSavedRfq] = useState(initialRfq);
    const [rfq, setRfq] = useState(initialRfq);
    const [draftEpoch, setDraftEpoch] = useState(0);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [ownerId, setOwnerId] = useState(null);
    const [clients, setClients] = useState([]);
    const [books, setBooks] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const hasSummaryTab = rfq.legs.length > 1;
    const { legResults, summary, initialLoading, pricedRfq } = useRfqAllLegCalculations(
        rfq, optionPricingService, loggerService, config, optionRequestParserService);

    const dirtyChanges = useMemo(() => buildRfqDetailsDirtyChanges(rfq, savedRfq), [rfq, savedRfq]);
    const dirtyKeys = useMemo(() => dirtyChanges.map(change => change.fieldName), [dirtyChanges]);
    const isDirty = dirtyChanges.length > 0;

    const displayRfq = useMemo(() =>
    {
        if (!pricedRfq)
            return rfq;

        const next = { ...rfq, daysToExpiry: pricedRfq.daysToExpiry };
        if (!dirtyKeys.includes('underlyingPrice'))
            next.underlyingPrice = pricedRfq.underlyingPrice;
        return next;
    }, [rfq, pricedRfq, dirtyKeys]);

    useEffect(() =>
    {
        const loadOwner = async () =>
        {
            if (window.configurations?.getLoggedInUserId)
                setOwnerId(await window.configurations.getLoggedInUserId());
        };
        loadOwner();
    }, []);

    useEffect(() =>
    {
        if (!editable)
            return;

        const loadLookups = async () =>
        {
            await Promise.all([
                clientService.loadClients(),
                bookService.loadBooks(),
                exchangeRateService.loadExchangeRates()
            ]);
            setClients(clientService.getClients());
            setBooks(bookService.getBooks());
            setCurrencies(exchangeRateService.getCurrencyCodes());
        };

        loadLookups().catch(error => loggerService.logError(`Failed to load RFQ details lookup data: ${error.message}`));
    }, [editable, clientService, bookService, exchangeRateService, loggerService]);

    const fieldOptions = useMemo(() =>
    ({
        client: clients.map(client => client.clientName).sort(),
        bookCode: books.map(book => book.bookCode).sort(),
        premiumSettlementCurrency: currencies,
        dayCountConvention: DAY_COUNT_CONVENTIONS
    }), [clients, books, currencies]);

    const handleFieldChange = useCallback((field, rawValue) =>
    {
        setRfq(prev => ({ ...prev, [field.key]: rawValue }));
    }, []);

    const handleCancel = useCallback(() =>
    {
        setRfq({ ...savedRfq });
        setDraftEpoch(epoch => epoch + 1);
    }, [savedRfq]);

    const handleApply = useCallback(async () =>
    {
        const changes = buildRfqDetailsDirtyChanges(rfq, savedRfq);
        if (!changes.length)
            return;

        setSaving(true);
        try
        {
            const payload = Object.fromEntries(changes.map(change => [change.fieldName, change.newValue]));
            await rfqService.updateRfq(rfq.rfqId, payload);
            await rfqService.addWorkflowEvent({
                rfqId: rfq.rfqId,
                eventType: "FIELD_CHANGE",
                userId: ownerId,
                timestamp: new Date().toISOString(),
                fieldChanges: changes
            });
            const applied = { ...rfq, ...payload };
            setRfq(applied);
            setSavedRfq(applied);
            setDraftEpoch(epoch => epoch + 1);
            loggerService.logInfo(`Successfully applied ${changes.length} field change(s) for RFQ: ${rfq.rfqId}`);
        }
        catch (error)
        {
            loggerService.logError(`Failed to apply RFQ details changes for ${rfq.rfqId}: ${error.message}`);
        }
        finally
        {
            setSaving(false);
        }
    }, [rfq, savedRfq, rfqService, ownerId, loggerService]);

    const getLegTabIndex = (legIndex) => hasSummaryTab ? legIndex + 1 : legIndex;
    const actionsDisabled = !isDirty || saving;

    return (
        <>
            <TitleBarComponent
                title={`Request For Quote Details (${rfq.request})`}
                titleIcon={editable ? <EditIcon /> : <VisibilityIcon />}
                windowId={windowId}
                addButtonProps={undefined}
                showChannel={false}
                showTools={false}/>

            <div className={`rfq-details-app${editable ? ' rfq-details-app--editable' : ''}`} style={{
                width: '100%',
                height: 'calc(100vh - 65px)',
                float: 'left',
                padding: '0px',
                margin: '45px 0px 0px 0px'
            }}>
                <div className="rfq-details-tab-container">
                    <div className="rfq-details-tab-list">
                        {hasSummaryTab && (
                            <button
                                onClick={() => setActiveTab(0)}
                                className={`rfq-details-leg-tab ${activeTab === 0 ? 'selected' : ''}`}
                                title="Summary across all legs">
                                <div className="leg-content">
                                    <div className="leg-badges">
                                        <span className="summary-tab-badge">SUMMARY</span>
                                    </div>
                                </div>
                            </button>
                        )}
                        {rfq.legs.map((leg, legIndex) => (
                            <button
                                key={legIndex}
                                onClick={() => setActiveTab(getLegTabIndex(legIndex))}
                                className={`rfq-details-leg-tab ${activeTab === getLegTabIndex(legIndex) ? 'selected' : ''}`}
                                title={`${leg.optionType} ${leg.side} ${leg.underlying} @ $${leg.strike}`}>
                                <div className="leg-content">
                                    <span className="leg-id">{leg.legId}</span>
                                    <div className="leg-badges">
                                        <span className={`option-type-badge ${leg.optionType.toLowerCase()}`}>
                                            {leg.optionType}
                                        </span>
                                        <span className={`side-badge ${leg.side.toLowerCase()}`}>
                                            {leg.side}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="rfq-details-content">
                    {hasSummaryTab && (
                        <div style={{ display: activeTab === 0 ? 'block' : 'none', height: '100%' }}>
                            <RfqDetailsComponent
                                rfq={displayRfq}
                                editable={false}
                                mode="summary"
                                legResults={legResults}
                                summary={summary}
                                initialLoading={initialLoading}
                                config={config}
                                fieldOptions={fieldOptions}
                                dirtyKeys={dirtyKeys}
                                draftEpoch={draftEpoch}/>
                        </div>
                    )}
                    {rfq.legs.map((leg, legIndex) => (
                        <div key={legIndex} style={{ display: activeTab === getLegTabIndex(legIndex) ? 'block' : 'none', height: '100%' }}>
                            <RfqDetailsComponent
                                rfq={displayRfq}
                                editable={editable}
                                mode="leg"
                                legResult={legResults?.[legIndex]}
                                initialLoading={initialLoading}
                                config={config}
                                fieldOptions={fieldOptions}
                                dirtyKeys={dirtyKeys}
                                draftEpoch={draftEpoch}
                                onFieldChange={handleFieldChange}/>
                        </div>
                    ))}
                </div>
                {editable && (
                    <div className="rfq-details-actions">
                        <Tooltip title={<Typography fontSize={12}>Revert all unsaved booking and pricing edits.</Typography>}>
                            <span>
                                <Button className="dialog-action-button" color="primary" variant="contained" disabled={actionsDisabled} onClick={handleCancel}>Cancel</Button>
                            </span>
                        </Tooltip>
                        <Tooltip title={<Typography fontSize={12}>Save all edited booking and pricing fields.</Typography>}>
                            <span>
                                <Button className="dialog-action-button submit" color="primary" variant="contained" disabled={actionsDisabled} onClick={handleApply}>Apply</Button>
                            </span>
                        </Tooltip>
                    </div>
                )}
            </div>
        </>
    );
};

const RfqDetailsApp = () =>
{
    const windowId = window.command.getWindowId("rfq-details");
    const loggerService = useRef(new LoggerService(RfqDetailsApp.name)).current;
    const urlParams = new URLSearchParams(window.location.search);
    const rfqDataParam = urlParams.get('rfqData');
    const editable = urlParams.get('editable') === 'true';
    const configParam = urlParams.get('config');

    const initialConfig = useMemo(() => parseRfqConfigParam(configParam), [configParam]);
    const config = useRfqAppConfig(initialConfig);

    if (rfqDataParam)
    {
        try
        {
            const parsedRfq = JSON.parse(decodeURIComponent(rfqDataParam));
            return (
                <RfqDetailsContent initialRfq={parsedRfq} config={config} editable={editable} windowId={windowId}/>
            );
        }
        catch (error)
        {
            loggerService.logError("Valid RFQ data not passed into Rfq Details app.");
            return (<>Error displaying RFQ data</>);
        }
    }
};
export default RfqDetailsApp;
