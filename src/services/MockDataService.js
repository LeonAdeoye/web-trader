
const crossing_data = [
    {
        stockCode: "0001.HK",
        stockDescription: "CK Hutchison Holdings",
        currency: "HKD",
        buyOrders: [
            {
                desk: "Block HK",
                trader: "John Doe",
                quantity: 30000,
                notionalValue: 1500000,
                instruction: "Limit",
                price: 50,
                client: "CITICS",
                time: "09:30:00"
            },
            {
                desk: "LowTouch TK",
                trader: "Jane Smith",
                quantity: 20000,
                notionalValue: 960000,
                instruction: "Market",
                price: 48,
                client: "Client Masked",
                time: "09:35:00"
            },
            {
                desk: "HighTouch SG",
                trader: "Michael Johnson",
                quantity: 10050,
                notionalValue: 552750,
                instruction: "Market",
                price: 55,
                client: "Millennium Capital",
                time: "09:40:00"
            },
            {
                desk: "Block HK",
                trader: "Emily Brown",
                quantity: 1200,
                notionalValue: 63600,
                instruction: "Limit",
                price: 53,
                client: "GoldMan Sachs",
                time: "09:45:00"
            }
        ],
        sellOrders: [
            {
                desk: "Equity Derivatives HK",
                trader: "David Chen",
                quantity: 80000,
                notionalValue: 4480000,
                instruction: "Market",
                price: 56,
                client: "JP Morgan",
                time: "09:50:00"
            },
            {
                desk: "HighTouch HK",
                trader: "Sophia Liu",
                quantity: 7000,
                notionalValue: 406000,
                instruction: "Limit",
                price: 58,
                client: "Deutsche Bank",
                time: "09:55:00"
            }
        ]
    },
    {
        stockCode: "0388.HK",
        stockDescription: "Hong Kong Exchanges and Clearing",
        currency: "HKD",
        buyOrders: [
            {
                desk: "LowTouch",
                trader: "Jessica Wong",
                quantity: 150,
                notionalValue: 45000,
                instruction: "Limit",
                price: 295,
                client: "Client Masked",
                time: "10:05:00"
            }
        ],
        sellOrders: [
            {
                desk: "Facilitation HK",
                trader: "David Chen",
                quantity: 80,
                notionalValue: 24800,
                instruction: "Market",
                price: 310,
                client: "Client Masked",
                time: "10:10:00"
            },
            {
                desk: "HighTouch India",
                trader: "Sophia Liu",
                quantity: 70,
                notionalValue: 21350,
                instruction: "Limit",
                price: 305,
                client: "Deutsche Bank",
                time: "10:15:00"
            }
        ]
    },
    {
        stockCode: "0700.HK",
        stockDescription: "Tencent Holdings",
        currency: "HKD",
        buyOrders: [
            {
                desk: "Block",
                trader: "James Wang",
                quantity: 250,
                notionalValue: 60000,
                instruction: "Limit",
                price: 240,
                client: "Schroders",
                time: "10:30:00"
            },
            {
                desk: "LowTouch",
                trader: "Michelle Chen",
                quantity: 180,
                notionalValue: 42840,
                instruction: "Market",
                price: 238,
                client: "Client Masked",
                time: "10:35:00"
            }
        ],
        sellOrders: [
            {
                desk: "HighTouch TK",
                trader: "Daniel Liu",
                quantity: 140,
                notionalValue: 34300,
                instruction: "Market",
                price: 245,
                client: "Nomura",
                time: "10:40:00"
            },
            {
                desk: "HighTouch HK",
                trader: "Sophie Wang",
                quantity: 120,
                notionalValue: 29040,
                instruction: "Limit",
                price: 242,
                client: "JP Morgan",
                time: "10:45:00"
            }
        ]
    },
    {
        stockCode: "2318.HK",
        stockDescription: "Ping An Insurance Group",
        currency: "HKD",
        buyOrders: [
            {
                desk: "Facilitation HK",
                trader: "Andy Zhang",
                quantity: 180,
                notionalValue: 8694,
                instruction: "Limit",
                price: 48.3,
                client: "Client Masked",
                time: "11:00:00"
            },
            {
                desk: "Block",
                trader: "Grace Liu",
                quantity: 150,
                notionalValue: 7050,
                instruction: "Market",
                price: 47,
                client: "UBS",
                time: "11:05:00"
            }
        ],
        sellOrders: [
            {
                desk: "HighTouch HK",
                trader: "Brian Chen",
                quantity: 200,
                notionalValue: 9700,
                instruction: "Market",
                price: 48.5,
                client: "Client Masked",
                time: "11:10:00"
            }
        ]
    }
]

