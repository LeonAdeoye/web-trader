import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React, { useEffect, useState, useRef, useMemo } from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import { ServiceRegistry } from '../services/ServiceRegistry';
import { LoggerService } from '../services/LoggerService';
import {Divider, Grid} from "@mui/material";
import {Resizable} from "re-resizable";
import {NewsSymbolsComponent} from "../components/NewsSymbolsComponent";
import {NewsArticlesComponent} from "../components/NewsArticlesComponent";
import {useRecoilState} from "recoil";
import {newsSymbolChangedState} from "../atoms/component-state";

export const NewsApp = () =>
{
    const [symbolsWithNews, setSymbolsWithNews] = useState([]);
    const newsService = useRef(ServiceRegistry.getNewsService()).current;
    const loggerService = useRef(new LoggerService(NewsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("News"), []);
    const [, setNewsSymbolChanged] = useRecoilState(newsSymbolChangedState);
    const gridApiRef = useRef();

    useEffect(() =>
    {
        const loadSymbols = async () =>
        {
            try
            {
                await newsService.loadSymbolsWithNews();
                const symbols = newsService.getInstruments().map(ric => ({ ric }));
                loggerService.logInfo("Count of symbols loaded: " + symbols.length);
                setSymbolsWithNews(symbols);
                setNewsSymbolChanged(true);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load symbols: ${error.message}`);
            }
        };

        loadSymbols().then(() => loggerService.logInfo("Symbols with news loaded successfully."));
    }, [newsService]);

    useEffect(() =>
    {
        const api = gridApiRef.current?.api;
        if (api)
            api.refreshCells({ columns: ['actions'], force: true });
    }, []);

    return (
        <div>
            <TitleBarComponent
                title="News"
                windowId={windowId}
                addButtonProps={undefined}
                showChannel={false}
                showTools={false}/>

            <Grid container direction="column"
                  style={{margin: '45px 0px 0px 0px', height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
                <Grid container direction="row" style={{flexGrow: 1, overflow: 'hidden', height: '100%'}}>
                    <Resizable defaultSize={{width: '230px', height: '100%'}}>
                        <NewsSymbolsComponent symbolsWithNews={symbolsWithNews}/>
                    </Resizable>
                    <Divider orientation="vertical" style={{backgroundColor: '#404040', width: '1px'}}/>
                    <Grid item style={{flexGrow: 1, overflow: 'hidden'}}>
                        <NewsArticlesComponent newsService={newsService}/>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
};
