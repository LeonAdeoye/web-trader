import * as React from "react";

const SideRenderer = (params) => {
    const { side } = params.data;
    const color = side === "BUY" ? "#346bb4" : "#528c74";
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
