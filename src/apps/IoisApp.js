import * as React from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Button, Tab} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import {useRecoilState} from "recoil";
import TitleBarComponent from "../components/TitleBarComponent";
import {GenericGridComponent} from "../components/GenericGridComponent";
import IoiActionIconsRenderer from "../components/IoiActionIconsRenderer";
import IoiBlockActionIconsRenderer from "../components/IoiBlockActionIconsRenderer";
import IoiCreationDialog from "../dialogs/IoiCreationDialog";
import IoiBlockDialog from "../dialogs/IoiBlockDialog";
import DeleteConfirmationDialog from "../dialogs/DeleteConfirmationDialog";
import {ioiBlockDialogDisplayState, ioiCreationDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {IoiService} from "../services/IoiService";
import {LoggerService} from "../services/LoggerService";
import {ServiceRegistry} from "../services/ServiceRegistry";
import {ExchangeService} from "../services/ExchangeService";
import {transformLocalDataTime} from "../utilities";
import "../styles/css/main.css";

const tabSx = {minHeight: "25px", height: "25px", textTransform: "none", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", backgroundColor: "#bdbaba", color: "white", "&.Mui-selected": {backgroundColor: "#656161", color: "white"}};
const tabPanelSx = {padding: 0, margin: 0};

const IOI_CONFIG_KEYS = [
    { key: "ioi.rules.min-notional-usd", label: "Min Notional USD" },
    { key: "ioi.rules.min-adv-percentage", label: "Min ADV %" },
    { key: "ioi.rules.min-quantity", label: "Min Quantity" },
    { key: "ioi.rules.max-price-deviation-percent", label: "Max Price Deviation %" },
    { key: "ioi.default-lifetime-minutes", label: "Default Lifetime (mins)" },
    { key: "ioi.regeneration-interval-seconds", label: "Regen Interval (secs)" }
];

const emptyBulkRow = (id) => ({
    id,
    ric: "",
    trader: "",
    quantity: "",
    side: "BUY",
    price: "",
    originalMarket: "",
    originalOrderType: "LIMIT",
    lifeTimeInMinutes: 15,
    comment: "",
    BloombergQualifier: ""
});

const mergeCountMaps = (createdMap, unapprovedMap, nameField) =>
{
    const keys = new Set([...Object.keys(createdMap || {}), ...Object.keys(unapprovedMap || {})]);
    return Array.from(keys).map(name => ({
        [nameField]: name,
        created: createdMap?.[name] || 0,
        unapproved: unapprovedMap?.[name] || 0
    }));
};

const countBlocksByType = (blocks, blockType) => (blocks || []).filter(block => block.blockType === blockType).length;

export const IoisApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("IOIs"), []);
    const loggerService = useRef(new LoggerService(IoisApp.name)).current;
    const ioiService = useRef(ServiceRegistry.getIoiService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const traderService = useRef(ServiceRegistry.getTraderService()).current;
    const configurationService = useRef(ServiceRegistry.getConfigurationService()).current;
    const exchangeService = useRef(new ExchangeService()).current;

    const [selectedTab, setSelectedTab] = useState("1");
    const [instruments, setInstruments] = useState([]);
    const [traders, setTraders] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [liveIois, setLiveIois] = useState([]);
    const [cancelledIois, setCancelledIois] = useState([]);
    const [blockedIois, setBlockedIois] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [failures, setFailures] = useState([]);
    const [traderCounts, setTraderCounts] = useState([]);
    const [stockCounts, setStockCounts] = useState([]);
    const [marketCounts, setMarketCounts] = useState([]);
    const [reasonCounts, setReasonCounts] = useState([]);
    const [totals, setTotals] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [bulkRows, setBulkRows] = useState([]);
    const [cloneSeed, setCloneSeed] = useState(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [deleteRowOpen, setDeleteRowOpen] = useState(false);
    const [deleteBlockOpen, setDeleteBlockOpen] = useState(false);
    const [ioiToCancel, setIoiToCancel] = useState(null);
    const [blockToUnblock, setBlockToUnblock] = useState(null);
    const [, setIoiCreationDialogOpen] = useRecoilState(ioiCreationDialogDisplayState);
    const [, setIoiBlockDialogOpen] = useRecoilState(ioiBlockDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const bulkGridApiRef = useRef(null);
    const selectedLiveIoi = liveIois.find(ioi => ioi.requestId === selectedGenericGridRow?.requestId);
    const isToolbarDeleteDisabled = liveIois.length === 0 || !selectedLiveIoi || selectedTab !== "1";

    const timestampFormatter = (params) => params.value ? transformLocalDataTime(Number(params.value)) : "";
    const listFormatter = (params) => Array.isArray(params.value) ? params.value.join(",") : (params.value || "");

    const liveColumnDefs = useMemo(() => ([
        { headerName: "", field: "actions", width: 90, sortable: false, filter: false, cellRenderer: IoiActionIconsRenderer },
        { headerName: "Request Id", field: "requestId", width: 260 },
        { headerName: "RIC", field: "ric", width: 110 },
        { headerName: "Trader", field: "trader", width: 110 },
        { headerName: "Qty", field: "quantity", width: 90 },
        { headerName: "Side", field: "side", width: 100 },
        { headerName: "Price", field: "price", width: 90 },
        { headerName: "Last Price", field: "lastPrice", width: 100 },
        { headerName: "Market", field: "originalMarket", width: 100 },
        { headerName: "Order Type", field: "originalOrderType", width: 110 },
        { headerName: "Lifetime", field: "lifeTimeInMinutes", width: 90 },
        { headerName: "Source", field: "source", width: 90 },
        { headerName: "Status", field: "status", width: 100 },
        { headerName: "Qualifier", field: "BloombergQualifier", width: 110 },
        { headerName: "Clients", field: "clientIds", width: 140, valueFormatter: listFormatter },
        { headerName: "Flags", field: "ioiFlags", width: 120, valueFormatter: listFormatter },
        { headerName: "Comment", field: "comment", width: 180 },
        { headerName: "Timestamp", field: "timestamp", width: 170, valueFormatter: timestampFormatter }
    ]), []);

    const cancelledColumnDefs = useMemo(() => liveColumnDefs.filter(col => col.field !== "lastPrice"), [liveColumnDefs]);

    const blockedColumnDefs = useMemo(() => ([
        { headerName: "Request Id", field: "requestId", width: 260 },
        { headerName: "Block Type", field: "blockType", width: 110 },
        { headerName: "Trader", field: "trader", width: 110 },
        { headerName: "RIC", field: "ric", width: 110 },
        { headerName: "Market", field: "originalMarket", width: 100 },
        { headerName: "Reason", field: "reason", width: 280 },
        { headerName: "Source", field: "source", width: 90 },
        { headerName: "Timestamp", field: "timestamp", width: 170, valueFormatter: timestampFormatter }
    ]), []);

    const blocksColumnDefs = useMemo(() => ([
        { headerName: "", field: "actions", width: 50, sortable: false, filter: false, cellRenderer: IoiBlockActionIconsRenderer },
        { headerName: "User Id", field: "userId", width: 140 },
        { headerName: "Timestamp", field: "timestamp", width: 170, valueFormatter: timestampFormatter },
        { headerName: "Type", field: "blockType", width: 110 },
        { headerName: "Blocked", field: "value", width: 180 }
    ]), []);

    const failureColumnDefs = useMemo(() => ([
        { headerName: "Request Id", field: "requestId", width: 260 },
        { headerName: "Trader", field: "trader", width: 110 },
        { headerName: "RIC", field: "ric", width: 110 },
        { headerName: "Market", field: "originalMarket", width: 100 },
        { headerName: "Reason", field: "reason", width: 320 },
        { headerName: "Source", field: "source", width: 90 },
        { headerName: "Timestamp", field: "timestamp", width: 170, valueFormatter: timestampFormatter }
    ]), []);

    const countColumnDefs = (nameHeader, nameField) => ([
        { headerName: nameHeader, field: nameField, width: 220 },
        { headerName: "Approved", field: "created", width: 120 },
        { headerName: "Unapproved", field: "unapproved", width: 130 }
    ]);

    const reasonColumnDefs = useMemo(() => ([
        { headerName: "Reason", field: "reason", width: 420 },
        { headerName: "Count", field: "count", width: 120 }
    ]), []);

    const totalsColumnDefs = useMemo(() => ([
        { headerName: "Metric", field: "metric", width: 320 },
        { headerName: "Count", field: "value", width: 140 }
    ]), []);

    const configColumnDefs = useMemo(() => ([
        { headerName: "Key", field: "key", width: 320, editable: false },
        { headerName: "Label", field: "label", width: 220, editable: false },
        { headerName: "Value", field: "value", width: 180, editable: true },
        { headerName: "Id", field: "id", hide: true }
    ]), []);

    const bulkColumnDefs = useMemo(() => ([
        { headerName: "RIC", field: "ric", width: 120, editable: true },
        { headerName: "Trader", field: "trader", width: 120, editable: true },
        { headerName: "Qty", field: "quantity", width: 100, editable: true },
        { headerName: "Side", field: "side", width: 110, editable: true },
        { headerName: "Price", field: "price", width: 90, editable: true },
        { headerName: "Market", field: "originalMarket", width: 110, editable: true },
        { headerName: "Order Type", field: "originalOrderType", width: 120, editable: true },
        { headerName: "Lifetime", field: "lifeTimeInMinutes", width: 100, editable: true },
        { headerName: "Qualifier", field: "BloombergQualifier", width: 120, editable: true },
        { headerName: "Comment", field: "comment", width: 180, editable: true }
    ]), []);

    const loadData = useCallback(async () =>
    {
        try
        {
            const [live, cancelled, blocked, activeBlocks, failed, createdTraders, unapprovedTraders, createdStocks, unapprovedStocks, createdMarkets, unapprovedMarkets, reasons, createdTotal, unapprovedTotal] = await Promise.all([
                ioiService.getLive(),
                ioiService.getCancelled(),
                ioiService.getBlockedIois(),
                ioiService.getBlocks(),
                ioiService.getFailures(),
                ioiService.getCreatedByTrader(),
                ioiService.getUnapprovedByTrader(),
                ioiService.getCreatedByStock(),
                ioiService.getUnapprovedByStock(),
                ioiService.getCreatedByMarket(),
                ioiService.getUnapprovedByMarket(),
                ioiService.getUnapprovedByReason(),
                ioiService.getCreatedTotal(),
                ioiService.getUnapprovedTotal()
            ]);

            setLiveIois(live || []);
            setCancelledIois(cancelled || []);
            setBlockedIois(blocked || []);
            setBlocks(activeBlocks || []);
            setFailures(failed || []);
            setTraderCounts(mergeCountMaps(createdTraders, unapprovedTraders, "trader"));
            setStockCounts(mergeCountMaps(createdStocks, unapprovedStocks, "ric"));
            setMarketCounts(mergeCountMaps(createdMarkets, unapprovedMarkets, "market"));
            setReasonCounts(Object.entries(reasons || {}).map(([reason, count]) => ({ reason, count })));
            setTotals([
                { metric: "Approved IOIs Running Total", value: createdTotal?.total || 0 },
                { metric: "Unapproved IOIs Running Total", value: unapprovedTotal?.total || 0 },
                { metric: "Blocked IOIs", value: (blocked || []).length },
                { metric: "Blocked Traders", value: countBlocksByType(activeBlocks, "TRADER") },
                { metric: "Blocked Stocks", value: countBlocksByType(activeBlocks, "STOCK") },
                { metric: "Blocked Markets", value: countBlocksByType(activeBlocks, "MARKET") },
                { metric: "Currently Live IOIs", value: (live || []).length },
                { metric: "Currently Cancelled IOIs", value: (cancelled || []).length }
            ]);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load IOI data: ${error.message}`);
        }
    }, [ioiService, loggerService]);

    const loadConfigs = useCallback(async () =>
    {
        configurationService.clear();
        await configurationService.loadConfigurations("system");
        const systemConfigs = configurationService.getConfigsBelongingToOwner("system");
        setConfigs(IOI_CONFIG_KEYS.map(item =>
        {
            const existing = systemConfigs.find(config => config.key === item.key);
            return {
                key: item.key,
                label: item.label,
                value: existing?.value ?? "",
                id: existing?.id ?? ""
            };
        }));
    }, [configurationService]);

    useEffect(() =>
    {
        const bootstrap = async () =>
        {
            await instrumentService.loadInstruments();
            await traderService.loadTraders();
            await exchangeService.loadExchanges();
            setInstruments(instrumentService.getInstruments());
            setTraders(traderService.getTraders());
            setExchanges(exchangeService.getExchanges());
            setBulkRows(Array.from({ length: 12 }, () => emptyBulkRow(ioiService.createUuid())));
            await loadData();
            await loadConfigs();
        };
        bootstrap();
    }, [instrumentService, traderService, exchangeService, ioiService, loadData, loadConfigs]);

    useEffect(() =>
    {
        const timer = setInterval(loadData, 15000);
        return () => clearInterval(timer);
    }, [loadData]);

    const openCreateDialog = (seed) =>
    {
        setCloneSeed(seed || null);
        setIoiCreationDialogOpen({ open: true, clear: !seed });
    };

    const handleCreate = async (fields) =>
    {
        try
        {
            await ioiService.processIoi(ioiService.buildRequest(fields));
            await loadData();
        }
        catch (error)
        {
            loggerService.logError(`Failed to create IOI: ${error.message}`);
        }
    };

    const handleLiveAction = (action, data) =>
    {
        if (action === "clone")
            openCreateDialog(data);
        else if (action === "delete")
        {
            setIoiToCancel(data);
            setDeleteRowOpen(true);
        }
    };

    const confirmCancelIoi = async () =>
    {
        if (ioiToCancel?.requestId)
        {
            await ioiService.cancelIoi(ioiToCancel.requestId);
            await loadData();
        }
        setDeleteRowOpen(false);
        setIoiToCancel(null);
    };

    const confirmDeleteAll = async () =>
    {
        await ioiService.deleteAll();
        await loadData();
        setDeleteAllOpen(false);
    };

    const getLoggedInUserId = async () =>
    {
        if (window.configurations?.getLoggedInUserId)
            return await window.configurations.getLoggedInUserId();
        return "";
    };

    const handleBlock = async (type, value) =>
    {
        const userId = await getLoggedInUserId();
        if (type === "trader")
            await ioiService.blockTrader(value, userId);
        else if (type === "stock")
            await ioiService.blockStock(value, userId);
        else
            await ioiService.blockMarket(value, userId);
        await loadData();
    };

    const handleUnblock = async (type, value) =>
    {
        if (type === "trader")
            await ioiService.unblockTrader(value);
        else if (type === "stock")
            await ioiService.unblockStock(value);
        else
            await ioiService.unblockMarket(value);
        await loadData();
    };

    const handleBlockAction = (action, data) =>
    {
        if (action === "delete")
        {
            setBlockToUnblock(data);
            setDeleteBlockOpen(true);
        }
    };

    const confirmUnblock = async () =>
    {
        if (blockToUnblock?.blockType && blockToUnblock?.value)
            await handleUnblock(blockToUnblock.blockType.toLowerCase(), blockToUnblock.value);
        setDeleteBlockOpen(false);
        setBlockToUnblock(null);
    };

    const collectBulkRows = () =>
    {
        const rows = [];
        bulkGridApiRef.current?.api?.forEachNode(node => rows.push(node.data));
        return rows.filter(row => row?.ric && row?.quantity && row?.originalMarket && row?.side);
    };

    const handleBulkUpload = async () =>
    {
        const rows = collectBulkRows();
        if (rows.length === 0)
            return;

        const requests = rows.map(row => ioiService.buildRequest(row));
        await ioiService.processBulk(requests);
        setBulkRows(Array.from({ length: 12 }, () => emptyBulkRow(ioiService.createUuid())));
        await loadData();
    };

    const handleBulkPaste = async () =>
    {
        const text = await navigator.clipboard.readText();
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const headers = ["ric", "trader", "quantity", "side", "price", "originalMarket", "originalOrderType", "lifeTimeInMinutes", "BloombergQualifier", "comment"];
        const rows = lines.map(line =>
        {
            const cols = line.split("\t");
            const row = emptyBulkRow(ioiService.createUuid());
            headers.forEach((header, index) =>
            {
                if (cols[index] !== undefined)
                    row[header] = cols[index];
            });
            return row;
        });
        setBulkRows(rows.length > 0 ? rows : Array.from({ length: 12 }, () => emptyBulkRow(ioiService.createUuid())));
    };

    const handleSaveConfigs = async () =>
    {
        const updates = {};
        configs.forEach(config =>
        {
            if (config.value !== "")
                updates[config.key] = config.value;
        });
        await configurationService.saveOrUpdateConfigurations("system", updates);
        await ioiService.reconfigure();
        await loadConfigs();
    };

    const onConfigCellValueChanged = (event) =>
    {
        setConfigs(prev => prev.map(config => config.key === event.data.key ? { ...config, value: event.data.value } : config));
    };

    return (
        <>
            <TitleBarComponent
                title="IOIs"
                windowId={windowId}
                addButtonProps={{ handler: () => openCreateDialog(null), tooltipText: "Add new IOI..." }}
                deleteButtonProps={{ handler: () => setDeleteAllOpen(true), tooltipText: "Delete all IOIs...", disabled: isToolbarDeleteDisabled }}
                blockButtonProps={{ handler: () => setIoiBlockDialogOpen(true), tooltipText: "Block IOIs by trader, stock, or market..." }}
                showChannel={false}
                showTools={false} />
            <div style={{ width: "100%", height: "calc(100vh - 65px)", float: "left", padding: "0px", margin: "45px 0px 0px 0px" }}>
                <div className="ioi-app">
                    <TabContext value={selectedTab}>
                        <Box>
                            <TabList className="ioi-tab-list" onChange={(event, value) => setSelectedTab(value)} TabIndicatorProps={{style: {display: "none"}}}>
                                <Tab className="ioi-live-tab" label="Live" value="1" sx={tabSx} />
                                <Tab className="ioi-cancelled-tab" label="Cancelled" value="2" sx={tabSx} />
                                <Tab className="ioi-blocked-tab" label="Blocked" value="3" sx={tabSx} />
                                <Tab className="ioi-blocks-tab" label="Blocks" value="4" sx={tabSx} />
                                <Tab className="ioi-failures-tab" label="Failures" value="5" sx={tabSx} />
                                <Tab className="ioi-bulk-tab" label="Upload" value="6" sx={tabSx} />
                                <Tab className="ioi-trader-tab" label="Traders" value="7" sx={tabSx} />
                                <Tab className="ioi-stocks-tab" label="Stocks" value="8" sx={tabSx} />
                                <Tab className="ioi-markets-tab" label="Markets" value="9" sx={tabSx} />
                                <Tab className="ioi-reasons-tab" label="Failure Reasons" value="10" sx={tabSx} />
                                <Tab className="ioi-totals-tab" label="Totals" value="11" sx={tabSx} />
                                <Tab className="ioi-config-tab" label="Configurations" value="12" sx={tabSx} />
                            </TabList>
                        </Box>
                        <TabPanel value="1" className="ioi-live-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["requestId"]} columnDefs={liveColumnDefs} gridData={liveIois} handleAction={handleLiveAction} />
                        </TabPanel>
                        <TabPanel value="2" className="ioi-cancelled-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["requestId"]} columnDefs={cancelledColumnDefs} gridData={cancelledIois} handleAction={handleLiveAction} showDelete={false} />
                        </TabPanel>
                        <TabPanel value="3" className="ioi-blocked-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["requestId", "blockType"]} columnDefs={blockedColumnDefs} gridData={blockedIois} />
                        </TabPanel>
                        <TabPanel value="4" className="ioi-blocks-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["blockType", "value"]} columnDefs={blocksColumnDefs} gridData={blocks} handleAction={handleBlockAction} />
                        </TabPanel>
                        <TabPanel value="5" className="ioi-failures-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["requestId"]} columnDefs={failureColumnDefs} gridData={failures} />
                        </TabPanel>
                        <TabPanel value="6" className="ioi-bulk-panel" sx={tabPanelSx}>
                            <div className="ioi-bulk-actions">
                                <Button className="dialog-action-button" variant="contained" onClick={handleBulkPaste}>Paste from Excel</Button>
                                <Button className="dialog-action-button submit" variant="contained" onClick={handleBulkUpload}>Upload</Button>
                            </div>
                            <div className="ag-theme-alpine ioi-bulk-grid">
                                <AgGridReact
                                    ref={bulkGridApiRef}
                                    columnDefs={bulkColumnDefs}
                                    rowData={bulkRows}
                                    defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true }}
                                    rowHeight={22}
                                    headerHeight={22}
                                    animateRows={true}
                                    getRowId={(params) => params.data.id} />
                            </div>
                        </TabPanel>
                        <TabPanel value="7" className="ioi-trader-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["trader"]} columnDefs={countColumnDefs("Trader", "trader")} gridData={traderCounts} />
                        </TabPanel>
                        <TabPanel value="8" className="ioi-stocks-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["ric"]} columnDefs={countColumnDefs("Stock", "ric")} gridData={stockCounts} />
                        </TabPanel>
                        <TabPanel value="9" className="ioi-markets-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["market"]} columnDefs={countColumnDefs("Market", "market")} gridData={marketCounts} />
                        </TabPanel>
                        <TabPanel value="10" className="ioi-reasons-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["reason"]} columnDefs={reasonColumnDefs} gridData={reasonCounts} />
                        </TabPanel>
                        <TabPanel value="11" className="ioi-totals-panel" sx={tabPanelSx}>
                            <GenericGridComponent rowHeight={22} gridTheme="ag-theme-alpine" rowIdArray={["metric"]} columnDefs={totalsColumnDefs} gridData={totals} />
                        </TabPanel>
                        <TabPanel value="12" className="ioi-config-panel" sx={tabPanelSx}>
                            <div className="ioi-bulk-actions">
                                <Button className="dialog-action-button submit" variant="contained" onClick={handleSaveConfigs}>Save & Reconfigure</Button>
                            </div>
                            <div className="ag-theme-alpine ioi-bulk-grid">
                                <AgGridReact
                                    columnDefs={configColumnDefs}
                                    rowData={configs}
                                    defaultColDef={{ resizable: true, sortable: true, filter: true }}
                                    rowHeight={22}
                                    headerHeight={22}
                                    animateRows={true}
                                    onCellValueChanged={onConfigCellValueChanged}
                                    getRowId={(params) => params.data.key} />
                            </div>
                        </TabPanel>
                    </TabContext>
                </div>
            </div>
            <IoiCreationDialog closeHandler={handleCreate} instruments={instruments} traders={traders} seed={cloneSeed} />
            <IoiBlockDialog traders={traders} instruments={instruments} exchanges={exchanges} onBlock={handleBlock} onUnblock={handleUnblock} />
            <DeleteConfirmationDialog
                open={deleteAllOpen}
                onClose={() => setDeleteAllOpen(false)}
                onConfirm={confirmDeleteAll}
                dataToDelete={{}}
                selectedTab="all"
                getDataName={() => "all IOIs"}
                getItemDisplayName={() => "Every live IOI will be cancelled"} />
            <DeleteConfirmationDialog
                open={deleteRowOpen}
                onClose={() => { setDeleteRowOpen(false); setIoiToCancel(null); }}
                onConfirm={confirmCancelIoi}
                dataToDelete={ioiToCancel}
                selectedTab="ioi"
                getDataName={() => "IOI"}
                getItemDisplayName={(data) => data ? `${data.ric} (${data.requestId})` : ""} />
            <DeleteConfirmationDialog
                open={deleteBlockOpen}
                onClose={() => { setDeleteBlockOpen(false); setBlockToUnblock(null); }}
                onConfirm={confirmUnblock}
                dataToDelete={blockToUnblock}
                selectedTab="block"
                getDataName={() => "block"}
                getItemDisplayName={(data) => data ? `${data.blockType} ${data.value}` : ""} />
        </>
    );
};

export default IoisApp;
