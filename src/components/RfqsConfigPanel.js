import React from 'react';
import { Box, Grid, IconButton, Typography, Divider, TextField, Button, Paper } from '@mui/material';
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

export const RfqsConfigPanel = ({ isOpen, config, onChange, onClose, onApply }) =>
{
    return (
        <ThemeProvider theme={darkPanelTheme}>
            <Box
                className="rfqs-config-panel"
                role="complementary"
                aria-label="RFQ configuration panel"
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
                    <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>RFQ Settings</Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: 'white' }} aria-label="Close settings">
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                <Box sx={{ px: 2, py: 1, overflow: 'auto' }}>
                    <Grid container spacing={0.6}>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.68rem', opacity: 0.85, display: 'block', mb: 0.6 }}>Settlement Defaults</Typography>
                                <Box sx={{ px: 1.8 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Settlement Currency</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            value={config.defaultSettlementCurrency}
                                            onChange={(e) => onChange({ ...config, defaultSettlementCurrency: e.target.value })}
                                            inputProps={{ style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Settlement Days</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.defaultSettlementDays}
                                            onChange={(e) => onChange({ ...config, defaultSettlementDays: parseInt(e.target.value) || 2 })}
                                            inputProps={{ min: 0, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.68rem', opacity: 0.85, display: 'block', mb: 0.6 }}>Trading Defaults</Typography>
                                <Box sx={{ px: 1.8 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Spread</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.defaultSpread}
                                            onChange={(e) => onChange({ ...config, defaultSpread: parseFloat(e.target.value) || 1 })}
                                            inputProps={{ min: 0, step: 0.1, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Sales Credit %</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.defaultSalesCreditPercentage}
                                            onChange={(e) => onChange({ ...config, defaultSalesCreditPercentage: parseFloat(e.target.value) || 0.5 })}
                                            inputProps={{ min: 0, max: 100, step: 0.1, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.68rem', opacity: 0.85, display: 'block', mb: 0.6 }}>Risk Parameters</Typography>
                                <Box sx={{ px: 1.8 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Volatility %</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.defaultVolatility}
                                            onChange={(e) => onChange({ ...config, defaultVolatility: parseFloat(e.target.value) || 20 })}
                                            inputProps={{ min: 0, max: 100, step: 0.1, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Default Day Convention</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.defaultDayConvention}
                                            onChange={(e) => onChange({ ...config, defaultDayConvention: parseInt(e.target.value) || 250 })}
                                            inputProps={{ min: 1, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ backgroundColor: '#2f2f2f', borderColor: 'rgba(255,255,255,0.12)', p: 1.2, mb: 0.05 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.68rem', opacity: 0.85, display: 'block', mb: 0.6 }}>Display Settings</Typography>
                                <Box sx={{ px: 1.8 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.68rem' }}>Decimal Precision</Typography>
                                        <TextField 
                                            size="small" 
                                            fullWidth 
                                            type="number"
                                            value={config.decimalPrecision}
                                            onChange={(e) => onChange({ ...config, decimalPrecision: parseInt(e.target.value) || 3 })}
                                            inputProps={{ min: 0, max: 10, style: { padding: '0 4px', height: 16, fontSize: '0.6rem' } }}
                                            sx={{ 
                                                '& .MuiInputBase-input': { fontSize: '0.6rem', lineHeight: '16px', padding: '0 4px', height: 16 }, 
                                                '& .MuiOutlinedInput-root': { height: 18, borderRadius: 1 } 
                                            }}/>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mt: 'auto', borderColor: 'rgba(255,255,255,0.12)' }} />

                <Box sx={{ display: 'flex', p: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="contained" onClick={onApply} sx={{ backgroundColor: '#ffffff', color: '#404040', textTransform: 'none', '&:hover': { backgroundColor: '#bdbdbd' } }}>Apply</Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default RfqsConfigPanel;
