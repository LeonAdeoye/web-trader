import {atom} from "recoil";

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

export const clientInterestsChangedState = atom({
    key: 'clientInterestsChangedState',
    default: false
});

export const titleBarContextShareColourState = atom({
    key: 'titleBarContextShareColourState',
    default: "white"
});





