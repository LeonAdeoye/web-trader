import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { selectedContextShareState } from '../atoms/component-state';
import { LoggerService } from '../services/LoggerService';
import { useRef } from 'react';
import TitleBarComponent from "../components/TitleBarComponent";

const RfqChartsApp = () =>
{
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const windowId = window.command.getWindowId("rfq-charts");
    const loggerService = useRef(new LoggerService(RfqChartsApp.name)).current;

    const rfqSnippetText = "+c 100 25Oct25 0001.HK";

    return (
        <>
            <TitleBarComponent 
                title={`Request For Quote Charts (${rfqSnippetText})`}
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
            </div>
        </>
    );
};

export default RfqChartsApp;
