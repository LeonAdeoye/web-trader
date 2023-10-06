import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useEffect, useRef} from "react";
import {useRecoilState} from "recoil";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import ClientInterestDialogComponent from "../components/ClientInterestDialogComponent";
import {ClientService} from "../services/ClientService";
import {InstrumentService} from "../services/InstrumentService";
import {ClientInterestService} from "../services/ClientInterestService";
import {selectedClientState} from "../atoms/component-state";

export const ClientInterestsApp = () =>
{
    const [, setClientInterestDialogOpenFlag] = useRecoilState(clientInterestDialogDisplayState)
    const [selectedClient, setSelectedClient] = useRecoilState(selectedClientState);
    const clientService = useRef(new ClientService()).current;
    const clientInterestService = useRef(new ClientInterestService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const ownerId = useRef("leon").current;

    const closeHandler = async ({stockCode, side, notes}) =>
    {
        side = side.toUpperCase();
        await clientInterestService.addNewClientInterest({ownerId, side, stockCode, notes, selectedClient});
    }

    useEffect( () =>
    {
        instrumentService.loadInstruments();
    }, []);

    return (<Grid container direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
            <Resizable defaultSize={{ width: '17%', height: '100%' }}>
                <ClientListComponent loggerService={loggerService}/>
            </Resizable>
            <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
            <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                <ClientInterestsComponent loggerService={loggerService}/>
                <ClientInterestDialogComponent closeHandler={closeHandler} instrumentService={instrumentService}/>
            </Grid>
        </Grid>
    </Grid>);
}
