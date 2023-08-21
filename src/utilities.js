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
    return isValidParameter(param) ? "$" + formatNumber(param.value) : param.value;
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

export const getRowIdValue = (rowIdArray, rowData) =>
{
    if(rowIdArray.length > 1)
    {
        let rowId = "";
        for(let index = 0; index < rowIdArray.length; index++)
        {
            let rowDataValue = rowData[rowIdArray[index]];
            if(rowDataValue !== undefined)
                rowId += (rowDataValue + "\\");
        }
        return rowId;
    }
    else
        return rowData[rowIdArray[0]];
}

export const createRowId = (rowIdArray) =>
{
    if(rowIdArray.length > 1)
    {
        let rowId = "";
        for(let index = 0; index < rowIdArray.length; index++)
        {
            let rowDataValue = rowIdArray[index];
            if(rowDataValue !== undefined)
                rowId += (rowDataValue + "\\");
        }
        return rowId;
    }
    else
        return rowIdArray[0];
}
