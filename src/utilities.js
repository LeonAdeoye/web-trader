export const formatNumber = (number) =>
{
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
export const numberFormatter = (param) =>
{
    return isValidParameter(param) ? formatNumber(param.value) : param.value;
}

export const currencyFormatter = (param) =>
{
    return isValidParameter(param) ? formatNumber(param.value) : param.value;
}

export const isValidParameter = (parameter) =>
{
    if(parameter === null || parameter === undefined)
        return false;

    if(parameter.value === null || parameter.value === undefined || parameter.value === '')
        return false;

    return true;
}

export const  transformLocalDataTime = (epochTimeInUTC) => new Date(epochTimeInUTC).toLocaleString();

export const createRowId = (rowIdArray) => rowIdArray.join("\\");

export const getRowIdValue = (rowIdArray, rowData) => rowIdArray.map(idKey => rowData[idKey]).filter(val => val !== undefined).join("\\");

export const isEmptyString = (str) => str === undefined || str === null || str.trim() === '';

export const createArrayFromScore = (score) =>
{
    if (Number.isInteger(score) && score > 0)
        return Array.from({ length: score + 1 }, (_, index) => index + 1);
    else
        throw new Error("Input must be a positive integer");
}

export const orderStateStyling = (orderState) =>
{
    const styleMapping = {
        'FULLY_FILLED': { backgroundColor: '#47603e', color: 'white' },
        'PARTIALLY_FILLED': { backgroundColor: '#178000', color: 'white' },
        'NEW_ORDER': { backgroundColor: '#4F81BD', color: 'white' },
        'PENDING_NEW': { backgroundColor: '#106cdc', color: 'white' },
        'PENDING_EXCH': { backgroundColor: '#114481', color: 'white' },
        'ACCEPTED_BY_DESK': { backgroundColor: '#858561', color: 'white' },
        'ACCEPTED_BY_OMS': { backgroundColor: '#adad34', color: 'white' },
        'ACCEPTED_BY_EXCH': { backgroundColor: '#d38926', color: 'white' },
        'REJECTED_BY_OMS': { backgroundColor: '#7c1515', color: 'white' },
        'REJECTED_BY_DESK': { backgroundColor: '#ea3535', color: 'white' },
        'REJECTED_BY_EXCH': { backgroundColor: '#723131', color: 'white' },
    };
    const value = orderState.trim();
    const style = styleMapping[value] || {};
    return style;
}

export const replaceUnderscoresWithSpace = (str) =>
{
    if (typeof str !== 'string') return str;
    return str.replace(/_/g, ' ');
}

export const orderSideStyling = (orderSide) =>
{
    const side = orderSide?.toLowerCase();
    if (side === 'buy')
        return { color: '#346bb4', fontWeight: 'bold', fontSize: '13px' };
    else if (side === 'sell')
        return { color: '#528c74', fontWeight: 'bold', fontSize: '13px'};
    else if (side === 'short_sell')
        return { color: 'red', fontWeight: 'bold', fontSize: '13px' };
    else
        return {};
}

export const sideValueConverter = (value) => {
    const sideMapping = {
        "BUY": "BUY",
        "SELL": "SELL",
        "SHORT_SELL": "SHORT SELL"
    };
    return sideMapping[value] || value;
};

export const settlementTypeConverter = (value) => {
    const settlementTypeMapping = {
        "T_PLUS_ONE": "T+1",
        "T_PLUS_TWO": "T+2",
        "T_PLUS_THREE": "T+3"
    };
    return settlementTypeMapping[value] || value;
};

export const assetTypeConverter = (value) => {
    const assetTypeMapping = {
        "STOCK": "Stock",
        "BOND": "Bond",
        "FUT": "Future",
        "OPT": "Option",
        "ETF": "ETF",
        "WARRANT": "Warrant",
        "CRYPTO": "Crypto"
    };
    return assetTypeMapping[value] || value;
};

export const xmlToJson = (xmlString) =>
{
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    function parseElement(element)
    {
        const obj = {};

        if (element.attributes.length > 0)
        {
            for (let attr of element.attributes)
            {
                obj[attr.name] = attr.value;
            }
        }

        for (let child of element.childNodes)
        {
            if (child.nodeType === 1)
            {
                const childData = parseElement(child);
                if (obj[child.nodeName])
                {
                    if (!Array.isArray(obj[child.nodeName]))
                    {
                        obj[child.nodeName] = [obj[child.nodeName]];
                    }
                    obj[child.nodeName].push(childData);
                }
                else
                {
                    obj[child.nodeName] = childData;
                }
            } else if (child.nodeType === 3)
            {
                const text = child.nodeValue.trim();
                if (text)
                {
                    obj["_text"] = text;
                }
            }
        }

        return obj;
    }

    return parseElement(xmlDoc.documentElement);
}


