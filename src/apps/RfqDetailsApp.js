import React, { useMemo, useRef, useState } from 'react';
import { LoggerService } from '../services/LoggerService';
import { OptionPricingService } from '../services/OptionPricingService';
import { OptionRequestParserService } from '../services/OptionRequestParserService';
import TitleBarComponent from "../components/TitleBarComponent";
import { RfqDetailsComponent } from "../components/RfqDetailsComponent";
import { useRfqAllLegCalculations } from '../hooks/useRfqAllLegCalculations';
import { useRfqAppConfig } from '../hooks/useRfqAppConfig';
import { parseRfqConfigParam } from '../config/rfqAppConfig';

const RfqDetailsContent = ({ rfq, config, editable, windowId }) =>
{
    const loggerService = useRef(new LoggerService(RfqDetailsApp.name)).current;
    const optionPricingService = useMemo(() => new OptionPricingService(), []);
    const optionRequestParserService = useMemo(() => new OptionRequestParserService(), []);
    const [activeTab, setActiveTab] = useState(0);
    const hasSummaryTab = rfq.legs.length > 1;
    const { legResults, summary, initialLoading, pricedRfq } = useRfqAllLegCalculations(
        rfq, optionPricingService, loggerService, config, optionRequestParserService);

    const displayRfq = pricedRfq ?? rfq;

    const getLegTabIndex = (legIndex) => hasSummaryTab ? legIndex + 1 : legIndex;

    return (
        <>
            <TitleBarComponent
                title={`Request For Quote Details (${rfq.request})`}
                windowId={windowId}
                addButtonProps={undefined}
                showChannel={false}
                showTools={false}/>

            <div className="rfq-details-app" style={{
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
                                editable={editable}
                                mode="summary"
                                legResults={legResults}
                                summary={summary}
                                initialLoading={initialLoading}
                                config={config}/>
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
                                config={config}/>
                        </div>
                    ))}
                </div>
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
    const editable = urlParams.get('editable');
    const configParam = urlParams.get('config');

    const initialConfig = useMemo(() => parseRfqConfigParam(configParam), [configParam]);
    const config = useRfqAppConfig(initialConfig);

    if (rfqDataParam)
    {
        try
        {
            const rfq = JSON.parse(decodeURIComponent(rfqDataParam));
            return (
                <RfqDetailsContent rfq={rfq} config={config} editable={editable} windowId={windowId}/>
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
