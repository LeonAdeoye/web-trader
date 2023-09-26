import * as React from 'react';
import {isEmptyString, transformLocalDataTime} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {useEffect, useState, useMemo} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {LoggerService} from "../services/LoggerService";
import {Button, ThemeProvider, Tooltip, Typography} from "@mui/material";
import '../styles/css/main.css';
import { selectedBasket} from "../atoms/component-state";
import {useRecoilState} from "recoil";

export const BasketOrdersComponent = () =>
{
    const [selectedBasketState, setSelectedBasketState] = useRecoilState(selectedBasket);
    return (
        <>
        </>
    );
}
