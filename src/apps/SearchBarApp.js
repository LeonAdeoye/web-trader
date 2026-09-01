import * as React from 'react';
import {useMemo} from "react";
import '../styles/css/main.css';
import TextField from "@mui/material/TextField";
import TitleBarComponent from "../components/TitleBarComponent";

export const SearchBarApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Search Bar"), []);

    const handleClientSearchChange = () =>
    {
    }

    const handleStockCodeSearchChange = () =>
    {
    }

    return (
        <>
            <TitleBarComponent title="Search Bar" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: 'calc(100vh - 65px)', margin: '45px 0px 0px 0px', padding: '10px' }}>
                <TextField
                    size='small' className='search-text'
                    label="Search by StockCode."
                    onChange={handleStockCodeSearchChange}
                    InputProps={{ style: { fontSize: '15px' } }}
                    style={{ height: '30px', boxSizing: 'border-box', marginBottom: '3px', marginTop: '5px', marginRight: '6px'}}/>
                <TextField
                    size='small' className='search-text'
                    label="Search by client."
                    onChange={handleClientSearchChange}
                    InputProps={{ style: { fontSize: '15px' } }}
                    style={{ height: '30px', boxSizing: 'border-box', marginBottom: '3px', marginTop: '5px', marginRight: '6px'}}/>
            </div>
        </>
    );
}
