import * as React from 'react';

const BasketListSummaryRenderer = (params) =>
{
    const { name, numberOfConstituents, executedNotionalValue, orderNotionalValue } = params.data;
    const executed = (executedNotionalValue / 1000000).toFixed(1) + 'm';
    const order = (orderNotionalValue / 1000000).toFixed(1) + 'm';

    return (
        <span>
            {name} ({numberOfConstituents})
            <span style={{ float: 'right' }}>
                [{executed}/{order}]
            </span>
        </span>
    );
};

export default BasketListSummaryRenderer;
