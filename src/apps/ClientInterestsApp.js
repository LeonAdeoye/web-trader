import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useRef} from "react";

export const ClientInterestsApp = () =>
{
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;
    return (<Grid container direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
            <Resizable defaultSize={{ width: '17%', height: '100%' }}>
                <ClientListComponent loggerService={loggerService}/>
            </Resizable>
            <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
            <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                <ClientInterestsComponent loggerService={loggerService}/>
            </Grid>
        </Grid>
    </Grid>);
}
