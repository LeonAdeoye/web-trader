import * as React from 'react';
import {useState} from "react";
import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {BasketListComponent} from "./BasketListComponent";
import {BasketOrdersComponent} from "./BasketOrdersComponent";
import {BasketChartComponent} from "./BasketChartComponent";
import {Resizable} from "re-resizable";

export const BasketsApp = () =>
{
    const [loggerService] = useState(new LoggerService(BasketsApp.name));

    return (
        // Setting this to from 100vh to 98vh eliminated the vertical scroll bar on the right side of the screen.
        <Grid container direction="column" style={{ height: '98vh', overflow: 'hidden' }}>
            <Resizable defaultSize={{ width: '100%', height: '39%'}}>
                <BasketChartComponent/>
            </Resizable>
            <Divider orientation="horizontal" style={{backgroundColor:'#404040', height: '1px'}}/>
            <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '58%' }}>
                <Resizable defaultSize={{ width: '25%', height: '100%' }}>
                    <BasketListComponent loggerService={loggerService}/>
                </Resizable>
                <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
                <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <BasketOrdersComponent loggerService={loggerService}/>
                </Grid>
            </Grid>
        </Grid>
    );
}
