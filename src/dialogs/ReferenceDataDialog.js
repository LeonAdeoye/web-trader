import React, {useState, useCallback, useEffect} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";
import ClientDialogComponent from "./ClientDialogComponent";
import ExchangeDialogComponent from "./ExchangeDialogComponent";
import BrokerDialogComponent from "./BrokerDialogComponent";
import AccountDialogComponent from "./AccountDialogComponent";
import DeskDialogComponent from "./DeskDialogComponent";
import InstrumentDialogComponent from "./InstrumentDialogComponent";
import TraderDialogComponent from "./TraderDialogComponent";
import BankHolidayDialogComponent from "./BankHolidayDialogComponent";

const ReferenceDataDialog = ({dataName, selectedTab, desks = [], mode = 'add', editingData = null, onSave, onClose}) =>
{
    const [referenceDataDialogDisplay, setReferenceDataDialogDisplay] = useRecoilState(referenceDataDialogDisplayState);
    const [formData, setFormData] = useState({});

    const handleInputChange = useCallback((data) =>
    {
        setFormData(data);
    }, []);

    const renderComponent = useCallback(() =>
    {
        switch (selectedTab)
        {
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
            case "8": // Bank Holidays
                return <BankHolidayDialogComponent data={formData} onDataChange={handleInputChange} />;
            default:
                return <div>Please select a tab</div>;
        }
    }, [selectedTab, formData, desks, handleInputChange]);

    const handleAdd = useCallback(() =>
    {
        if (onSave)
        {
            if (mode === 'update' && editingData)
            {
                // For updates, merge the form data with the original data to preserve any missing fields
                const updatedData = { ...editingData, ...formData };
                onSave(updatedData);
            }
            else
                onSave(formData);
        }

        setReferenceDataDialogDisplay(false);
        if (onClose)
            onClose();

    }, [formData, setReferenceDataDialogDisplay, mode, editingData, onSave, onClose]);

    useEffect(() =>
    {
        if (referenceDataDialogDisplay)
        {
            if (mode === 'add')
                setFormData({});
            else if (mode === 'update' && editingData)
                setFormData(editingData);
            else if (mode === 'clone' && editingData)
            {
                const clonedData = { ...editingData };
                delete clonedData.clientId;
                delete clonedData.exchangeId;
                delete clonedData.brokerId;
                delete clonedData.accountId;
                delete clonedData.deskId;
                delete clonedData.instrumentId;
                delete clonedData.traderId;
                delete clonedData.id;
                setFormData(clonedData);
            }
        }
        else
        {
            setFormData({});
            if (onClose)
                onClose();
        }
    }, [referenceDataDialogDisplay, mode, editingData, onClose, setReferenceDataDialogDisplay]);

    const handleCancel = useCallback(() =>
    {
        setReferenceDataDialogDisplay(false);
        setFormData({});
        if (onClose)
            onClose();

    }, [setReferenceDataDialogDisplay, onClose]);

    const handleClear = useCallback(() =>
    {
        if (mode === 'add')
            setFormData({});
        else if (mode === 'update' && editingData)
            setFormData(editingData);
        else if (mode === 'clone' && editingData)
        {
            const clonedData = { ...editingData };
            delete clonedData.clientId;
            delete clonedData.exchangeId;
            delete clonedData.brokerId;
            delete clonedData.accountId;
            delete clonedData.deskId;
            delete clonedData.instrumentId;
            delete clonedData.traderId;
            setFormData(clonedData);
        }
    }, [mode, editingData]);

    const canDisable = useCallback(() =>
    {
        if (!selectedTab) return true;
        if (mode === 'update' && editingData) return false;
        
        switch (selectedTab)
        {
            case "1": // Clients
                return !formData.clientName;
            case "2": // Exchanges
                return !formData.exchangeName || !formData.exchangeAcronym;
            case "3": // Brokers
                return !formData.brokerAcronym || !formData.brokerDescription;
            case "4": // Accounts
                return !formData.accountName || !formData.accountMnemonic;
            case "5": // Desks
                return !formData.deskName;
            case "6": // Instruments
                return !formData.instrumentCode || !formData.instrumentDescription;
            case "7": // Traders
                return !formData.firstName || !formData.lastName || !formData.userId;
            case "8": // Bank Holidays
                return !formData.countryCode || !formData.holidayName;
            default:
                return true;
        }
    }, [selectedTab, formData, mode, editingData]);

    const getDialogWidth = useCallback(() =>
    {
        switch (selectedTab)
        {
            case "1": // Clients
                return "300px";
            case "2": // Exchanges
                return "300px";
            case "3": // Brokers
                return "300px";
            case "4": // Accounts
                return "500px";
            case "5": // Desks
                return "300px";
            case "6": // Instruments
                return "550px";
            case "7": // Traders
                return "450px";
            case "8": // Bank Holidays
                return "400px";
            default:
                return "450px";
        }
    }, [selectedTab]);

    return (
        <Dialog aria-labelledby='dialog-title' open={referenceDataDialogDisplay}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{`${dataName} Reference Data ${mode === 'add' ? 'Add' : mode === 'update' ? 'Update' : 'Clone'}`}</DialogTitle>
            <DialogContent style={{width: getDialogWidth(), padding: '20px'}}>{renderComponent()}</DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '0px', fontSize: '0.75rem'}} variant='contained' disabled={false} onClick={handleCancel}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleAdd}>
                    {mode === 'add' ? 'Add' : mode === 'update' ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>);
};

export default ReferenceDataDialog;

