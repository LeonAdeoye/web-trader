import {atom} from "recoil";

export const configDialogDisplayState = atom({
    key: 'configDialogDisplayState',
    default: false,
});

/*export const loginDialogDisplayState = atom({
    key: 'loginDialogDisplayState',
    default: true,
});*/

export const selectedGenericGridRowState = atom({
    key: 'selectedGenericGridRowState',
    default: undefined,
});