const filterTradesByDays = (trades, days) =>
{
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - days);

    const filteredBuyTrades = trades.buyTrades.filter((trade) =>
    {
        const tradeDate = new Date(trade.date);
        return tradeDate >= currentDate;
    });

    const filteredSellTrades = trades.sellTrades.filter((trade) =>
    {
        const tradeDate = new Date(trade.date);
        return tradeDate >= currentDate;
    });

    return {
        ...trades,
        buyTrades: filteredBuyTrades,
        sellTrades: filteredSellTrades,
    };
}

const client_trade_history = {
    buyTrades: [
        {
            stockCode: '0001.HK',
            stockDescription: 'CK Hutchison Holdings',
            currency: 'HKD',
            date: '08/06/23',
            averagePrice: 50.25,
            desk: 'LowTouch HK',
            trader: 'John Doe',
            originalQuantity: 30000,
            originalNotionalValue: 1500000,
            currentQuantity: 25000,
            currentNotionalValue: 1250000,
        },
        {
            stockCode: '0001.HK',
            stockDescription: 'CK Hutchison Holdings',
            currency: 'HKD',
            date: '08/06/23',
            averagePrice: 48.75,
            desk: 'HighTouch SG',
            trader: 'Jane Smith',
            originalQuantity: 20000,
            originalNotionalValue: 960000,
            currentQuantity: 18000,
            currentNotionalValue: 864000,
        },
        {
            stockCode: '0700.HK',
            stockDescription: 'Tencent Holdings',
            currency: 'HKD',
            date: '08/06/23',
            averagePrice: 535.50,
            desk: 'LowTouch HK',
            trader: 'Emily Brown',
            originalQuantity: 1200,
            originalNotionalValue: 63600,
            currentQuantity: 1000,
            currentNotionalValue: 53550,
        }
    ],
    sellTrades: [
        {
            stockCode: '0001.HK',
            stockDescription: 'CK Hutchison Holdings',
            currency: 'HKD',
            date: '08/06/23',
            averagePrice: 56.50,
            desk: 'Equity Derivatives HK',
            trader: 'David Chen',
            originalQuantity: 80000,
            originalNotionalValue: 4480000,
            currentQuantity: 78000,
            currentNotionalValue: 4368000,
        },
        {
            stockCode: '0001.HK',
            stockDescription: 'CK Hutchison Holdings',
            currency: 'HKD',
            date: '09/06/23',
            averagePrice: 58.20,
            desk: 'HighTouch HK',
            trader: 'Sophia Liu',
            originalQuantity: 7000,
            originalNotionalValue: 406000,
            currentQuantity: 6500,
            currentNotionalValue: 377750,
        },
        {
            stockCode: '0001.HK',
            stockDescription: 'CK Hutchison Holdings',
            currency: 'HKD',
            date: '05/06/23',
            averagePrice: 53.80,
            desk: 'LowTouch AU',
            trader: 'John Smith',
            originalQuantity: 15000,
            originalNotionalValue: 807000,
            currentQuantity: 14500,
            currentNotionalValue: 780500,
        },
        {
            stockCode: '0700.HK',
            stockDescription: 'Tencent Holdings',
            currency: 'HKD',
            date: '08/06/23',
            averagePrice: 556.80,
            desk: 'Equity Derivatives SG',
            trader: 'Michael Johnson',
            originalQuantity: 5000,
            originalNotionalValue: 276250,
            currentQuantity: 4800,
            currentNotionalValue: 265200,
        }
    ]
};

