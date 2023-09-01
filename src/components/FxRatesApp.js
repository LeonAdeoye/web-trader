import * as React from 'react';
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState} from "react";
import {FxService} from "../services/FxService";

export const FxRatesApp = () =>
{
    const [fxService] = useState(new FxService());
    const [gridData, setGridData] = useState([]);

    useEffect(() =>
    {
        fxService.loadExchangeRates();

        setGridData([{
            currency: "USD",
            bid: 0.95,
            ask: 1.05,
            mid: 1.0
        },
        {
            currency: "JPY",
            bid: 108,
            ask: 112,
            mid: 110
        },
        {
            currency: "GBP",
            bid: 0.785,
            ask: 0.795,
            mid: 0.790
        }]);
    }, []);

    const columnDefs = [
        {headerName: "Currency", field: "currency", sortable: true, minWidth: 130, width: 130},
        {headerName: "Bid", field: "bid", sortable: false, minWidth: 100, width: 100},
        {headerName: "Ask", field: "ask", sortable: false, minWidth: 100, width: 100},
        {headerName: "Mid", field: "mid", sortable: false, minWidth: 100, width: 100}];

    return (<GenericGridApp rowHeight={25}
                            gridTheme={"ag-theme-alpine"}
                            rowIdArray={["currency"]}
                            columnDefs={columnDefs}
                            gridData={gridData}/>);
};
