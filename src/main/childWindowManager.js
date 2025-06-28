const childWindowIdMap = new Map();

const setChildWindowIdMap = (windowId, mainWindow) =>
{
    childWindowIdMap.set(windowId, mainWindow);
}

const getChildWindowById = (windowId) =>
{
    return childWindowIdMap.get(windowId);
}

const clearChildWindowIdMap = () =>
{
    childWindowIdMap.clear();
}

module.exports = {
    setChildWindowIdMap,
    getChildWindowById,
    clearChildWindowIdMap
}