const stock_trade_history = {
    stockCode: '0001.HK',
    stockDescription: 'CK Hutchison Holdings',
    currency: 'HKD',
    buyTrades: [
        {
            client: 'Deutsche Bank',
            date: '08/06/23',
            averagePrice: 50.25,
            desk: 'LowTouch HK',
            trader: 'John Doe',
            originalQuantity: 30000,
            originalNotionalValue: 1500000,
            currentQuantity: 25000,
            currentNotionalValue: 1250000,
        },
        {
            client: 'Morgan Stanley',
            date: '09/06/23',
            averagePrice: 48.75,
            desk: 'HighTouch SG',
            trader: 'Jane Smith',
            originalQuantity: 20000,
            originalNotionalValue: 960000,
            currentQuantity: 18000,
            currentNotionalValue: 864000,
        },
        {
            client: 'JP Morgan',
            date: '09/03/23',
            averagePrice: 535.50,
            desk: 'LowTouch HK',
            trader: 'Emily Brown',
            originalQuantity: 1200,
            originalNotionalValue: 63600,
            currentQuantity: 1000,
            currentNotionalValue: 53550,
        },
        {
            client: 'Morgan Stanley',
            date: '08/18/23',
            averagePrice: 48.75,
            desk: 'HighTouch SG',
            trader: 'Jane Smith',
            originalQuantity: 20000,
            originalNotionalValue: 960000,
            currentQuantity: 18000,
            currentNotionalValue: 864000,
        },
        {
            client: 'Morgan Stanley',
            date: '08/18/23',
            averagePrice: 48.75,
            desk: 'HighTouch SG',
            trader: 'Jane Smith',
            originalQuantity: 20000,
            originalNotionalValue: 9600000,
            currentQuantity: 18000,
            currentNotionalValue: 8640000,
        },
        {
            client: 'JP Morgan',
            date: '09/08/23',
            averagePrice: 535.50,
            desk: 'LowTouch HK',
            trader: 'Emily Brown',
            originalQuantity: 1200,
            originalNotionalValue: 63600,
            currentQuantity: 1000,
            currentNotionalValue: 53550,
        },
        {
            client: 'Deutsche Bank',
            date: '04/15/23',
            averagePrice: 535.50,
            desk: 'LowTouch HK',
            trader: 'Emily Brown',
            originalQuantity: 1200,
            originalNotionalValue: 636000,
            currentQuantity: 1000,
            currentNotionalValue: 535500,
        },
    ],
    sellTrades: [
        {
            client: 'Millennium Capital',
            date: '08/06/23',
            averagePrice: 56.50,
            desk: 'Equity Derivatives HK',
            trader: 'David Chen',
            originalQuantity: 80000,
            originalNotionalValue: 4480000,
            currentQuantity: 78000,
            currentNotionalValue: 4368000,
        },
        {
            client: 'Goldman Sachs',
            date: '08/06/23',
            averagePrice: 58.20,
            desk: 'HighTouch HK',
            trader: 'Sophia Liu',
            originalQuantity: 7000,
            originalNotionalValue: 406000,
            currentQuantity: 6500,
            currentNotionalValue: 377750,
        },
        {
            client: 'Deutsche Bank',
            date: '08/26/23',
            averagePrice: 53.80,
            desk: 'LowTouch AU',
            trader: 'John Smith',
            originalQuantity: 15000,
            originalNotionalValue: 807000,
            currentQuantity: 14500,
            currentNotionalValue: 780500,
        },
        {
            client: 'Morgan Stanley',
            date: '08/26/23',
            averagePrice: 556.80,
            desk: 'Equity Derivatives SG',
            trader: 'Michael Johnson',
            originalQuantity: 5000,
            originalNotionalValue: 276250,
            currentQuantity: 4800,
            currentNotionalValue: 265200,
        }
    ]
};

export class MockDataService
{
    get(dataId, days)
    {
        switch (dataId)
        {
            case "crossing_data":
                return crossing_data;
            case "client_trade_history":
                return filterTradesByDays(client_trade_history, days);
            case "stock_trade_history":
                return filterTradesByDays(stock_trade_history, days);
            default:
                return [];
        }
    }
}
