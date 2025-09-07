import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {InstrumentService} from "../services/InstrumentService";
import TitleBarComponent from "../components/TitleBarComponent";

export const FxRatesApp = () =>
{
    const [fxData, setFxData] = useState([]);
    const [, setIsLoading] = useState(false);
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const windowId = useMemo(() => window.command.getWindowId("FX Rates"), []);

    const loadExchangeRates = useCallback(async () =>
    {
        setIsLoading(true);
        try
        {
            // Load both exchange rates and instruments
            await Promise.all([
                exchangeRateService.loadExchangeRates(),
                instrumentService.loadInstruments()
            ]);

            const instruments = instrumentService.getInstruments();
            const settlementCurrencies = [...new Set(instruments.map(inst => inst.settlementCurrency))];
            const requiredCurrencies = ['EUR', 'USD', 'GBP', ...settlementCurrencies];
            const uniqueCurrencies = [...new Set(requiredCurrencies)];

            const ratesData = uniqueCurrencies
                .filter(currency => currency) // Remove any null/undefined currencies
                .map(currency =>
                ({
                    currency: currency,
                    rate: exchangeRateService.getExchangeRate(currency, 4).toFixed(4)
                }));
            
            setFxData(ratesData);
        }
        catch (error)
        {
            console.error('Failed to load exchange rates:', error);
        }
        finally
        {
            setIsLoading(false);
        }
    }, [exchangeRateService, instrumentService]);

    useEffect(() =>
    {
        loadExchangeRates();
        
        // Set up 30-minute periodic refresh
        const refreshInterval = setInterval(() =>
        {
            loadExchangeRates();
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(refreshInterval);
    }, [loadExchangeRates]);

    const columnDefs = useMemo(() => ([
        {headerName: "Currency", field: "currency", sortable: true, minWidth: 120, width: 120},
        {headerName: "Rate (USD)", field: "rate", sortable: true, minWidth: 120, width: 120, type: 'numericColumn'}]), []);

    return (<>
                <TitleBarComponent title="Fx Rates" windowId={windowId} addButtonProps={{ handler: loadExchangeRates, tooltipText: "Refresh Exchange Rates" }}
                    showChannel={false} showTools={false}/>
                <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                        <GenericGridComponent rowHeight={25} gridTheme={"ag-theme-alpine"} rowIdArray={["currency"]} columnDefs={columnDefs} gridData={fxData}/>
                    </div>
                </div>
            </>);
};
