export const parseFIXATDL = (xmlString) =>
{
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const strategy = xmlDoc.getElementsByTagName("Strategy")[0];
    const strategyName = strategy.getAttribute("name");

    // Extract parameters
    const parameters = [...strategy.getElementsByTagName("Parameter")].map(param =>
        ({
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
    const validationRules = [...strategy.getElementsByTagName("StrategyEdit")].map(editRule =>
    {
        const errorMessage = editRule.getAttribute("errorMessage");
        const editConditions = [...editRule.getElementsByTagName("Edit")].map(edit => ({
            field: edit.getAttribute("field"),
            operator: edit.getAttribute("operator"),
            value: edit.getAttribute("value") || null,
            field2: edit.getAttribute("field2") || null
        }));

        return { errorMessage, conditions: editConditions };
    });

    return { strategyName, parameters, validationRules };
}
