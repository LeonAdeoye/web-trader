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


