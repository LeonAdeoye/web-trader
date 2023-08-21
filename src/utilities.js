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
