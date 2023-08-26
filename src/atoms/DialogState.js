import {atom} from "recoil";

export const addConfigDialogDisplayState = atom({
    key: 'addConfigDialogDisplayState',
    default: false,
});

export const selectedGenericGridRowState = atom({
    key: 'selectedGenericGridRowState',
    default: undefined,
});
