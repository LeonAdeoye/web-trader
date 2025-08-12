import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';

const DeleteConfirmationDialog = ({open, onClose, onConfirm, dataToDelete, selectedTab, getDataName, getItemDisplayName}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="delete-confirmation-dialog-title"
            maxWidth={false}
            fullWidth={false}
            PaperProps={{
                style: {
                    width: '308px',
                    maxWidth: '308px'
                }
            }}
        >
                         <DialogTitle 
                 id="delete-confirmation-dialog-title"
                 style={{
                     fontSize: 16, 
                     backgroundColor: '#8B0000', 
                     color: 'white', 
                     padding: '16px 20px',
                     margin: 0
                 }}
             >
                Confirm Delete
            </DialogTitle>
                        <DialogContent style={{padding: '20px'}}>
                <div style={{fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'Arial, sans-serif'}}>
                    Are you sure you want to delete this {getDataName(selectedTab).toLowerCase()}?
                    {dataToDelete && (
                        <>
                            <br /><br />
                            <strong>Item to delete:</strong>
                            <br />
                            <span style={{color: '#666'}}>
                                {getItemDisplayName(dataToDelete, selectedTab)}
                            </span>
                        </>
                    )}
                    <br /><br />
                    <strong style={{color: '#8B0000'}}>⚠️ This action cannot be undone.</strong>
                </div>
            </DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    className="dialog-action-button submit"
                    color="primary"
                    style={{
                        marginRight: '0px',
                        marginLeft: '0px',
                        fontSize: '0.75rem'
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained"
                    className="dialog-action-button submit"
                    color="primary"
                    style={{
                        marginRight: '0px',
                        marginLeft: '10px',
                        fontSize: '0.75rem'
                    }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;
