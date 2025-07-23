import {LoggerService} from "./LoggerService";

export class OrderService
{
    #loggerService;

    constructor()
    {
        this.#loggerService = new LoggerService(this.constructor.name);
    }

    getSide = (side) =>
    {
        switch(side)
        {
            case 'BUY':
                return '1';
            case 'SELL':
                return '2';
            case 'SHORT_SELL':
                return '5';
            default:
                throw new Error(`Unknown side: ${side}`);
        }
    }

    getSettlementType = (settlementType) =>
    {
        switch(settlementType)
        {
            case 'T_PLUS_ZERO':
                return '0';
            case 'T_PLUS_ONE':
                return '2';
            case 'T_PLUS_TWO':
                return '3';
            case 'T_PLUS_THREE':
                return '4';
            default:
                throw new Error(`Unknown settlement type: ${settlementType}`);
        }
    }

    createChildOrder = (parentOrder, sliceQty, originalQty, price, usdPrice, childDestination) =>
    {
        return {
            orderId: crypto.randomUUID(),
            parentOrderId: parentOrder.orderId,
            quantity: sliceQty,
            price: price,
            clientCode: parentOrder.clientCode,
            clientDescription: parentOrder.clientDescription,
            priceType: parentOrder.priceType,
            percentageOfParentOrder: ((sliceQty / originalQty) * 100).toFixed(2),
            destination: childDestination,
            ownerId: parentOrder.ownerId,
            state: 'ACCEPTED_BY_DESK',
            traderInstruction: parentOrder.traderInstruction,
            actionEvent: 'SUBMIT_TO_EXCH',
            settlementCurrency: parentOrder.settlementCurrency,
            side: parentOrder.side,
            instrumentCode: parentOrder.instrumentCode,
            arrivalTime: new Date().toLocaleTimeString(),
            arrivalPrice: parentOrder.priceType === '2' ? parentOrder.price : '0',
            pending: sliceQty,
            executed: 0,
            sliced: 0,
            tradeDate: new Date().toLocaleDateString(),
            executedNotionalValueInUSD: '0',
            executedNotionalValueInLocal: '0',
            orderNotionalValueInUSD: (parentOrder.priceType === '2' && price !== '') ? (sliceQty * usdPrice).toFixed(2) : '0',
            orderNotionalValueInLocal: (parentOrder.priceType === '2' && price !== '') ? (sliceQty * price).toFixed(2) : '0',
            residualNotionalValueInLocal: parentOrder.orderNotionalValueInLocal,
            residualNotionalValueInUSD: parentOrder.orderNotionalValueInUSD,
            averagePrice: '0',
            originalSource: "WEB_TRADER",
            currentSource: "WEB_TRADER",
            targetSource: "ORDER_MANAGEMENT_SERVICE",
            executedTime: '',
            messageType: 'CHILD_ORDER',
        };
    }

    isChildOrder = (order) =>
    {
        return order.parentOrderId !== order.orderId;
    }

    isParentOrder = (order) =>
    {
        return order.parentOrderId === order.orderId;
    }

    buildFixMessage = (pairs, delimiter = '\x01') =>
    {
        const body = pairs.map(([tag, value]) => `${tag}=${value}`).join(delimiter);
        const bodyLength = body.length;
        const head = `8=FIX.4.4${delimiter}9=${bodyLength}${delimiter}`;
        const fullMessage = head + body;
        const checksum = [...fullMessage].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 256;
        const checksumStr = checksum.toString().padStart(3, '0');
        return `${fullMessage}${delimiter}10=${checksumStr}${delimiter}`;
    }

    createNewOrderFixMessage = (order, ownerId) =>
    {
        let messageArray = [
            ['8', 'FIX.4.4'],
            ['35', 'D'],
            ['49', order.clientCode],
            ['56', order.brokerAcronym],
            ['11', crypto.randomUUID() ],
            ['55', order.instrumentCode],
            ['22', '5'],
            ['54', this.getSide(order.side)],
            ['38', order.quantity],
            ['40', order.priceType],
            ['44', order.price],
            ['59', order.tif],
            ['448', ownerId],
            ['452', '12'],
            ['63', this.getSettlementType(order.settlementType)],
            ['15', order.settlementCurrency],
            ['21', order.handlingInstruction],
            ['100', order.destination],
            ['1', order.accountMnemonic],
            ['104', order.qualifier],
            ['18', order.traderInstruction],
            ['453', '1'],
            ['448', order.legalEntity],
            ['447', 'D'],
            ['452', order.isFirmAccount ? '1' : '3'],
            ['528', order.isRiskAccount ? 'R' : 'N'],
            ['847', order.algoType],
            ['561', order.lotSize]];

        if(order.destination === 'FACIL')
        {
            messageArray.push(['7928', order.facilConsent ? 'Y' : 'N']);
            messageArray.push(['20001', `facil consent details: ${order.facilConsentDetails}`]);
            messageArray.push(['20002', `facil instr: ${order.facilInstructions}`]);
        }

        if(order.customFlags !== "")
            messageArray.push(['20000', `Custom flags: ${order.customFlags}`]);

        if(order.destination === 'DSA')
            messageArray.push(['847', order.algoType]);

        const message = this.buildFixMessage(messageArray);

        this.#loggerService.logInfo(`Created FIX message: ${message}`);

        return message;
    }

    parseFixMessageToJson = (fixMessage, delimiter = '\x01') =>
    {
        const parts = fixMessage.split(delimiter).filter(Boolean);
        const jsonResult = {};

        for (const part of parts) {
            const [tag, value] = part.split('=');
            jsonResult[tag] = value;
        }

        return jsonResult;
    };
}
