import React, { useState, useEffect, useRef, useMemo} from 'react';
import { TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { OptionPricingService } from '../services/OptionPricingService';
import { LoggerService } from "../services/LoggerService";
import { formatDate } from "../utilities";
import { buildMetrics } from "../calculations/buildMetrics";
import { buildDerivedValues } from "../calculations/buidDerivedValues";

export const RfqDetailsComponent = ({ rfq, editable, index, config}) =>
{
    const [legMetrics, setLegMetrics] = useState(null);
    const [legDerivedValues, setLegDerivedValues] = useState(null);
    const optionPricingService = useMemo(() => new OptionPricingService(), []);
    const loggerService = useMemo(() => new LoggerService(RfqDetailsComponent.name), []);
    const windowId = useMemo(() => window.command.getWindowId("RFQ Details"), []);

    useEffect(() => {
        if (!rfq?.legs?.length) return;

        const leg = rfq.legs[index];

        const calculate = async () => {
            try {
                const greeks = await optionPricingService.calculateOptionPrice({
                    strike: leg.strike,
                    volatility: rfq.volatility / 100,
                    underlyingPrice: rfq.underlyingPrice,
                    daysToExpiry: rfq.daysToExpiry || 30,
                    interestRate: rfq.interestRate / 100,
                    isCall: leg.optionType === 'CALL',
                    isEuropean: rfq.exerciseType === "EUROPEAN",
                    dayCountConvention: rfq.dayCountConvention || '365'
                });

                const metrics = buildMetrics(rfq, leg, greeks);
                const derived = buildDerivedValues(rfq, leg, metrics);

                setLegMetrics(metrics);
                setLegDerivedValues(derived);
            } catch (err) {
                loggerService.logError("Error calculating leg metrics", err);
            }
        };

        calculate();
    }, [rfq, index]);

    const leg = rfq?.legs?.[index];

    const gridData = useMemo(() =>
    {
        if (!legMetrics || !legDerivedValues || !leg) return [];

        return [
            {
                field: 'Greek',
                delta: (legMetrics.delta * leg.quantity).toFixed(config.decimalPrecision),
                gamma: (legMetrics.gamma * leg.quantity).toFixed(config.decimalPrecision),
                theta: (legMetrics.theta * leg.quantity).toFixed(config.decimalPrecision),
                vega: (legMetrics.vega * leg.quantity).toFixed(config.decimalPrecision),
                rho: (legMetrics.rho * leg.quantity).toFixed(config.decimalPrecision)
            },
            {
                field: 'Notional',
                delta: legDerivedValues.deltaNotional.toFixed(config.decimalPrecision),
                gamma: legDerivedValues.gammaNotional.toFixed(config.decimalPrecision),
                theta: legDerivedValues.thetaNotional.toFixed(config.decimalPrecision),
                vega: legDerivedValues.vegaNotional.toFixed(config.decimalPrecision),
                rho: legDerivedValues.rhoNotional.toFixed(config.decimalPrecision)
            },
            {
                field: 'Percent',
                delta: (legDerivedValues.deltaPercent * leg.quantity).toFixed(config.decimalPrecision),
                gamma: (legDerivedValues.gammaPercent * leg.quantity).toFixed(config.decimalPrecision),
                theta: (legDerivedValues.thetaPercent * leg.quantity).toFixed(config.decimalPrecision),
                vega: (legDerivedValues.vegaPercent * leg.quantity).toFixed(config.decimalPrecision),
                rho: (legDerivedValues.rhoPercent * leg.quantity).toFixed(config.decimalPrecision)
            },
            {
                field: 'Shares',
                delta: legDerivedValues.deltaShares.toFixed(0),
                gamma: legDerivedValues.gammaShares.toFixed(0),
                theta: legDerivedValues.thetaShares.toFixed(0),
                vega: legDerivedValues.vegaShares.toFixed(0),
                rho: legDerivedValues.rhoShares.toFixed(0)
            }
        ];
    }, [legMetrics, legDerivedValues, leg, config]);

    const columnDefs = useMemo(() =>
    [
        { headerName: 'Field', field: 'field', width: 100, pinned: 'left', cellStyle: { backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '12px' }},
        { headerName: 'Delta', field: 'delta', width: 120 },
        { headerName: 'Gamma', field: 'gamma', width: 120 },
        { headerName: 'Theta', field: 'theta', width: 120 },
        { headerName: 'Vega', field: 'vega', width: 120 },
        { headerName: 'Rho', field: 'rho', width: 120 }
    ], []);

    const maturityDate = useMemo(() =>
    {
        if (!leg?.maturityDate) return "";
        return formatDate(new Date(leg.maturityDate).toLocaleDateString());
    }, [leg?.maturityDate]);

    const premiumSettlementDate = useMemo(() =>
    {
        if (!rfq?.premiumSettlementDate) return "";
        return formatDate(new Date(rfq.premiumSettlementDate).toLocaleDateString());
    }, [rfq?.premiumSettlementDate]);

    if (!rfq?.legs?.length || !legMetrics || !legDerivedValues)
        return <div>No RFQ data available</div>;

    const textFields =
    [
        { label: "Arrival Time", value: rfq.arrivalTime || '' },
        { label: "Quantity", value: leg.quantity || '' },
        { label: "Maturity Date", value: maturityDate },
        { label: "Days To Expiry", value: leg.daysToExpiry || '' },
        { label: "RFQ ID", value: rfq.rfqId || '' },
        { label: "Status", value: rfq.status || '' },
        { label: "Multiplier", value: rfq.multiplier || '' },
        { label: "Volatility", value: rfq.volatility || '' },
        { label: "Underlying", value: leg.underlying || '' },
        { label: "Underlying Price", value: rfq.underlyingPrice || '' },
        { label: "Exercise Type", value: rfq?.exerciseType || '' },
        { label: "Currency", value: leg.currency || '' },
        { label: "Strike", value: leg.strike || '' },
        { label: "Interest Rate", value: rfq.interestRate || '' },
        { label: "Notional Currency", value: rfq.notionalCurrency || '' },
        { label: "Notional FX Rate", value: rfq.notionalFXRate || '' },
        { label: "Notional In Local", value: rfq.notionalInLocal || '' },
        { label: "Notional In USD", value: rfq.notionalInUSD || '' },
        { label: "Premium In Local", value: legDerivedValues.premiumInLocal.toFixed(config.decimalPrecision) || '' },
        { label: "Premium In USD", value: legDerivedValues.premiumInUSD.toFixed(config.decimalPrecision) || '' },
        { label: "Ask Premium", value: (legMetrics.price + legMetrics.spread/2).toFixed(config.decimalPrecision) || '' },
        { label: "Bid Premium", value: (legMetrics.price - legMetrics.spread/2).toFixed(config.decimalPrecision) || '' },
        { label: "Premium Percentage", value: legDerivedValues.premiumPercentage.toFixed(config.decimalPrecision) || '' },
        { label: "Premium Settlement Currency", value: rfq.premiumSettlementCurrency || '' },
        { label: "Premium Settlement Date", value: premiumSettlementDate},
        { label: "Premium Settlement Days Override", value: rfq.premiumSettlementDaysOverride || '' },
        { label: "Premium Settlement FX Rate", value: rfq.premiumSettlementFXRate || '' },
        { label: "Sales Credit Amount", value: legDerivedValues.salesCreditAmount.toFixed(config.decimalPrecision) || '' },
        { label: "Sales Credit Percentage", value: rfq.salesCreditPercentage || '' }
    ];

    const createRows = () =>
    {
        const rows = [];
        for (let i = 0; i < textFields.length; i += 5) {
            const rowFields = textFields.slice(i, i + 5);
            rows.push(
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {rowFields.map((field, index) => (
                        <TextField
                            key={index}
                            size="small"
                            label={field.label}
                            value={field.value}
                            InputProps={{
                                readOnly: !editable,
                                style: { fontSize: '0.75rem' }
                            }}
                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                            style={{ width: '200px' }}
                        />
                    ))}
                </div>
            );
        }
        return rows;
    };

    return (
        <div style={{ padding: '10px' }}>
            <div className="ag-theme-alpine" style={{ height: '120px', width: '720px', marginBottom: '20px' }}>
                <AgGridReact rowData={gridData} columnDefs={columnDefs}  suppressRowClickSelection={true} rowSelection="none"
                    headerHeight={22} rowHeight={22} suppressColumnVirtualisation={true} suppressRowVirtualisation={true}
                    defaultColDef={{ resizable: false, sortable: true, filter: true }}/>
            </div>
            {createRows()}
        </div>
    );
};
