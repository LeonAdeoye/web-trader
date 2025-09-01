import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { selectedContextShareState } from '../atoms/component-state';
import { LoggerService } from '../services/LoggerService';
import { useRef } from 'react';
import TitleBarComponent from "../components/TitleBarComponent";

const RfqDetailsApp = () =>
{
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const windowId = window.command.getWindowId("rfq-Details");
    const loggerService = useRef(new LoggerService(RfqDetailsApp.name)).current;

    const [optionLegs] = useState([
        { legId: 'Leg 1', optionType: 'CALL', side: 'BUY' },
        { legId: 'Leg 2', optionType: 'PUT', side: 'SELL' },
        { legId: 'Leg 3', optionType: 'CALL', side: 'BUY' }
    ]);

    const [activeTab, setActiveTab] = useState(0);

    useEffect(() =>
    {
        loggerService.logInfo("RFQ Details App loaded");
    }, [loggerService]);

    const handleTabChange = (event, newValue) =>
    {
        setActiveTab(newValue);
        loggerService.logInfo(`Switched to tab: ${newValue}`);
    };

    // Sample RFQ snippet text - in a real app, this would come from the RFQ data
    // The snippet could be constructed from: rfqData.optionType + rfqData.quantity + rfqData.maturityDate + rfqData.underlying
    const rfqSnippetText = "+c 100 25Oct25 0001.HK";

    return (
        <>
            <TitleBarComponent 
                title={`Request For Quote Details (${rfqSnippetText})`}
                windowId={windowId} 
                addButtonProps={undefined} 
                showChannel={false} 
                showTools={false}
            />
            
            <div style={{ 
                width: '100%', 
                height: 'calc(100vh - 65px)', 
                float: 'left', 
                padding: '0px', 
                margin: '45px 0px 0px 0px'
            }}>
                {/* Tab Navigation */}
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
                        {optionLegs.map((leg, index) => (
                            <button
                                key={leg.legId}
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
                                title={`${leg.optionType} ${leg.side} ${leg.underlying} @ $${leg.strike}`}
                            >
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

                {/* Tab Content - Empty Panels */}
                <div style={{
                    padding: '20px',
                    height: 'calc(100% - 80px)',
                    overflow: 'auto'
                }}>
                    {optionLegs.map((leg, index) => (
                        <div
                            key={leg.legId}
                            style={{
                                display: activeTab === index ? 'block' : 'none',
                                height: '100%'
                            }}
                        >
                            {/* Empty tab panel - add your components here later */}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default RfqDetailsApp;
