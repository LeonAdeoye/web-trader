import * as React from "react";

const CheckboxRenderer = (params) => {
    const { isActive } = params.data;
    const symbol = isActive ? "✔" : "✘";
    const color = isActive ? "green" : "red";
    return (
        <span
            style={{
                color,
                fontSize: "18px",
                cursor: "not-allowed",
            }}
        >
            {symbol}
        </span>
    );
};

export default CheckboxRenderer;
