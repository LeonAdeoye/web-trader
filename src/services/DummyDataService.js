
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
