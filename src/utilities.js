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

export const getDateMinusDays = (days) =>
{
    const date = new Date();
    date.setDate(date.getDate() - days);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

export const getDateToday = () =>
{
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

export const formatDate = (date) =>
{
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) return ''; // Handle invalid dates
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export const getTodayTradeDateFormat = () =>
{
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

// Status-related utility functions
export const getStatusColor = (status) =>
{
    switch (status?.toUpperCase()) 
    {
        case 'PENDING':
            return '#ffa726'; // Orange
        case 'ACCEPTED':
            return '#66bb6a'; // Green
        case 'REJECTED':
            return '#ef5350'; // Red
        case 'PRICING':
            return '#ab47bc'; // Purple
        case 'PRICED':
            return '#42a5f5'; // Blue
        case 'TRADED_AWAY':
            return '#ff7043'; // Deep Orange
        case 'TRADE_COMPLETED':
            return '#26a69a'; // Teal
        default:
            return '#9e9e9e'; // Gray
    }
};

export const formatStatus = (status) =>
{
    if (!status) return '';
    return status.replace(/_/g, ' ')
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
};

// Color manipulation utility function
export const adjustColor = (color, amount) =>
{
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const formatTime = (timeValue) =>
{
    if (!timeValue) return 'N/A';
    const timeStr = timeValue.toString();
    if (timeStr.includes(':')) return timeStr;
    const date = new Date(timeValue);
    if (isNaN(date)) return 'N/A';
    
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
}

export const formatTimeFromISO = (isoString) =>
{
    if (!isoString) return 'N/A';
    const timeStr = isoString.toString();
    if (timeStr.includes(':') && !timeStr.includes('T')) return timeStr;

    if (timeStr.includes('T'))
    {
        const timePart = timeStr.split('T')[1];
        const cleanTime = timePart.split('Z')[0].split('+')[0].split('-')[0];
        return cleanTime;
    }

    const date = new Date(isoString);
    if (isNaN(date)) return 'N/A';
    
    return date.toLocaleTimeString('en-US', {
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
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
        'DONE_FOR_DAY': { backgroundColor: '#404040', color: 'white' },
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

export const assetTypeConverter = (value) =>
{
    const assetTypeMapping =
    {
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

export const safeDouble = (value) =>
{
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

export const defaultIfBlank = (value, fallback) =>
{
    if (value === null || value === undefined || value === '')
        return fallback === null || fallback === undefined ? 'Unknown' : fallback;

    return String(value).trim() === '' ? (fallback === null || fallback === undefined ? 'Unknown' : fallback) : value;
};

export const getPercentageColour = (params) =>
{
    if (params.value >  90) return  {backgroundColor: 'pink', color: 'black'};
    if (params.value >  75) return  {backgroundColor: 'gold', color: 'black'};
}

export const getSideColour = (params) =>
{
    return (params.value === "BUY") ? {fontWeight: 'bold', color: 'darkblue'} : {fontWeight: 'bold', color: 'darkred'};
}

export const getLimitBreachTypeColour = (params) =>
{
    if (params.value.includes("Full")) return {fontWeight: 'bold', color: 'olive'};
}

export const formatTimestamp = (timestamp) =>
{
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}
