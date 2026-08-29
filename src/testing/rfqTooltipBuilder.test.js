import React from 'react';
import { getNotionalUSDTooltip, NOTIONAL_USD_HEADER_TOOLTIP } from "../calculations/rfqTooltipBuilder";
import { render } from '@testing-library/react';
import NotionalUSDCellRenderer from "../components/NotionalUSDCellRenderer";

describe('rfqTooltipBuilder', () =>
{
    it('exports notional USD header tooltip formula', () =>
    {
        expect(NOTIONAL_USD_HEADER_TOOLTIP).toBe("Notional in USD = notionalInLocal / notionalFXRate");
    });

    it('builds notional USD tooltip with formula and substituted values', () =>
    {
        const rfq = {
            notionalInLocal: 40000,
            notionalFXRate: 1.25,
            notionalInUSD: 32000
        };

        const tooltip = getNotionalUSDTooltip(rfq);

        expect(tooltip).toBe("Notional in USD = notionalInLocal / notionalFXRate\n= 40,000 / 1.25\n= 32,000");
    });

    it('builds notional USD tooltip from formatted notionalInUSD string', () =>
    {
        const tooltip = getNotionalUSDTooltip({
            notionalInLocal: 40000,
            notionalFXRate: 1.25,
            notionalInUSD: "32000.00"
        });

        expect(tooltip).toBe("Notional in USD = notionalInLocal / notionalFXRate\n= 40,000 / 1.25\n= 32,000");
    });

    it('derives notionalInLocal when only USD and FX rate are present', () =>
    {
        const tooltip = getNotionalUSDTooltip({
            notionalFXRate: 1.25,
            notionalInUSD: 32000
        });

        expect(tooltip).toBe("Notional in USD = notionalInLocal / notionalFXRate\n= 40,000 / 1.25\n= 32,000");
    });

    it('cell renderer displays formatted cell value', () =>
    {
        const row = {
            notionalInLocal: 40000,
            notionalFXRate: 1.25,
            notionalInUSD: "32000.00"
        };
        const { container } = render(<NotionalUSDCellRenderer data={row} value={row.notionalInUSD} valueFormatted="32,000.00" />);
        const span = container.querySelector('span');

        expect(span.textContent).toBe("32,000.00");
    });

    it('returns formula only when values are missing', () =>
    {
        const tooltip = getNotionalUSDTooltip({});

        expect(tooltip).toBe("Notional in USD = notionalInLocal / notionalFXRate");
    });
});
