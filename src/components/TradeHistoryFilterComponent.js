import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import { grey,red } from '@mui/material/colors';
import {useRecoilState} from "recoil";
import {filterDaysState} from "../atoms/filter-state";

const TradeHistoryFilterComponent = ({buySkew, sellSkew}) =>
{
    const [filterDays, setFilterDays] = useRecoilState(filterDaysState);
    const handleDayFilterChange = (event) => setFilterDays(event.target.value);

    return (
        <div>
            <FormControl>
                <RadioGroup className="filter-parent" row name="position" value={filterDays} onChange={handleDayFilterChange} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="filter-days">
                        <FormControlLabel value="1" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>Days: 1</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="5" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>5</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="10" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>10</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="30" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>30</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="60" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>60</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="90" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>90</Typography>}labelPlacement="start"/>
                        <FormControlLabel value="180" control={<Radio size="small" sx={{color: grey[100],'&.Mui-checked': { color: red[600] }}}/>} label={<Typography sx={{ fontSize: '12px' }}>180</Typography>}labelPlacement="start"/>
                    </div>
                    <div className="skews" style={{marginLeft: "80px"}}>
                        {sellSkew > 0 ? <Typography sx={{ fontSize: '12px'}}>Sell Skew {sellSkew.toFixed(2)}:1</Typography> : ""}
                        {buySkew > 0 ? <Typography sx={{ fontSize: '12px' }}>Buy Skew {buySkew.toFixed(2)}:1</Typography> : ""}
                    </div>
                </RadioGroup>
            </FormControl>
        </div>);
}

export default TradeHistoryFilterComponent;

