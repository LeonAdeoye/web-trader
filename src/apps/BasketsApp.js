import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {BasketListComponent} from "../components/BasketListComponent";
import {BasketOrdersComponent} from "../components/BasketOrdersComponent";
import {Resizable} from "re-resizable";
import React, {useMemo, useEffect, useRef} from "react";
import {useRecoilState} from "recoil";
import {selectedBasketState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";

export const BasketsApp = () =>
{
    const loggerService = useRef(new LoggerService(BasketsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("baskets"), []);
    const [selectedBasketId] = useRecoilState(selectedBasketState);

    useEffect(() =>
    {
        if(selectedBasketId)
            window.messenger.sendMessageToMain(FDC3Service.createBasketChartContext(selectedBasketId), "Basket Chart", windowId);
    }, [selectedBasketId]);

    return (<Grid container direction="column" style={{ height: '100%', overflow: 'hidden' }}>
            <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                <Resizable defaultSize={{ width: '15%', height: '100%' }}>
                    <BasketListComponent loggerService={loggerService}/>
                </Resizable>
                <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
                <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <BasketOrdersComponent loggerService={loggerService}/>
                </Grid>
            </Grid>
        </Grid>);
}
