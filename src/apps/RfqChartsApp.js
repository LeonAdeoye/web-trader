import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { selectedContextShareState } from '../atoms/component-state';
import { LoggerService } from '../services/LoggerService';
import { OptionPricingService } from '../services/OptionPricingService';
import { useRef } from 'react';
import TitleBarComponent from "../components/TitleBarComponent";
import { AgChartsReact } from 'ag-charts-react';
import { FormControl, Select, MenuItem, InputLabel, Tooltip, Typography } from '@mui/material';

const RfqChartsApp = () =>
{
    const windowId = window.command.getWindowId("rfq-charts");
    const loggerService = useRef(new LoggerService(RfqChartsApp.name)).current;
    const optionPricingService = useRef(new OptionPricingService()).current;
    const urlParams = new URLSearchParams(window.location.search);
    const rfqDataParam = urlParams.get('rfqData');
    const configParam = urlParams.get('config');
    const [rangeKey, setRangeKey] = useState('VOLATILITY');
    const [startValue, setStartValue] = useState(0.1);
    const [endValue, setEndValue] = useState(0.5);
    const [increment, setIncrement] = useState(0.01);
    const [activeTab, setActiveTab] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [hasCalculated, setHasCalculated] = useState(false);
    const [config, setConfig] = useState({ defaultOptionModel: 'european' });
    const rangeKeyOptions = [
        { value: 'VOLATILITY', label: 'Volatility' },
        { value: 'UNDERLYING_PRICE', label: 'Underlying Price' },
        { value: 'TIME_TO_EXPIRY', label: 'Time To Expiry' },
        { value: 'INTEREST_RATE', label: 'Interest Rate' }
    ];

    let rfq = null;
    let rfqSnippetText = "";

    useEffect(() =>
    {
        if (configParam)
        {
            try
            {
                const parsedConfig = JSON.parse(decodeURIComponent(configParam));
                setConfig(parsedConfig);
            }
            catch (error)
            {
                loggerService.logError("Failed to parse config parameter: " + error.message);
            }
        }
    }, [configParam]);

    if (rfqDataParam)
    {
        try
        {
            rfq = JSON.parse(decodeURIComponent(rfqDataParam));
            rfqSnippetText = rfq.request;
        }
        catch (error)
        {
            loggerService.logError("Valid RFQ data not passed into Rfq Charts app.");
        }
    }

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const validateInputs = () =>
    {
        const errors = {};
        if (isNaN(startValue) || startValue === null || startValue === undefined)
        {
            errors.startValue = 'Start value is required';
        }
        else if (startValue < 0)
        {
            errors.startValue = 'Start value must be non-negative';
        }
        if (isNaN(endValue) || endValue === null || endValue === undefined)
        {
            errors.endValue = 'End value is required';
        }
        else if (endValue < 0)
        {
            errors.endValue = 'End value must be non-negative';
        }
        else if (endValue <= startValue)
        {
            errors.endValue = 'End value must be greater than start value';
        }
        
        // Validate increment
        if (isNaN(increment) || increment === null || increment === undefined)
        {
            errors.increment = 'Increment is required';
        }
        else if (increment <= 0)
        {
            errors.increment = 'Increment must be greater than 0';
        }
        else if (increment >= (endValue - startValue))
        {
            errors.increment = 'Increment must be smaller than the range';
        }
        if (!rangeKey || !rangeKeyOptions.find(opt => opt.value === rangeKey))
        {
            errors.rangeKey = 'Valid range key is required';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleStartValueChange = (value) =>
    {
        const numValue = parseFloat(value);
        setStartValue(isNaN(numValue) ? 0 : numValue);
        setHasCalculated(false);
        if (validationErrors.startValue)
            setValidationErrors(prev => ({ ...prev, startValue: undefined }));
    };

    const handleEndValueChange = (value) =>
    {
        const numValue = parseFloat(value);
        setEndValue(isNaN(numValue) ? 0 : numValue);
        setHasCalculated(false);
        if (validationErrors.endValue)
            setValidationErrors(prev => ({ ...prev, endValue: undefined }));
    };

    const handleIncrementChange = (value) =>
    {
        const numValue = parseFloat(value);
        setIncrement(isNaN(numValue) ? 0.01 : numValue);
        setHasCalculated(false);
        if (validationErrors.increment)
            setValidationErrors(prev => ({ ...prev, increment: undefined }));
    };

    const handleRangeKeyChange = (value) =>
    {
        setRangeKey(value);
        setHasCalculated(false);
        if (validationErrors.rangeKey)
            setValidationErrors(prev => ({ ...prev, rangeKey: undefined }));
    };

    const calculateRange = async () =>
    {
        if (!rfq || !rfq.legs || rfq.legs.length === 0) return;

        if (!validateInputs())
        {
            loggerService.logError('Validation failed, cannot calculate range');
            return;
        }
        
        setIsLoading(true);
        try
        {
            const leg = activeTab === 0 ? rfq.legs[0] : rfq.legs[activeTab - 1];
            
            const baseRequest =
            {
                strike: leg.strike,
                volatility: leg.volatility/100,
                underlyingPrice: leg.underlyingPrice,
                daysToExpiry: leg.daysToExpiry || 30,
                interestRate: leg.interestRate/100,
                isCall: leg.optionType === 'CALL',
                isEuropean: true,
                dayCountConvention: leg.dayCountConvention || 365,
                modelType: config.defaultOptionModel
            };

            const rangeRequest =
            {
                baseRequest,
                rangeKey,
                startValue,
                endValue,
                increment
            };

            const result = await optionPricingService.calculateRange(rangeRequest);
            const chartData = result.results.map(item => ({
                rangeVariable: item.rangeVariable,
                delta: item.delta,
                gamma: item.gamma,
                rho: item.rho,
                theta: item.theta,
                vega: item.vega,
                price: item.price
            }));
            
            setChartData(chartData);
            setHasCalculated(true);
        }
        catch (error)
        {
            loggerService.logError(`Error calculating range: ${error.message}`);
            setChartData([]);
        }
        finally
        {
            setIsLoading(false);
        }
    };

    const handleChartClick = async () =>
    {
        await calculateRange();
    };

    const chartOptions = {
        data: chartData,
        series: [
            { type: 'line', xKey: 'rangeVariable', yKey: 'delta', yName: 'Delta', stroke: '#1f77b4' },
            { type: 'line', xKey: 'rangeVariable', yKey: 'gamma', yName: 'Gamma', stroke: '#ff7f0e' },
            { type: 'line', xKey: 'rangeVariable', yKey: 'rho', yName: 'Rho', stroke: '#2ca02c' },
            { type: 'line', xKey: 'rangeVariable', yKey: 'theta', yName: 'Theta', stroke: '#d62728' },
            { type: 'line', xKey: 'rangeVariable', yKey: 'vega', yName: 'Vega', stroke: '#9467bd' },
            { type: 'line', xKey: 'rangeVariable', yKey: 'price', yName: 'Price', stroke: '#8c564b' }
        ],
        axes: [
            {
                type: 'number',
                position: 'bottom',
                title: { text: rangeKeyOptions.find(opt => opt.value === rangeKey)?.label || 'Range Variable' }
            },
            {
                type: 'number',
                position: 'left',
                title: { text: 'Greeks & Premium' }
            }
        ],
        legend: { enabled: true },
        tooltip: { enabled: true }
    };

    if (!rfq)
    {
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
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        Error displaying RFQ data
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <TitleBarComponent 
                title={`Request For Quote Charts (${rfqSnippetText})`}
                windowId={windowId} 
                addButtonProps={undefined} 
                showChannel={false} 
                showTools={false}/>
            
            <div className="rfq-charts-app" style={{ 
                width: '100%', 
                height: 'calc(100vh - 65px)', 
                float: 'left', 
                padding: '0px', 
                margin: '45px 0px 0px 0px'
            }}>
                {/* Control Section */}
                <div style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {/* Range Key Dropdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <FormControl size="small" style={{ minWidth: '140px' }}>
                            <InputLabel style={{ fontSize: '12px' }}>Range</InputLabel>
                            <Select
                                value={rangeKey}
                                onChange={(e) => handleRangeKeyChange(e.target.value)}
                                label="Range"
                                style={{ fontSize: '12px' }}
                                error={!!validationErrors.rangeKey}
                            >
                                {rangeKeyOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value} style={{ fontSize: '12px' }}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {validationErrors.rangeKey && (
                            <div style={{ fontSize: '10px', color: '#d32f2f', marginLeft: '8px' }}>
                                {validationErrors.rangeKey}
                            </div>
                        )}
                    </div>

                    {/* Start Value */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginRight: '4px' }}>Start:</label>
                            <input
                                type="number"
                                value={startValue}
                                onChange={(e) => handleStartValueChange(e.target.value)}
                                style={{
                                    fontSize: '12px',
                                    padding: '6px 12px',
                                    border: validationErrors.startValue ? '1px solid #d32f2f' : '1px solid #404040',
                                    borderRadius: '4px',
                                    width: '80px',
                                    height: '32px',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {validationErrors.startValue && (
                            <div style={{ fontSize: '10px', color: '#d32f2f', marginLeft: '32px' }}>
                                {validationErrors.startValue}
                            </div>
                        )}
                    </div>

                    {/* End Value */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginRight: '4px' }}>End:</label>
                            <input
                                type="number"
                                value={endValue}
                                onChange={(e) => handleEndValueChange(e.target.value)}
                                style={{
                                    fontSize: '12px',
                                    padding: '6px 12px',
                                    border: validationErrors.endValue ? '1px solid #d32f2f' : '1px solid #404040',
                                    borderRadius: '4px',
                                    width: '80px',
                                    height: '32px',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {validationErrors.endValue && (
                            <div style={{ fontSize: '10px', color: '#d32f2f', marginLeft: '32px' }}>
                                {validationErrors.endValue}
                            </div>
                        )}
                    </div>

                    {/* Increment */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666', marginRight: '4px' }}>Increment:</label>
                            <input
                                type="number"
                                value={increment}
                                onChange={(e) => handleIncrementChange(e.target.value)}
                                step="0.001"
                                style={{
                                    fontSize: '12px',
                                    padding: '6px 12px',
                                    border: validationErrors.increment ? '1px solid #d32f2f' : '1px solid #404040',
                                    borderRadius: '4px',
                                    width: '80px',
                                    height: '32px',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {validationErrors.increment && (
                            <div style={{ fontSize: '10px', color: '#d32f2f', marginLeft: '52px' }}>
                                {validationErrors.increment}
                            </div>
                        )}
                    </div>

                    {/* Chart Button */}
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                        <Tooltip 
                            title={
                                <Typography fontSize={12}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Click To Generate Greeks Analysis Chart</div>
                                    <div style={{ marginBottom: '2px' }}>• Calculates option Greeks (Delta, Gamma, Rho, Theta, Vega) and premium</div>
                                    <div style={{ marginBottom: '2px' }}>• Varies the selected range parameter from start to end value</div>
                                    <div style={{ marginBottom: '2px' }}>• Uses the specified increment to create data points</div>
                                    <div style={{ marginBottom: '2px' }}>• Displays results as colored line charts for each Greek</div>
                                    <div>• Shows how option sensitivity changes with market parameters</div>
                                </Typography>
                            }
                            placement="top"
                            arrow
                        >
                            <span>
                                <button
                                    onClick={handleChartClick}
                                    disabled={isLoading || Object.keys(validationErrors).length > 0}
                                    className="rfq-charts-chart-button"
                                >
                                    {isLoading ? 'Calculating...' : 'Chart'}
                                </button>
                            </span>
                        </Tooltip>
                    </div>
                </div>

                {/* Tab Section */}
                <div className="rfq-charts-tab-container">
                    <div className="rfq-charts-tab-list">
                        {/* All Legs Tab */}
                        <button
                            onClick={() => handleTabChange(null, 0)}
                            className={`rfq-charts-all-legs-tab ${activeTab === 0 ? 'selected' : ''}`}
                        >
                            All Legs
                        </button>

                        {/* Individual Leg Tabs */}
                        {rfq.legs.map((leg, index) => (
                            <button
                                key={index}
                                onClick={() => handleTabChange(null, index + 1)}
                                className={`rfq-charts-leg-tab ${activeTab === index + 1 ? 'selected' : ''}`}
                                title={`${leg.optionType} ${leg.side} ${leg.underlying} @ $${leg.strike}`}
                            >
                                <div className="leg-content">
                                    <span className="leg-id">{leg.legId}</span>
                                    <div className="leg-badges">
                                        <span className={`option-type-badge ${leg.optionType.toLowerCase()}`}>
                                            {leg.optionType}
                                        </span>
                                        <span className={`side-badge ${leg.side.toLowerCase()}`}>
                                            {leg.side}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Section */}
                <div className="rfq-charts-content">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div>Calculating range...</div>
                        </div>
                    ) : Object.keys(validationErrors).length > 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ color: '#d32f2f', fontSize: '14px' }}>
                                Please fix validation errors above to generate chart
                            </div>
                        </div>
                    ) : !hasCalculated ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                                Click "Chart" button to generate Greeks analysis
                            </div>
                        </div>
                    ) : chartData.length > 0 ? (
                        <div style={{ height: '100%', minHeight: '400px' }}>
                            <AgChartsReact options={chartOptions} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ color: '#d32f2f', fontSize: '14px' }}>
                                No chart data available. Please check your inputs and try again.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RfqChartsApp;
