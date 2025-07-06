export class FDC3Service
{
    static createOrderMenuContext = (selectedOrders) =>
    {
        let fdc3Context = {
            type: "fdc3.orderContextMenu",
            orders: []
        };

        if(selectedOrders && selectedOrders.length > 0)
        {
            fdc3Context["orders"].push(...selectedOrders);
        }

        return fdc3Context;
    }

    static createChartContext = (ticker, durationInHours) =>
    {
        let currentDate = new Date();
        let futureDate = new Date(currentDate.getTime() + (durationInHours * 60 * 60 * 1000));
        return         {
            type: "fdc3.chart",
            instruments: [
                {
                    type: "fdc3.instrument",
                    id: {
                        ticker: ticker
                    }
                }
            ],
            range: {
                type: "fdc3.timeRange",
                startTime: currentDate.toISOString(),
                endTime: futureDate.toISOString()
            },
            style: "line",
            otherConfig: {
                indicators: [
                    {
                        name: "volume"
                    }
                ]
            }
        };
    }

    static createBasketChartContext = (basketId) =>
    {
        return {
            type: "fdc3.chart",
            products: [
                {
                    type: "fdc3.product",
                    id: {
                        ticker: basketId
                    }
                }
            ]
        };
    }

    static createBlastContextShare = (blastData) =>
    {
        return {
            type: "fdc3.clipboard",
            payload: blastData
        };
    }

    static createContextShare = (instrumentCode, client) =>
    {
        let fdc3Context = {
            type: "fdc3.context",
        };

        if(instrumentCode)
        {
            fdc3Context["instruments"] = [{
                type: "fdc3.instrument",
                id: {
                    ticker: instrumentCode
                }
            }];
        }
        else
            fdc3Context["instruments"] = [];

        if(client)
        {
            fdc3Context["clientCode"] = [{
                type: "fdc3.client",
                id: {
                    name: client
                }
            }];
        }
        else
            fdc3Context["clientCode"] = [];

        return fdc3Context;
    }
}
