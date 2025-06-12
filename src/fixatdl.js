export const parseFIXATDL = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const strategy = xmlDoc.getElementsByTagName("Strategy")[0];
    const strategyName = strategy.getAttribute("name");

    // Extract parameters
    const parameters = [...strategy.getElementsByTagName("Parameter")].map(param => ({
        name: param.getAttribute("name"),
        type: param.getAttribute("xsi:type"),
        fixTag: param.getAttribute("fixTag"),
        use: param.getAttribute("use"),
        minValue: param.getAttribute("minValue") || null,
        maxValue: param.getAttribute("maxValue") || null,
        enumPairs: [...param.getElementsByTagName("EnumPair")].map(enumPair => ({
            enumID: enumPair.getAttribute("enumID"),
            wireValue: enumPair.getAttribute("wireValue")
        }))
    }));

    // Extract validation rules
    const validationRules = [...strategy.getElementsByTagName("StrategyEdit")].map(editRule => ({
        errorMessage: editRule.getAttribute("errorMessage"),
        conditions: [...editRule.getElementsByTagName("Edit")].map(edit => ({
            field: edit.getAttribute("field"),
            operator: edit.getAttribute("operator"),
            value: edit.getAttribute("value") || null,
            field2: edit.getAttribute("field2") || null
        }))
    }));

    // Extract strategy layout controls
    const layoutPanel = strategy.getElementsByTagName("lay:StrategyPanel")[0];
    const controls = layoutPanel
        ? [...layoutPanel.getElementsByTagName("lay:Control")].map(control => ({
            id: control.getAttribute("ID"),
            type: control.getAttribute("xsi:type"),
            label: control.getAttribute("label"), // Extract label attribute for UI
            parameterRef: control.getAttribute("parameterRef"),
            listItems: [...control.getElementsByTagName("lay:ListItem")].map(item => ({
                enumID: item.getAttribute("enumID"),
                uiRep: item.getAttribute("uiRep")
            }))
        }))
        : [];

    return { strategyName, parameters, validationRules, controls };
};

export const extractStrategyName = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const strategy = xmlDoc.getElementsByTagName("Strategy")[0];
    return strategy?.getAttribute("name") || null; // Returns the strategy name or null if missing
};

