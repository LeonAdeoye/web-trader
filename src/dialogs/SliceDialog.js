import React, {useCallback} from 'react';
import {useRecoilState} from "recoil";
import {sliceDialogDisplayState} from "../atoms/dialog-state";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, Typography} from "@mui/material";
import {selectedGenericGridRowState} from "../atoms/component-state";

const SliceDialog = () =>
{
    const [sliceDialogOpenFlag, setSliceDialogOpenFlag ] = useRecoilState(sliceDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const handleCancel = () =>
    {
        setSliceDialogOpenFlag(false);
    };

    const dialogStyles =
    {
        width: '800px',
        height: `400px`,
        resize: 'both',
        overflow: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        paddingBottom: '5px'
    };

    return(
        <Dialog aria-labelledby='dialog-title' open={sliceDialogOpenFlag} onClose={handleCancel} PaperProps={{ style: dialogStyles }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Slice Parent Order</DialogTitle>
            <DialogContent>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Cancel and close.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" variant='contained' onClick={() => setSliceDialogOpenFlag(false)}>Cancel</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default SliceDialog;
