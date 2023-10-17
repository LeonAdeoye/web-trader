import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";

export const AlertConfigurationsDialogStageFiveComponent = ({handleInputChange}) =>
{
    const [alertConfiguration, setAlertConfiguration] = useRecoilState(alertConfigurationState);
    return(<span>Hello</span>);
}
