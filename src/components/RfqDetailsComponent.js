import React from 'react';
import { Grid, TextField } from '@mui/material';

export const RfqDetailsComponent = ({ rfq, editable, index }) =>
{
    if (!rfq || !rfq.legs || rfq.legs.length === 0)
    {
        return <div>No RFQ data available</div>;
    }

    const leg = rfq.legs[index];

    const textFields = [
        { label: "Arrival Time", value: rfq.arrivalTime || '' },
        { label: "Quantity", value: leg.quantity || '' },
        { label: "Maturity Date", value: leg.maturityDate || '' },
        { label: "Days To Expiry", value: leg.daysToExpiry || '' },
        { label: "RFQ ID", value: rfq.rfqId || '' },
        { label: "Status", value: rfq.status || '' },
        { label: "Multiplier", value: rfq.multiplier || '' },
        { label: "Volatility", value: leg.volatility || '' },
        { label: "Underlying", value: leg.underlying || '' },
        { label: "Exercise Type", value: rfq?.exerciseType || '' },
        { label: "Currency", value: leg.currency || '' },
        { label: "Strike", value: leg.strike || '' },
        { label: "Interest Rate", value: leg.interestRate || '' }
    ];

    const createRows = () => {
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
            {createRows()}
        </div>
    );
};
