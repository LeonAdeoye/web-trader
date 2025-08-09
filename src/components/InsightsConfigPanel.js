import React from 'react';
import {
    Box,
    Grid,
    IconButton,
    Typography,
    Divider,
    FormControlLabel,
    Switch,
    RadioGroup,
    Radio,
    TextField,
    Button,
    Paper,
    Slider
} from '@mui/material';
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

export const InsightsConfigPanel = ({ isOpen, config, onChange, onClose, onApply }) => {
    return (
        <ThemeProvider theme={darkPanelTheme}>
            <Box
                role="complementary"
                aria-label="Insights configuration panel"
                sx={{
                    position: 'fixed',
                    top: '45px', // align below the fixed title bar
                    left: 0,
                    height: 'calc(100vh - 45px)',
                    width: 340,
                    bgcolor: '#404040',
                    color: 'white',
                    boxShadow: 8,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 250ms ease-in-out',
                    zIndex: 999, // under the title bar (which is 1000), above charts
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.2, py: 0.6 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Chart Settings</Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: 'white' }} aria-label="Close settings">
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                {/* Controls container - minimal padding/margin for compact UI */}
                <Box sx={{ px: 2.4, py: 1.2, overflow: 'auto' }}>{/* 20% more padding for readability; vertical still compact */}
                    <Grid container spacing={0.6}>{/* 20% spacing increase but still minimal */}
                        {/* Metric group */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.1 }}>
                                {/* Paper bg chosen to contrast with #404040; change here if desired */}
                                <Box sx={{ pl: 1.8 }}>
                                    <RadioGroup
                                        value={config.metric}
                                        onChange={(e) => onChange({ ...config, metric: e.target.value })}
                                        sx={{ '& .MuiFormControlLabel-root': { my: 0, py: 0, minHeight: 12 }, '& .MuiRadio-root': { p: 0 }, '& .MuiFormControlLabel-label': { lineHeight: 1 } }}
                                    >
                                        <FormControlLabel value="shares" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Shares</Typography>} />
                                        <FormControlLabel value="notionalUSD" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Notional (USD)</Typography>} />
                                        <FormControlLabel value="notionalLocal" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Notional (Local)</Typography>} />
                                    </RadioGroup>

                                    <FormControlLabel
                                        sx={{ my: 0, py: 0, minHeight: 20 }}
                                        control={
                                            <Switch
                                                size="small"
                                                checked={config.showWorkingTotals}
                                                onChange={(e) => onChange({ ...config, showWorkingTotals: e.target.checked })}
                                            />
                                        }
                                        label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Show working totals only</Typography>}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Date range group */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.1 }}>
                                {/* Paper bg chosen to contrast with #404040; change here if desired */}
                                <RadioGroup
                                    value={config.dateMode}
                                    onChange={(e) => onChange({ ...config, dateMode: e.target.value })}
                                    sx={{ '& .MuiFormControlLabel-root': { my: 0, py: 0, minHeight: 12, pl: 1.8 }, '& .MuiRadio-root': { p: 0 }, '& .MuiFormControlLabel-label': { lineHeight: 1 }, mb: 0 }}
                                >
                                    <FormControlLabel value="today" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Today</Typography>} />
                                    <FormControlLabel value="range" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Date range ( {config.dateRangeDays} days prior )</Typography>} />
                                </RadioGroup>

                                <Box sx={{ px: 1.8, pt: 0, pb: 0.6 }}>
                                    <Slider
                                        size="small"
                                        value={config.dateRangeDays}
                                        step={null}
                                        marks={[
                                            { value: 5, label: '5' },
                                            { value: 10, label: '10' },
                                            { value: 20, label: '20' },
                                            { value: 30, label: '30' },
                                            { value: 60, label: '60' }
                                        ]}
                                        min={5}
                                        max={60}
                                        onChange={(_, v) => onChange({ ...config, dateRangeDays: v })}
                                        disabled={config.dateMode !== 'range'}
                                        sx={{ height: 6, my: 0, '& .MuiSlider-markLabel': { fontSize: '0.68rem' }, '& .MuiSlider-markLabelActive': { fontSize: '0.68rem' } }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Colours group */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.1 }}>
                                {/* Paper bg chosen to contrast with #404040; change here if desired */}
                                <Grid container spacing={0.6}
                                      alignItems="center" sx={{ px: 1.8 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Order Buy colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.orderBuyColor}
                                            onChange={(e) => onChange({ ...config, orderBuyColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Order Sell colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.orderSellColor}
                                            onChange={(e) => onChange({ ...config, orderSellColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Executed Buy colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.executedBuyColor}
                                            onChange={(e) => onChange({ ...config, executedBuyColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Executed Sell colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.executedSellColor}
                                            onChange={(e) => onChange({ ...config, executedSellColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Working Buy colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.workingBuyColor}
                                            onChange={(e) => onChange({ ...config, workingBuyColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Working Sell colour</Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="color"
                                            value={config.workingSellColor}
                                            onChange={(e) => onChange({ ...config, workingSellColor: e.target.value })}
                                            inputProps={{ style: { padding: 0, height: 22 } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mt: 'auto', borderColor: 'rgba(255,255,255,0.12)' }} />

                            {/* Footer actions - minimal padding/margin */}
            <Box sx={{ display: 'flex', gap: 1.2, p: 1.2, justifyContent: 'flex-end' }}>{/* 20% more padding; still compact */}
                <Button size="small" variant="contained" onClick={onApply} sx={{ backgroundColor: '#ffffff', color: '#404040', textTransform: 'none', '&:hover': { backgroundColor: '#bdbdbd' } }}>Apply</Button>
            </Box>
            </Box>
        </ThemeProvider>
    );
};

export default InsightsConfigPanel; 