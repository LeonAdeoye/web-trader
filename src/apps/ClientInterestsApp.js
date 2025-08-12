import React, {useState, useRef, useEffect} from "react";
import {Grid, Divider} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import {ClientInterestService} from "../services/ClientInterestService";
import {InstrumentService} from "../services/InstrumentService";
import {useRecoilState} from "recoil";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import ClientInterestDialog from "../dialogs/ClientInterestDialog";
import '../styles/css/main.css';
import {Resizable} from "re-resizable";
import {clientInterestsChangedState, selectedClientState, titleBarContextShareColourState} from "../atoms/component-state";
import {ClientService} from "../services/ClientService";
import {ClientListComponent} from "../components/ClientListComponent";

export const ClientInterestsApp = () =>
{
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [selectedClient, setSelectedClient] = useRecoilState(selectedClientState);
    const [,setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const clientInterestService = useRef(new ClientInterestService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const clientService = useRef(new ClientService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;

    const [ownerId, setOwnerId] = useState('');
    const windowId = useRef(window.command.getWindowId("Client Interests")).current;
    const [listOfClients, setListOfClients] = useState([]);

    const closeHandler = async ({instrumentCode, side, notes, clientInterestId}) =>
    {
        setClientInterestsChanged(false);
        if(clientInterestId === null || clientInterestId === undefined || clientInterestId === '')
            await clientInterestService.addNewClientInterest({ownerId, side:side.toUpperCase(), instrumentCode, notes, clientId:selectedClient});
        else
            await clientInterestService.updateClientInterest({ownerId, side:side.toUpperCase(), instrumentCode, notes, clientInterestId, clientId:selectedClient});
        setClientInterestsChanged(true);
    }

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());

        loadOwner();

    }, []);

    useEffect( () =>
    {
        if(ownerId)
        {
            instrumentService.loadInstruments()
                .then(() => clientInterestService.loadClientInterests(ownerId)
                    .then(() => clientService.loadClients()
                        .then(() =>
                        {
                            const loadedClients = clientService.getClients();
                            if(loadedClients.length > 0)
                            {
                                setListOfClients(loadedClients);
                                setSelectedClient(loadedClients[0].clientId);
                                setClientInterestsChanged(true);
                            }
                        })));
        }

    }, [ownerId, instrumentService, clientInterestService, clientService, setListOfClients, setSelectedClient, setClientInterestsChanged]);

    window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
    {
        if(fdc3Message.type === "fdc3.context")
        {
            if(fdc3Message.contextShareColour)
                setTitleBarContextShareColour(fdc3Message.contextShareColour);

            if(fdc3Message.clients?.[0]?.id.name)
                setSelectedClient(clientService.getClientId(fdc3Message.clients[0].id.name));
        }
    });

    return (<>
        <TitleBarComponent title="Client Interests" windowId={windowId} showChannel={true} showTools={false}
           addButtonProps={{ handler: () => setClientInterestDialogOpen({open:true, clear: true}), tooltipText: "Add new client interest...", clearContent: true }} />
        <Grid container direction="column"
              style={{margin: '45px 0px 0px 0px', height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
            <Grid container direction="row" style={{flexGrow: 1, overflow: 'hidden', height: '100%'}}>
                <Resizable defaultSize={{width: '250px', height: '100%'}}>
                    <ClientListComponent listOfClients={listOfClients}/>
                </Resizable>
                <Divider orientation="vertical" style={{backgroundColor: '#404040', width: '1px'}}/>
                <Grid item style={{flexGrow: 1, overflow: 'hidden'}}>
                    <ClientInterestsComponent instrumentService={instrumentService} clientInterestService={clientInterestService} loggerService={loggerService}/>
                    <ClientInterestDialog closeHandler={closeHandler} instruments={instrumentService.getInstruments()}/>
                </Grid>
            </Grid>
        </Grid>
    </>);
}
