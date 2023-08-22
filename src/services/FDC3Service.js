export class FDC3Service
{
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
}
