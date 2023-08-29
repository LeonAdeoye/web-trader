import {atom} from "recoil";

export const configDialogDisplayState = atom({
    key: 'configDialogDisplayState',
    default: false,
});

export const selectedGenericGridRowState = atom({
    key: 'selectedGenericGridRowState',
    default: undefined,
});

