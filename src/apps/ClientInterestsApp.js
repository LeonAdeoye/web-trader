import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useEffect, useRef, useState, useMemo} from "react";
import {useRecoilState} from "recoil";
import ClientInterestDialogComponent from "../components/ClientInterestDialogComponent";
import {InstrumentService} from "../services/InstrumentService";
import {ClientInterestService} from "../services/ClientInterestService";
import {selectedClientState, selectedContextShareState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {FDC3Service} from "../services/FDC3Service";

export const ClientInterestsApp = () =>
{
    const [selectedClient] = useRecoilState(selectedClientState);
    const [, setContextShareClient] = useState("schroders");
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const clientInterestService = useRef(new ClientInterestService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const ownerId = useRef("leon").current;
    const windowId = useMemo(() => window.command.getWindowId("client-interest"), []);

    const closeHandler = async ({stockCode, side, notes}) =>
    {
        await clientInterestService.addNewClientInterest({ownerId, side:side.toUpperCase(), stockCode, notes, clientId:selectedClient});
    }

    useEffect( () =>
    {
        instrumentService.loadInstruments().then(() => clientInterestService.loadClientInterests(ownerId));
    }, []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.context")
            {
                if(fdc3Message.clients.length > 0 && fdc3Message.clients[0].id.name)
                {
                    console.log(fdc3Message.clients[0].id.name);
                    setContextShareClient(fdc3Message.clients[0].id.name);
                }
                else
                    setContextShareClient(null);
            }
        });
    }, []);

    useEffect(() =>
    {
        if(selectedContextShare.length === 1)
        {
            if(selectedContextShare[0].contextShareKey === 'stockCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length === 2)
        {
            const stockCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'stockCode').contextShareValue;
            const client = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'client').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, client), null, windowId);
        }
    }, [selectedContextShare]);

    return (
        <>
            <TitleBarComponent title="Client Interests" windowId={windowId} addButtonProps={{
                handler:  () => setClientInterestDialogOpen(true),
                tooltipText: "Add new client interest..."
            }} showChannel={true} showTools={false}/>
            <Grid container direction="column" style={{ margin:'45px 0px 0px 0px', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
                <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                    <Resizable defaultSize={{ width: '17%', height: '100%' }}>
                        <ClientListComponent loggerService={loggerService}/>
                    </Resizable>
                    <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
                    <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <ClientInterestsComponent instrumentService={instrumentService} clientInterestService={clientInterestService}/>
                        <ClientInterestDialogComponent closeHandler={closeHandler} instrumentService={instrumentService}/>
                    </Grid>
                </Grid>
            </Grid>
        </>);
}
