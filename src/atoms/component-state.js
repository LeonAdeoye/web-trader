import {atom} from "recoil";

export const configDialogDisplayState = atom({
    key: 'configDialogDisplayState',
    default: false
});

export const selectedGenericGridRowState = atom({
    key: 'selectedGenericGridRowState',
    default: undefined
});

export const selectedContextShareState = atom({
    key: 'selectedContextShareState',
    default: []
});

export const selectedBasketState = atom({
    key: 'selectedBasketState',
    default: ''
});

export const selectedClientState = atom({
    key: 'selectedClientState',
    default: ''
});



