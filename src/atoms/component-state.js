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

const defaultAlertConfiguration =
    {
        alertConfigurationId: "",
        alertName: "",
        alertType: "",
        frequency: "",
        clientId: "",
        desk: "ALL",
        side: "N/A",
        market: "ALL",
        customizations: "",
        isActive: "true",
        advMin: "",
        advMax: "",
        notionalMin: "",
        notionalMax: "",
        notionalAndADV: false,
        notionalOrADV: false,
        messageTemplate: "Here is a dummy message template!",
        priority: "High",
        emailAddress: ""
    };

export const alertConfigurationState = atom({
    key: 'alertConfigurationState',
    default: defaultAlertConfiguration
});

export const algoErrorsState = atom({
    key: 'algoErrorsState',
    default: []
});







