import * as React from "react";

const CheckboxRenderer = ({value}) =>
{
    return (<input type="checkbox" checked={value} disabled={true}/>);
};

export default CheckboxRenderer;
