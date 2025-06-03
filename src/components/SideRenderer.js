import * as React from "react";

const SideRenderer = (params) => {
    const { side } = params.data;
    const color = side === "BUY" ? "green" : "red";
    return (
        <span
            style={{
                color,
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "not-allowed",
            }}
        >
            {side}
        </span>
    );
};

export default SideRenderer;
