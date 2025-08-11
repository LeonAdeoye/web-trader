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

export const sliceDialogDisplayState = atom({
    key: 'sliceDialogDisplayState',
    default: false
});

export const tradeHistoryDialogDisplayState = atom({
    key: 'tradeHistoryDialogDisplayState',
    default: true
});

export const referenceDataDialogDisplayState = atom({
    key: 'referenceDataDialogDisplayState',
    default: false
});

export const clientInterestDialogDisplayState = atom({
    key: 'clientInterestDialogDisplayState',
    default: {open: false, clear: true}
});

export const alertDialogDisplayState = atom({
    key: 'alertDialogDisplayState',
    default: false
});

export const alertConfigurationsDialogDisplayState = atom({
    key: 'alertConfigurationsDialogDisplayState',
    default: false
});

export const alertConfigurationsDialogMessageTemplateState = atom({
    key: 'alertConfigurationsDialogMessageTemplateState',
    default: ''
});
