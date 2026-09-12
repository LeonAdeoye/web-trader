import React from 'react';
import {useEffect, useState, useMemo, useRef} from "react";
import '../styles/css/main.css';
import { newsSymbolChangedState, selectedNewsSymbolState } from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {GenericGridComponent} from "./GenericGridComponent";
import {LoggerService} from "../services/LoggerService";

export const NewsArticlesComponent = ({newsService}) =>
{
    const [selectedSymbol] = useRecoilState(selectedNewsSymbolState);
    const [newsSymbolChanged] = useRecoilState(newsSymbolChangedState);
    const [articles, setArticles] = useState([]);
    const [, setOwnerId] = useState('');
    const loggerService = useRef(new LoggerService(NewsArticlesComponent.name)).current;

    const columnDefs = useMemo(() => ([
        {headerName: "Provider", field: "provider", width: 135 },
        {headerName: "Source", field: "source", width: 135 },
        {headerName: "Published On", field: "publishedAt", width: 135 },
        {headerName: "Title", field: "title", width: 355 },
        {headerName: "Summary", field: "summary", width: 555 }
    ]), []);

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());

        loadOwner();

    }, []);

    useEffect(() =>
    {
        loggerService.logInfo("Result: " + (!selectedSymbol || !newsSymbolChanged))
        if(!selectedSymbol || !newsSymbolChanged)
            return;

        newsService.loadArticlesForSymbol(selectedSymbol).then(() =>
        {
            loggerService.logInfo("Loading articles for symbol: " + selectedSymbol)
            setArticles(newsService.getArticles())
        })

    }, [selectedSymbol, newsSymbolChanged]);

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["ric"]} columnDefs={columnDefs} gridData={articles}/>
            </div>
        </div>
    );
}
