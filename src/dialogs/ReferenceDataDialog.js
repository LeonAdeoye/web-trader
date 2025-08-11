import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid} from '@mui/material';
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {LoggerService} from "../services/LoggerService";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";
import ClientDialogComponent from "./ClientDialogComponent";
import ExchangeDialogComponent from "./ExchangeDialogComponent";
import BrokerDialogComponent from "./BrokerDialogComponent";
import AccountDialogComponent from "./AccountDialogComponent";
import DeskDialogComponent from "./DeskDialogComponent";
import InstrumentDialogComponent from "./InstrumentDialogComponent";
import TraderDialogComponent from "./TraderDialogComponent";

const ReferenceDataDialog = ({dataName, selectedTab, desks = []}) =>
{
    const [referenceDataDialogDisplay, setReferenceDataDialogDisplay] = useRecoilState(referenceDataDialogDisplayState);
    const loggerService = useRef(new LoggerService(ReferenceDataDialog.name)).current;
    const [formData, setFormData] = useState({});

    const handleInputChange = useCallback((data) => {
        setFormData(data);
        loggerService.logInfo(`Reference Data Dialog - Form data updated: ${JSON.stringify(data)}`);
    }, [loggerService]);

    const renderComponent = useCallback(() => {
        switch (selectedTab) {
            case "1": // Clients
                return <ClientDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "2": // Exchanges
                return <ExchangeDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "3": // Brokers
                return <BrokerDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "4": // Accounts
                return <AccountDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "5": // Desks
                return <DeskDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "6": // Instruments
                return <InstrumentDialogComponent data={formData} onDataChange={handleInputChange} />;
            case "7": // Traders
                return <TraderDialogComponent data={formData} onDataChange={handleInputChange} desks={desks} />;
            default:
                return <div>Please select a tab</div>;
        }
    }, [selectedTab, formData, desks, handleInputChange]);

    const handleAdd = useCallback(() =>
    {
        loggerService.logInfo(`Adding new reference data: ${JSON.stringify(formData)}`);
        // TODO: Implement actual add functionality based on selectedTab
        // This would call the appropriate service method
        setReferenceDataDialogDisplay(false);
    }, [formData, setReferenceDataDialogDisplay, loggerService]);

    useEffect(() =>
    {
        if (referenceDataDialogDisplay) {
            setFormData({});
            loggerService.logInfo("Reference Data Dialog opened - form data cleared");
        }
    }, [referenceDataDialogDisplay, loggerService]);

    const handleCancel = useCallback(() =>
    {
        // TODO
        setReferenceDataDialogDisplay(false);
    }, []);

    const handleClear = useCallback(() =>
    {
        setFormData({});
        loggerService.logInfo("Reference Data Dialog - Form cleared");
    }, [loggerService]);

    const canDisable = useCallback(() =>
    {
        // Check if required fields are filled based on selected tab
        if (!selectedTab) return true;
        
        switch (selectedTab) {
            case "1": // Clients
                return !formData.clientName || !formData.clientCode;
            case "2": // Exchanges
                return !formData.exchangeName || !formData.exchangeAcronym;
            case "3": // Brokers
                return !formData.brokerAcronym || !formData.brokerDescription;
            case "4": // Accounts
                return !formData.accountName || !formData.accountMnemonic;
            case "5": // Desks
                return !formData.deskCode || !formData.deskName;
            case "6": // Instruments
                return !formData.instrumentCode || !formData.instrumentDescription;
            case "7": // Traders
                return !formData.firstName || !formData.lastName || !formData.userId;
            default:
                return true;
        }
    }, [selectedTab, formData]);

    const getDialogWidth = useCallback(() => {
        switch (selectedTab) {
            case "1": // Clients - 2 fields, single column
                return "300px";
            case "2": // Exchanges - 2 fields, single column
                return "300px";
            case "3": // Brokers - 2 fields, single column
                return "300px";
            case "4": // Accounts - 8 fields, 2 columns
                return "500px";
            case "5": // Desks - 2 fields, single column
                return "300px";
            case "6": // Instruments - 9 fields, 2 columns
                return "600px";
            case "7": // Traders - 4 fields, 2 columns
                return "450px";
            default:
                return "450px";
        }
    }, [selectedTab]);

    return (
        <Dialog aria-labelledby='dialog-title' open={referenceDataDialogDisplay}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{`${dataName} Reference Data Maintenance`}</DialogTitle>
            <DialogContent style={{width: getDialogWidth(), padding: '20px'}}>
                {renderComponent()}
            </DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '0px', fontSize: '0.75rem'}} variant='contained' disabled={false} onClick={handleCancel}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleAdd}>Add</Button>
            </DialogActions>
        </Dialog>);
};

export default ReferenceDataDialog;

