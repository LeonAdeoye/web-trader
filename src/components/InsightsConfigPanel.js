import React, {useState, useEffect} from 'react';
import { Box, Grid, IconButton, Typography, Divider, FormControlLabel, Switch, RadioGroup, Radio, TextField, Button, Paper, Slider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const darkPanelTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            paper: '#2f2f2f'
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255,255,255,0.7)'
        }
    },
    typography: {
        fontSize: 12,
        caption: { fontSize: '0.72rem' }
    }
});

export const InsightsConfigPanel = ({ isOpen, config, onClose, onApply }) =>
{
    const [tempConfig, setTempConfig] = useState(config);
    useEffect(() =>
    {
        setTempConfig(config);
    }, [config]);

    const handleInputChange = (field, value) => setTempConfig(prev => ({ ...prev, [field]: value }));
    const handleApply = () => onApply(tempConfig);
    const handleClose = () =>
    {
        setTempConfig(config);
        onClose();
    };

    return (
        <ThemeProvider theme={darkPanelTheme}>
            <Box
                role="complementary"
                aria-label="Insights configuration panel"
                sx={{
                    position: 'fixed',
                    top: '45px',
                    left: 0,
                    height: 'calc(100vh - 45px)',
                    width: 340,
                    bgcolor: '#404040',
                    color: 'white',
                    boxShadow: 8,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 250ms ease-in-out',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.2, py: 0.6 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Chart Settings</Typography>
                    <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }} aria-label="Close settings">
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                <Box sx={{ px: 2, py: 1, overflow: 'auto' }}>
                    <Grid container spacing={0.6}>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Box sx={{ pl: 1.8 }}>
                                    <RadioGroup value={tempConfig.metric}
                                        onChange={(e) => handleInputChange('metric', e.target.value)}
                                        sx={{ '& .MuiFormControlLabel-root': { my: 0, py: 0, minHeight: 12 }, '& .MuiRadio-root': { p: 0 }, '& .MuiFormControlLabel-label': { lineHeight: 1 } }}>
                                        <FormControlLabel value="shares" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Shares</Typography>} />
                                        <FormControlLabel value="notionalUSD" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Notional (USD)</Typography>} />
                                        <FormControlLabel value="notionalLocal" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Notional (Local)</Typography>} />
                                    </RadioGroup>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 0.6 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>Max bars</Typography>
                                        <TextField size="small" type="number" value={tempConfig.maxBars ?? 5}
                                                   onChange={(e) => {
                                                       const raw = e.target.value;
                                                       const num = Math.max(1, Number(raw) || 1);
                                                       handleInputChange('maxBars', num);
                                                   }}
                                                   inputProps={{ min: 1, style: { padding: '0 4px', height: 16 } }}
                                                   sx={{ width: 60, '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', textAlign: 'center', padding: '0 4px', height: 16 }, '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } }} />
                                    </Box>

                                    <FormControlLabel
                                        sx={{ my: 0, py: 0, minHeight: 20 }}
                                        control={
                                            <Switch size="small" checked={tempConfig.showWorkingTotals}
                                                onChange={(e) => handleInputChange('showWorkingTotals', e.target.checked)} />
                                        }
                                        label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Show working totals only</Typography>}/>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <RadioGroup value={tempConfig.dateMode} onChange={(e) => handleInputChange('dateMode', e.target.value)}
                                    sx={{ '& .MuiFormControlLabel-root': { my: 0, py: 0, minHeight: 12, pl: 1.8 }, '& .MuiRadio-root': { p: 0 }, '& .MuiFormControlLabel-label': { lineHeight: 1 }, mb: 0 }}>
                                    <FormControlLabel value="today" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Today</Typography>} />
                                    <FormControlLabel value="range" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Date range ( {tempConfig.dateRangeDays} days prior )</Typography>} />
                                </RadioGroup>
                                <Box sx={{ px: 1.8, pt: 0, pb: 0.6 }}>
                                    <Slider size="small" value={tempConfig.dateRangeDays} step={null}
                                        marks={[
                                            { value: 5, label: '5' },
                                            { value: 10, label: '10' },
                                            { value: 20, label: '20' },
                                            { value: 30, label: '30' },
                                            { value: 60, label: '60' }
                                        ]}
                                        min={5} max={60} disabled={tempConfig.dateMode !== 'range'}
                                        onChange={(_, v) => handleInputChange('dateRangeDays', v)}
                                        sx={{ height: 6, my: 0, '& .MuiSlider-markLabel': { fontSize: '0.68rem' }, '& .MuiSlider-markLabelActive': { fontSize: '0.68rem' } }}/>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Grid container spacing={0.6}
                                      alignItems="center" sx={{ px: 1.8 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Order Buy colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.orderBuyColor}
                                            onChange={(e) => handleInputChange('orderBuyColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Order Sell colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.orderSellColor}
                                            onChange={(e) => handleInputChange('orderSellColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Executed Buy colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.executedBuyColor}
                                            onChange={(e) => handleInputChange('executedBuyColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Executed Sell colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.executedSellColor}
                                            onChange={(e) => handleInputChange('executedSellColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Working Buy colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.workingBuyColor}
                                            onChange={(e) => handleInputChange('workingBuyColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Working Sell colour</Typography>
                                        <TextField size="small" fullWidth type="color" value={tempConfig.workingSellColor}
                                            onChange={(e) => handleInputChange('workingSellColor', e.target.value)}
                                            inputProps={{ style: { padding: 0, height: 22 } }} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mt: 'auto', borderColor: 'rgba(255,255,255,0.12)' }} />

            <Box sx={{ display: 'flex', p: 1, justifyContent: 'flex-end' }}>
                <Button size="small" variant="contained" onClick={handleApply} sx={{ backgroundColor: '#ffffff', color: '#404040', textTransform: 'none', '&:hover': { backgroundColor: '#bdbdbd' } }}>Apply</Button>
            </Box>
            </Box>
        </ThemeProvider>
    );
};

export default InsightsConfigPanel; 
