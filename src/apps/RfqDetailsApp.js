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

    if (rfqDataParam)
    {
        try {
            const rfq = JSON.parse(decodeURIComponent(rfqDataParam));
            return (
                <>
                    <TitleBarComponent
                        title={`Request For Quote Details (${rfq.request})`}
                        windowId={windowId}
                        addButtonProps={undefined}
                        showChannel={false}
                        showTools={false}/>

                    <div style={{
                        width: '100%',
                        height: 'calc(100vh - 65px)',
                        float: 'left',
                        padding: '0px',
                        margin: '45px 0px 0px 0px'
                    }}>
                        <div style={{
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5',
                            padding: '0 20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '0',
                                overflowX: 'auto'
                            }}>
                                {rfq.legs.map((leg, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleTabChange(null, index)}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            backgroundColor: activeTab === index ? '#656161' : 'transparent',
                                            color: activeTab === index ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: activeTab === index ? '600' : '400',
                                            borderBottom: activeTab === index ? '3px solid #1976d2' : '3px solid transparent',
                                            transition: 'all 0.2s ease',
                                            minWidth: '120px',
                                            textAlign: 'center'
                                        }}
                                        title={`${leg.optionType} ${leg.side} ${leg.underlying} @ $${leg.strike}`}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '11px', opacity: 0.8 }}>{leg.legId}</span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '2px 4px',
                                            borderRadius: '3px',
                                            backgroundColor: leg.optionType === 'CALL' ? '#4caf50' : '#ff9800',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {leg.optionType}
                                        </span>
                                                <span style={{
                                                    padding: '2px 4px',
                                                    borderRadius: '3px',
                                                    backgroundColor: leg.side === 'BUY' ? '#2196f3' : '#f44336',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                            {leg.side}
                                        </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '20px', height: 'calc(100% - 80px)', overflow: 'auto' }}>
                            {rfq.legs.map((leg, index) =>
                            (
                                <div key={index} style={{ display: activeTab === index ? 'block' : 'none', height: '100%' }}>
                                    <RfqDetailsComponent rfq={rfq} editable={editable} index={index}/>
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
