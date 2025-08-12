import TitleBarComponent from "../components/TitleBarComponent";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useMemo, useRef, useState, useEffect, useCallback} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Tab} from "@mui/material";
import {LoggerService} from "../services/LoggerService";
import {useRecoilState} from "recoil";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";
import ReferenceDataDialog from "../dialogs/ReferenceDataDialog";
import DeleteConfirmationDialog from "../dialogs/DeleteConfirmationDialog";
import {BrokerService} from "../services/BrokerService";
import {AccountService} from "../services/AccountService";
import {TraderService} from "../services/TraderService";
import {ClientService} from "../services/ClientService";
import {DeskService} from "../services/DeskService";
import {InstrumentService} from "../services/InstrumentService";
import {ExchangeService} from "../services/ExchangeService";
import ActionIconsRenderer from "../components/ActionIconsRenderer";

export const ReferenceDataApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Reference Data"), []);
    const loggerService = useRef(new LoggerService(ReferenceDataApp.name)).current;
    const [selectedTab, setSelectedTab] = useState("1");
    const selectedTabRef = useRef("1");
    const [clients, setClients] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [desks, setDesks] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [traders, setTraders] = useState([]);
    const [, setReferenceDataDialogOpenFlag] = useRecoilState(referenceDataDialogDisplayState);
    const [dialogMode, setDialogMode] = useState('add'); // 'add', 'update', 'clone'
    const [editingData, setEditingData] = useState(null);
    const [deleteConfirmationDialog, setDeleteConfirmationDialog] = useState(false);
    const [dataToDelete, setDataToDelete] = useState(null);
    const brokerService = useRef(new BrokerService()).current;
    const accountService = useRef(new AccountService()).current;
    const traderService = useRef(new TraderService()).current;
    const clientService = useRef(new ClientService()).current;
    const deskService = useRef(new DeskService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const exchangeService = useRef(new ExchangeService()).current;

    const clientColumnDefs = useMemo(() => 
    ([
        {
            headerName: 'Client ID',
            field: 'clientId',
            width: 230,
            hide: true,
            headerTooltip: 'Client ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client Name',
            field: 'clientName',
            width: 250,
            headerTooltip: 'Client Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Client Code',
            field: 'clientCode',
            width: 150,
            headerTooltip: 'Client Code',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const exchangeColumnDefs = useMemo(() => 
    ([
        {
            headerName: 'Exchange ID',
            field: 'exchangeId',
            width: 230,
            hide: true,
            headerTooltip: 'Exchange ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Exchange Name',
            field: 'exchangeName',
            width: 250,
            headerTooltip: 'Exchange Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Exchange Acronym',
            field: 'exchangeAcronym',
            width: 150,
            headerTooltip: 'Exchange Acronym',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const brokerColumnDefs = useMemo(() => 
    ([
        {
            headerName: 'Broker ID',
            field: 'brokerId',
            width: 230,
            hide: true,
            headerTooltip: 'Broker ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Broker Acronym',
            field: 'brokerAcronym',
            width: 150,
            headerTooltip: 'Broker Acronym',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Broker Description',
            field: 'brokerDescription',
            width: 300,
            headerTooltip: 'Broker Description',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const accountColumnDefs = useMemo(() => 
    ([
        {
            headerName: 'Account ID',
            field: 'accountId',
            width: 230,
            hide: true,
            headerTooltip: 'Account ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Account Name',
            field: 'accountName',
            width: 250,
            headerTooltip: 'Account Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Account Mnemonic',
            field: 'accountMnemonic',
            width: 150,
            headerTooltip: 'Account Mnemonic',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Legal Entity',
            field: 'legalEntity',
            width: 200,
            headerTooltip: 'Legal Entity',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Firm Account',
            field: 'isFirmAccount',
            width: 120,
            headerTooltip: 'Firm Account',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Risk Account',
            field: 'isRiskAccount',
            width: 120,
            headerTooltip: 'Risk Account',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Active',
            field: 'isActive',
            width: 100,
            headerTooltip: 'Active Status',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Custom Flags',
            field: 'customFlags',
            width: 150,
            headerTooltip: 'Custom Flags',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const deskColumnDefs = useMemo(() =>
    ([
        {
            headerName: 'Desk Id',
            field: 'deskId',
            width: 230,
            hide: true,
            headerTooltip: 'Desk Id',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Desk Name',
            field: 'deskName',
            width: 250,
            headerTooltip: 'Desk Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const instrumentColumnDefs = useMemo(() =>
    ([
        {
            headerName: 'Instrument Id',
            field: 'instrumentId',
            width: 230,
            hide:true,
            headerTooltip: 'Instrument ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Instrument Code',
            field: 'instrumentCode',
            width: 130,
            headerTooltip: 'Instrument Code',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Instrument Description',
            field: 'instrumentDescription',
            width: 260,
            headerTooltip: 'Instrument Description',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Asset Type',
            field: 'assetType',
            width: 100,
            headerTooltip: 'Asset Type',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Bloomberg Code',
            field: 'blgCode',
            width: 140,
            headerTooltip: 'Bloomberg Code',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'RIC',
            field: 'ric',
            width: 100,
            headerTooltip: 'RIC Code',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Settlement Currency',
            field: 'settlementCurrency',
            width: 140,
            headerTooltip: 'Settlement Currency',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Settlement Type',
            field: 'settlementType',
            width: 125,
            headerTooltip: 'Settlement Type',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Exchange Acronym',
            field: 'exchangeAcronym',
            width: 140,
            headerTooltip: 'Exchange Acronym',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Lot Size',
            field: 'lotSize',
            width: 90,
            headerTooltip: 'Lot Size',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const traderColumnDefs = useMemo(() => 
    ([
        {
            headerName: 'Trader ID',
            field: 'traderId',
            width: 230,
            hide: true,
            headerTooltip: 'Trader ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'First Name',
            field: 'firstName',
            width: 150,
            headerTooltip: 'First Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Last Name',
            field: 'lastName',
            width: 150,
            headerTooltip: 'Last Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'User ID',
            field: 'userId',
            width: 150,
            headerTooltip: 'User ID',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Desk',
            field: 'deskName',
            width: 200,
            headerTooltip: 'Desk Name',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            cellRenderer: ActionIconsRenderer
        },
    ]), []);

    const handleAction = useCallback(async (action, data) =>
    {
        switch (action)
        {
            case "update":
                setDialogMode('update');
                setEditingData(data);
                setReferenceDataDialogOpenFlag(true);
                break;
            case "delete":
                setDataToDelete(data);
                setDeleteConfirmationDialog(true);
                break;
            case "clone":
                setDialogMode('clone');
                setEditingData(data);
                setReferenceDataDialogOpenFlag(true);
                break;
            case "add":
                setDialogMode('add');
                setEditingData(null);
                setReferenceDataDialogOpenFlag(true);
                break;
            default:
                loggerService.logError(`Unknown action: ${action}`);
        }
    }, [loggerService]);

    useEffect(() => 
    {
        const loadData = async () =>
        {
            try
            {
                await clientService.loadClients();
                await brokerService.loadBrokers();
                await accountService.loadAccounts();
                await instrumentService.loadInstruments();
                await exchangeService.loadExchanges();
                await traderService.loadTraders();
                await deskService.loadDesks();

                setClients(clientService.getClients());
                setBrokers(brokerService.getBrokers());
                setAccounts(accountService.getAccounts());
                setInstruments(instrumentService.getInstruments());
                setExchanges(exchangeService.getExchanges());
                setTraders(traderService.getTraders());
                setDesks(deskService.getDesks());
            }
            catch (error)
            {
                loggerService.logError(`Failed to load reference data: ${error}`);
            }
        };

        loadData().then(() => loggerService.logInfo("All reference data loaded successfully."));

    }, [clientService, brokerService, accountService, instrumentService, exchangeService, traderService, deskService, loggerService]);

    const handleSave = useCallback(async (formData) =>
    {
        switch (dialogMode)
        {
            case 'add':
                await handleAdd(formData);
                break;
            case 'update':
                await handleUpdate(formData);
                break;
            case 'clone':
                await handleClone(formData);
                break;
            default:
                loggerService.logError(`Unknown dialog mode: ${dialogMode}`);
        }
        setDialogMode('add');
        setEditingData(null);
    }, [dialogMode, loggerService]);

    const handleAdd = useCallback(async (formData) =>
    {
        const tab = selectedTabRef.current;
        switch (tab)
        {
            case "1": // Clients
                await clientService.addNewClient(formData);
                await clientService.loadClients();
                setClients(clientService.getClients());
                break;
            case "2": // Exchanges
                await exchangeService.addNewExchange(formData);
                await exchangeService.loadExchanges();
                setExchanges(exchangeService.getExchanges());
                break;
            case "3": // Brokers
                await brokerService.addNewBroker(formData);
                await brokerService.loadBrokers();
                setBrokers(brokerService.getBrokers());
                break;
            case "4": // Accounts
                await accountService.addNewAccount(formData);
                await accountService.loadAccounts();
                setAccounts(accountService.getAccounts());
                break;
            case "5": // Desks
                await deskService.addNewDesk(formData);
                await deskService.loadDesks();
                setDesks(deskService.getDesks());
                break;
            case "6": // Instruments
                await instrumentService.addNewInstrument(formData);
                await instrumentService.loadInstruments();
                setInstruments(instrumentService.getInstruments());
                break;
            case "7": // Traders
                await traderService.addNewTrader(formData);
                await traderService.loadTraders();
                setTraders(traderService.getTraders());
                break;
            default:
                loggerService.logError(`Unknown tab for add: ${tab}`);
        }
    }, [clientService, brokerService, accountService, exchangeService, traderService, deskService, instrumentService, selectedTab, loggerService]);

    const handleUpdate = useCallback(async (formData) =>
    {
        const tab = selectedTabRef.current;
        switch (tab)
        {
            case "1": // Clients
                await clientService.updateClient(formData);
                await clientService.loadClients();
                setClients(clientService.getClients());
                break;
            case "2": // Exchanges
                await exchangeService.updateExchange(formData);
                await exchangeService.loadExchanges();
                setExchanges(exchangeService.getExchanges());
                break;
            case "3": // Brokers
                await brokerService.updateBroker(formData);
                await brokerService.loadBrokers();
                setBrokers(brokerService.getBrokers());
                break;
            case "4": // Accounts
                await accountService.updateAccount(formData);
                await accountService.loadAccounts();
                setAccounts(accountService.getAccounts());
                break;
            case "5": // Desks
                await deskService.updateDesk(formData);
                await deskService.loadDesks();
                setDesks(deskService.getDesks());
                break;
            case "6": // Instruments
                await instrumentService.updateInstrument(formData);
                await instrumentService.loadInstruments();
                setInstruments(instrumentService.getInstruments());
                break;
            case "7": // Traders
                await traderService.updateTrader(formData);
                await traderService.loadTraders();
                setTraders(traderService.getTraders());
                break;
            default:
                loggerService.logError(`Unknown tab for update: ${tab}`);
        }
    }, [clientService, brokerService, accountService, exchangeService, traderService, deskService, instrumentService, selectedTab, loggerService]);

    const handleClone = useCallback(async (formData) =>
    {
        const clonedData = { ...formData };
        delete clonedData.clientId;
        delete clonedData.exchangeId;
        delete clonedData.brokerId;
        delete clonedData.accountId;
        delete clonedData.deskId;
        delete clonedData.instrumentId;
        delete clonedData.traderId;
        await handleAdd(clonedData);
    }, []);

    const handleDelete = useCallback(async (data) =>
    {
        const tab = selectedTabRef.current;
        switch (tab)
        {
            case "1": // Clients
                await clientService.deleteClient(data.clientId);
                setClients(prevClients => prevClients.filter(client => client.clientId !== data.clientId));
                break;
            case "2": // Exchanges
                await exchangeService.deleteExchange(data.exchangeId);
                setExchanges(prevExchanges => prevExchanges.filter(exchange => exchange.exchangeId !== data.exchangeId));
                break;
            case "3": // Brokers
                await brokerService.deleteBroker(data.brokerId);
                setBrokers(prevBrokers => prevBrokers.filter(broker => broker.brokerId !== data.brokerId));
                break;
            case "4": // Accounts
                await accountService.deleteAccount(data.accountId);
                setAccounts(prevAccounts => prevAccounts.filter(account => account.accountId !== data.accountId));
                break;
            case "5": // Desks
                await deskService.deleteDesk(data.deskId);
                setDesks(prevDesks => prevDesks.filter(desk => desk.deskId !== data.deskId));
                break;
            case "6": // Instruments
                await instrumentService.deleteInstrument(data.instrumentId);
                setInstruments(prevInstruments => prevInstruments.filter(instrument => instrument.instrumentId !== data.instrumentId));
                break;
            case "7": // Traders
                await traderService.deleteTrader(data.traderId);
                setTraders(prevTraders => prevTraders.filter(trader => trader.traderId !== data.traderId));
                break;
            default:
                loggerService.logError(`Unknown tab for delete: ${tab}`);
        }
    }, [clientService, brokerService, accountService, exchangeService, traderService, deskService, instrumentService, selectedTab, loggerService]);

    const handleDeleteConfirm = useCallback(async () =>
    {
        try
        {
            if (dataToDelete)
                await handleDelete(dataToDelete);
        }
        catch (error)
        {
            loggerService.logError(`Failed to execute confirmed delete: ${error}`);
        }
        finally
        {
            setDeleteConfirmationDialog(false);
            setDataToDelete(null);
        }
    }, [dataToDelete]);

    const handleDeleteCancel = useCallback(() =>
    {
        setDeleteConfirmationDialog(false);
        setDataToDelete(null);
    }, []);

    const getDataName = useCallback((tab) =>
    {
        switch (tab)
        {
            case "1": return "Client";
            case "2": return "Exchange";
            case "3": return "Broker";
            case "4": return "Account";
            case "5": return "Desk";
            case "6": return "Instrument";
            case "7": return "Trader";
            default: return "Reference Data";
        }
    }, [])

    const getItemDisplayName = useCallback((data, tab) =>
    {
        if (!data) return '';
        
        switch (tab)
        {
            case "1": // Clients
                return data.clientName ? `${data.clientName} (${data.clientCode || 'No Code'})` : 'Unknown Client';
            case "2": // Exchanges
                return data.exchangeName ? `${data.exchangeName} (${data.exchangeAcronym || 'No Acronym'})` : 'Unknown Exchange';
            case "3": // Brokers
                return data.brokerAcronym ? `${data.brokerAcronym} - ${data.brokerDescription || 'No Description'}` : 'Unknown Broker';
            case "4": // Accounts
                return data.accountName ? `${data.accountName} (${data.accountMnemonic || 'No Mnemonic'})` : 'Unknown Account';
            case "5": // Desks
                return data.deskName ? data.deskName : 'Unknown Desk';
            case "6": // Instruments
                return data.instrumentCode ? `${data.instrumentCode} - ${data.instrumentDescription || 'No Description'}` : 'Unknown Instrument';
            case "7": // Traders
                return data.firstName ? `${data.firstName} ${data.lastName} (${data.userId || 'No User ID'})` : 'Unknown Trader';
            default:
                return 'Unknown Item';
        }
    }, []);

    return (<>
        <TitleBarComponent title="Reference Data" windowId={windowId} addButtonProps={{ handler: () => { setDialogMode('add'); setEditingData(null); setReferenceDataDialogOpenFlag(true); }, tooltipText: "Add Reference Data..." }} showChannel={false} showTools={false}/>
        <div className="reference-app" style={{width: '100%', height: 'calc(100vh - 131px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <TabContext value={selectedTab}>
                <TabList className="reference-tab-list" onChange={(event, newValue) =>
                {
                    selectedTabRef.current = newValue;
                    setSelectedTab(newValue);
                }}>
                    <Tab className="clients-tab" label={"Clients"} value="1"/>
                    <Tab className="exchanges-tab" label={"Exchanges"} value="2"/>
                    <Tab className="brokers-tab" label={"Brokers"} value="3"/>
                    <Tab className="accounts-tab" label={"Accounts"} value="4"/>
                    <Tab className="desks-tab" label={"Desks"} value="5"/>
                    <Tab className="instruments-tab" label={"Instruments"} value="6"/>
                    <Tab className="traders-tab" label={"Traders"} value="7"/>
                </TabList>
                
                <TabPanel value="1" className="client-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["clientId"]} columnDefs={clientColumnDefs} gridData={clients} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="2" className="exchange-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["exchangeId"]} columnDefs={exchangeColumnDefs} gridData={exchanges} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="3" className="broker-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["brokerId"]} columnDefs={brokerColumnDefs} gridData={brokers} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="4" className="account-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["accountId"]} columnDefs={accountColumnDefs} gridData={accounts} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="5" className="desk-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["deskId"]} columnDefs={deskColumnDefs} gridData={desks} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="6" className="instrument-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["instrumentId"]} columnDefs={instrumentColumnDefs} gridData={instruments} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
                
                <TabPanel value="7" className="trader-ref-data">
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["traderId"]} columnDefs={traderColumnDefs} gridData={traders} windowId={windowId} handleAction={handleAction}/>
                </TabPanel>
            </TabContext>
        </div>
        <ReferenceDataDialog selectedTab={selectedTab} desks={desks} mode={dialogMode} editingData={editingData} onSave={handleSave}
             onClose={() => { setDialogMode('add'); setEditingData(null); }} dataName={getDataName(selectedTab)}/>

        <DeleteConfirmationDialog open={deleteConfirmationDialog} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm}
            dataToDelete={dataToDelete} selectedTab={selectedTab} getDataName={getDataName} getItemDisplayName={getItemDisplayName}/>
    </>)
}
