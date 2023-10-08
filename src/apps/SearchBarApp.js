import * as React from 'react';
import '../styles/css/main.css';
import {FDC3Service} from "../services/FDC3Service";
import TextField from "@mui/material/TextField";

export const SearchBarApp = () =>
{
    const handleClientSearchChange = () =>
    {

    }

    const handleStockCodeSearchChange = () =>
    {

    }

    return (<div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
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
    </div>);

}
