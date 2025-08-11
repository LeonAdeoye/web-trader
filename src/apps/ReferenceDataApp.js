import TitleBarComponent from "../components/TitleBarComponent";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useMemo, useRef, useState, useEffect} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Tab} from "@mui/material";
import {LoggerService} from "../services/LoggerService";
import {useRecoilState} from "recoil";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";
import ReferenceDataDialog from "../dialogs/ReferenceDataDialog";
import {BrokerService} from "../services/BrokerService";
import {AccountService} from "../services/AccountService";
import {ReferenceDataService} from "../services/ReferenceDataService";
import {TraderService} from "../services/TraderService";
import {ClientService} from "../services/ClientService";
import {DeskService} from "../services/DeskService";
import ActionIconsRenderer from "../components/ActionIconsRenderer";

export const ReferenceDataApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Reference Data"), []);
    const loggerService = useRef(new LoggerService(ReferenceDataApp.name)).current;
    const [selectedTab, setSelectedTab] = useState("1");
    const [clients, setClients] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [desks, setDesks] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [traders, setTraders] = useState([]);
    const [, setReferenceDataDialogOpenFlag] = useRecoilState(referenceDataDialogDisplayState);

    const brokerService = useRef(new BrokerService()).current;
    const accountService = useRef(new AccountService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const traderService = useRef(new TraderService()).current;
    const clientService = useRef(new ClientService()).current;
    const deskService = useRef(new DeskService()).current;

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

    // Handle CRUD operations for all reference data types
    const handleAction = async (action, data) => {
        try {
            switch (action) {
                case "update":
                    // TODO: Implement update functionality for each data type
                    loggerService.logInfo(`Update action for ${data ? 'selected row' : 'new item'}`);
                    break;
                case "delete":
                    // TODO: Implement delete functionality for each data type
                    loggerService.logInfo(`Delete action for ${data ? 'selected row' : 'new item'}`);
                    break;
                case "clone":
                    // TODO: Implement clone functionality for each data type
                    loggerService.logInfo(`Clone action for ${data ? 'selected row' : 'new item'}`);
                    break;
                case "add":
                    // Open the reference data dialog for adding new items
                    setReferenceDataDialogOpenFlag(true);
                    loggerService.logInfo(`Add action for ${data ? 'selected row' : 'new item'}`);
                    break;
                default:
                    loggerService.logError(`Unknown action: ${action}`);
            }
        } catch (error) {
            loggerService.logError(`Failed to handle action ${action}: ${error}`);
        }
    };

    useEffect(() => 
    {
        const loadData = async () =>
        {
            try
            {
                await clientService.loadClients();
                await brokerService.loadBrokers();
                await accountService.loadAccounts();
                await referenceDataService.loadInstruments();
                await referenceDataService.loadExchanges();
                await traderService.loadTraders();
                await deskService.loadDesks();

                setClients(clientService.getClients());
                setBrokers(brokerService.getBrokers());
                setAccounts(accountService.getAccounts());
                setInstruments(referenceDataService.getInstruments());
                setExchanges(referenceDataService.getExchanges());
                setTraders(traderService.getTraders());
                setDesks(deskService.getDesks());

            }
            catch (error)
            {
                loggerService.logError(`Failed to load reference data: ${error}`);
            }
        };

        loadData();
    }, [clientService, brokerService, accountService, referenceDataService, traderService, deskService, loggerService]);

    return (<>
        <TitleBarComponent title="Reference Data" windowId={windowId} addButtonProps={{ handler: () => setReferenceDataDialogOpenFlag(true), tooltipText: "Add Reference Data..." }} showChannel={false} showTools={false}/>
        <div className="reference-app" style={{width: '100%', height: 'calc(100vh - 131px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <TabContext value={selectedTab}>
                <TabList className="reference-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
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
        <ReferenceDataDialog 
            dataName={selectedTab === "1" ? "Clients" : 
                     selectedTab === "2" ? "Exchanges" : 
                     selectedTab === "3" ? "Brokers" : 
                     selectedTab === "4" ? "Accounts" : 
                     selectedTab === "5" ? "Desks" : 
                     selectedTab === "6" ? "Instruments" : 
                     selectedTab === "7" ? "Traders" : "Reference Data"}
            selectedTab={selectedTab}
            desks={desks}
        />
    </>)
}
