import React, { useState } from 'react';
import { LoggerService } from '../services/LoggerService';
import { useRef } from 'react';
import TitleBarComponent from "../components/TitleBarComponent";
import {RfqDetailsComponent} from "../components/RfqDetailsComponent";

const RfqDetailsApp = () =>
{
    const windowId = window.command.getWindowId("rfq-details");
    const loggerService = useRef(new LoggerService(RfqDetailsApp.name)).current;
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const urlParams = new URLSearchParams(window.location.search);
    const rfqDataParam = urlParams.get('rfqData');
    const editable = urlParams.get('editable');
    const configParam = urlParams.get('config');

    if (rfqDataParam)
    {
        try {
            const rfq = JSON.parse(decodeURIComponent(rfqDataParam));
            const config = JSON.parse(decodeURIComponent(configParam));
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
                                {rfq.legs.map((leg, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleTabChange(null, index)}
                                        className={`rfq-details-leg-tab ${activeTab === index ? 'selected' : ''}`}
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
                            {rfq.legs.map((leg, index) =>
                            (
                                <div key={index} style={{ display: activeTab === index ? 'block' : 'none', height: '100%' }}>
                                    <RfqDetailsComponent rfq={rfq} editable={editable} index={index} config={config}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
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
