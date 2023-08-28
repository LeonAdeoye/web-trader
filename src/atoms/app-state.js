import {atom} from "recoil";

export const selectedSymbolState = atom({
    key: 'selectedSymbolState',
    default: null,
});

export const loggedInUserState = atom({
    key: 'loggedInUserState',
    default: '',
});
