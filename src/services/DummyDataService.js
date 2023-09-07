
const crossing_data = [
    {
        stockCode: "0001.HK",
        stockDescription: "CK Hutchison Holdings",
        currency: "HKD",
        buyOrders: [
            {
                desk: "Equity Desk A",
                trader: "John Doe",
                quantity: 30000,
                notionalValue: 1500000,
                instruction: "Limit",
                price: 50,
                client: "Client A",
                time: "09:30:00"
            },
            {
                desk: "Equity Desk B",
                trader: "Jane Smith",
                quantity: 20000,
                notionalValue: 960000,
                instruction: "Market",
                price: 48,
                client: "Client B",
                time: "09:35:00"
            },
            {
                desk: "Equity Desk C",
                trader: "Michael Johnson",
                quantity: 10050,
                notionalValue: 552750,
                instruction: "Market",
                price: 55,
                client: "Client C",
                time: "09:40:00"
            },
            {
                desk: "Equity Desk D",
                trader: "Emily Brown",
                quantity: 1200,
                notionalValue: 63600,
                instruction: "Limit",
                price: 53,
                client: "Client D",
                time: "09:45:00"
            }
        ],
        sellOrders: [
            {
                desk: "Equity Desk E",
                trader: "David Chen",
                quantity: 80000,
                notionalValue: 4480000,
                instruction: "Market",
                price: 56,
                client: "Client E",
                time: "09:50:00"
            },
            {
                desk: "Equity Desk F",
                trader: "Sophia Liu",
                quantity: 7000,
                notionalValue: 406000,
                instruction: "Limit",
                price: 58,
                client: "Client F",
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
                desk: "Equity Desk F",
                trader: "Jessica Wong",
                quantity: 150,
                notionalValue: 45000,
                instruction: "Limit",
                price: 295,
                client: "Client F",
                time: "10:05:00"
            }
        ],
        sellOrders: [
            {
                desk: "Equity Desk G",
                trader: "David Chen",
                quantity: 80,
                notionalValue: 24800,
                instruction: "Market",
                price: 310,
                client: "Client G",
                time: "10:10:00"
            },
            {
                desk: "Equity Desk H",
                trader: "Sophia Liu",
                quantity: 70,
                notionalValue: 21350,
                instruction: "Limit",
                price: 305,
                client: "Client H",
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
                desk: "Equity Desk I",
                trader: "James Wang",
                quantity: 250,
                notionalValue: 60000,
                instruction: "Limit",
                price: 240,
                client: "Client I",
                time: "10:30:00"
            },
            {
                desk: "Equity Desk J",
                trader: "Michelle Chen",
                quantity: 180,
                notionalValue: 42840,
                instruction: "Market",
                price: 238,
                client: "Client J",
                time: "10:35:00"
            }
        ],
        sellOrders: [
            {
                desk: "Equity Desk K",
                trader: "Daniel Liu",
                quantity: 140,
                notionalValue: 34300,
                instruction: "Market",
                price: 245,
                client: "Client K",
                time: "10:40:00"
            },
            {
                desk: "Equity Desk L",
                trader: "Sophie Wang",
                quantity: 120,
                notionalValue: 29040,
                instruction: "Limit",
                price: 242,
                client: "Client L",
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
                desk: "Equity Desk M",
                trader: "Andy Zhang",
                quantity: 180,
                notionalValue: 8694,
                instruction: "Limit",
                price: 48.3,
                client: "Client M",
                time: "11:00:00"
            },
            {
                desk: "Equity Desk N",
                trader: "Grace Liu",
                quantity: 150,
                notionalValue: 7050,
                instruction: "Market",
                price: 47,
                client: "Client N",
                time: "11:05:00"
            }
        ],
        sellOrders: [
            {
                desk: "Equity Desk O",
                trader: "Brian Chen",
                quantity: 200,
                notionalValue: 9700,
                instruction: "Market",
                price: 48.5,
                client: "Client O",
                time: "11:10:00"
            }
        ]
    }
]

export class DummyDataService
{
    get(dataType)
    {
        if(dataType === "crossing_data")
            return crossing_data;
        else
            return [];
    }
}
