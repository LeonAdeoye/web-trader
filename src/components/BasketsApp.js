import * as React from 'react';
import {GenericGridComponent} from "./GenericGridComponent";
import {useEffect, useState, useMemo} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {LoggerService} from "../services/LoggerService";
import {Button, ThemeProvider, Tooltip, Typography} from "@mui/material";
import '../styles/css/main.css';
import {selectedBasket} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {BasketListComponent} from "./BasketListComponent";
import {BasketOrdersComponent} from "./BasketOrdersComponent";
import {BasketChartComponent} from "./BasketChartComponent";

export const BasketsApp = () =>
{
    const [selectedBasketState, setSelectedBasketState] = useRecoilState(selectedBasket);
    return (
      <>
          <BasketListComponent/>
          <BasketOrdersComponent/>
          <BasketChartComponent/>
      </>
    );
}
