import {atom} from "recoil";

export const configDialogDisplayState = atom({
    key: 'configDialogDisplayState',
    default: false
});

export const blastPlayDialogDisplayState = atom({
    key: 'blastPlayDialogDisplayState',
    default: false
});

export const blastConfigurationDialogDisplayState = atom({
    key: 'blastConfigurationDialogDisplayState',
    default: false
});

export const clientInterestDialogDisplayState = atom({
    key: 'clientInterestDialogDisplayState',
    default: false
});

export const alertDialogDisplayState = atom({
    key: 'alertDialogDisplayState',
    default: false
});
