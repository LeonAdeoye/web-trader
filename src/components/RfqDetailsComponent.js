import React, { useState, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { OptionPricingService } from '../services/OptionPricingService';
import {LoggerService} from "../services/LoggerService";

export const RfqDetailsComponent = ({ rfq, editable, index, config}) =>
{
    const [legMetrics, setLegMetrics] = useState(null);
    const [legDerivedValues, setLegDerivedValues] = useState(null);
    const optionPricingService = new OptionPricingService();
    const loggerService = useRef(new LoggerService(RfqDetailsComponent.name)).current;

    useEffect(() =>
    {
        if (!rfq || !rfq.legs || rfq.legs.length === 0)
            return;

        const leg = rfq.legs[index];
        const calculateLegMetrics = async () =>
        {
            try
            {
                const { notionalFXRate = 1, interestRate = 0, volatility = 20, underlyingPrice = 80, multiplier = 1 } = rfq;
                const { quantity = 1, strike = 100, optionType = 'CALL' } = leg;
                const isCall = (optionType === 'CALL');
                const isEuropean = rfq.exerciseType === "EUROPEAN";
                const {delta: rawDelta, gamma: rawGamma, theta: rawTheta, rho: rawRho, vega: rawVega, price: rawPrice} = await optionPricingService.calculateOptionPrice({
                    strike, volatility: volatility/100, underlyingPrice, daysToExpiry: rfq.daysToExpiry || 30, interestRate: interestRate/100,
                    isCall, isEuropean, dayCountConvention: rfq.dayCountConvention || '365'
                });
                const deltaNumber = Number(rawDelta);
                const gammaNumber = Number(rawGamma);
                const thetaNumber = Number(rawTheta);
                const vegaNumber = Number(rawVega);
                const rhoNumber = Number(rawRho);
                const shares = quantity * multiplier;
                const notionalShares = shares * underlyingPrice;
                const notionalInLocal = quantity * multiplier * strike;
                const notionalInUSD = notionalInLocal / notionalFXRate;
                const metrics =
                {
                    delta: deltaNumber * (leg.side === 'SELL' ? -1 : 1),
                    gamma: gammaNumber * (leg.side === 'SELL' ? -1 : 1),
                    theta: thetaNumber * (leg.side === 'SELL' ? -1 : 1),
                    vega: vegaNumber * (leg.side === 'SELL' ? -1 : 1),
                    rho: rhoNumber * (leg.side === 'SELL' ? -1 : 1),
                    price: Number(rawPrice) * (leg.side === 'SELL' ? -1 : 1),
                    shares,
                    notionalShares,
                    notionalInLocal,
                    notionalInUSD
                };
                
                setLegMetrics(metrics);
                const { underlyingPrice: underlying = 80, spread = 0, salesCreditPercentage = 0.5 } = rfq;
                const { delta, gamma, theta, vega, rho, price: optionPrice, shares: legShares, notionalShares: legNotionalShares, notionalInUSD: legNotionalInUSD } = metrics;
                const salesCreditAmount = (salesCreditPercentage * legNotionalInUSD / 100);
                const derivedValues =
                {
                    deltaShares: delta * legShares,
                    deltaNotional: delta * legNotionalShares,
                    deltaPercent: (delta * 100) / underlying,
                    gammaShares: gamma * legShares,
                    gammaNotional: gamma * legNotionalShares,
                    gammaPercent: (gamma * 100) / underlying,
                    thetaShares: theta * legShares,
                    thetaNotional: theta * legNotionalShares,
                    thetaPercent: (theta * 100) / underlying,
                    vegaShares: vega * legShares,
                    vegaNotional: vega * legNotionalShares,
                    vegaPercent: (vega * 100) / underlying,
                    rhoShares: rho * legShares,
                    rhoNotional: rho * legNotionalShares,
                    rhoPercent: (rho * 100) / underlying,
                    askPremium: (optionPrice + spread/2),
                    bidPremium: (optionPrice - spread/2),
                    premiumInUSD: optionPrice / notionalFXRate,
                    premiumInLocal: optionPrice,
                    premiumPercentage: (optionPrice * 100) / underlying,
                    salesCreditAmount
                };
                setLegDerivedValues(derivedValues);
            }
            catch (error)
            {
                loggerService.logError('Error calculating leg metrics:', error);
            }
        };

        calculateLegMetrics().then(() => loggerService.logInfo("Successfully calculated option prices and greeks."))
    }, [rfq, index]);

    if (!rfq || !rfq.legs || rfq.legs.length === 0 || legMetrics === null || legDerivedValues === null)
        return <div>No RFQ data available</div>;

    const leg = rfq.legs[index];
    const gridData =
    [
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

    const columnDefs =
    [
        { 
            headerName: 'Field', 
            field: 'field', 
            width: 100, 
            pinned: 'left',
            cellStyle: { 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold',
                fontSize: '12px'
            }
        },
        { headerName: 'Delta', field: 'delta', width: 120 },
        { headerName: 'Gamma', field: 'gamma', width: 120 },
        { headerName: 'Theta', field: 'theta', width: 120 },
        { headerName: 'Vega', field: 'vega', width: 120 },
        { headerName: 'Rho', field: 'rho', width: 120 }
    ];

    const textFields =
    [
        { label: "Arrival Time", value: rfq.arrivalTime || '' },
        { label: "Quantity", value: leg.quantity || '' },
        { label: "Maturity Date", value: leg.maturityDate || '' },
        { label: "Days To Expiry", value: leg.daysToExpiry || '' },
        { label: "RFQ ID", value: rfq.rfqId || '' },
        { label: "Status", value: rfq.status || '' },
        { label: "Multiplier", value: rfq.multiplier || '' },
        { label: "Volatility", value: leg.volatility || '' },
        { label: "Underlying", value: leg.underlying || '' },
        { label: "Underlying Price", value: leg.underlyingPrice || '' },
        { label: "Exercise Type", value: rfq?.exerciseType || '' },
        { label: "Currency", value: leg.currency || '' },
        { label: "Strike", value: leg.strike || '' },
        { label: "Interest Rate", value: leg.interestRate || '' },
        { label: "Notional Currency", value: rfq.notionalCurrency || '' },
        { label: "Notional FX Rate", value: rfq.notionalFXRate || '' },
        { label: "Notional In Local", value: rfq.notionalInLocal || '' },
        { label: "Notional In USD", value: rfq.notionalInUSD || '' },
        { label: "Premium In Local", value: legDerivedValues.premiumInLocal.toFixed(config.decimalPrecision) || '' },
        { label: "Premium In USD", value: legDerivedValues.premiumInUSD.toFixed(config.decimalPrecision) || '' },
        // { label: "Ask Premium", value: rfq.askPremium.toFixed(config.decimalPrecision) || '' },
        // { label: "Bid Premium", value: rfq.bidPremium.toFixed(config.decimalPrecision) || '' },
        { label: "Premium Percentage", value: legDerivedValues.premiumPercentage.toFixed(config.decimalPrecision) || '' },
        { label: "Premium Settlement Currency", value: rfq.premiumSettlementCurrency || '' },
        { label: "Premium Settlement Date", value: rfq.premiumSettlementDate || '' },
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
