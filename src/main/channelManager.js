const channelsWindowMap = new Map();

const initializeChannels = () => {
    channelsWindowMap.set('red', []);
    channelsWindowMap.set('blue', []);
    channelsWindowMap.set('green', []);
    channelsWindowMap.set('yellow', []);
    console.log('Channels initialized');
};

const addWindowToChannel = (channel, windowTitle) =>
{
    channelsWindowMap.get(channel).push(windowTitle);
    console.log("Added window: " + windowTitle + " to " + channel + " channel. Current window(s) in " + channel + " channel: [" + channelsWindowMap.get(channel) + "]");
};

const removeWindowFromChannel = (windowTitle) =>
{
    channelsWindowMap.forEach((value) =>
    {
        const index = value.indexOf(windowTitle);
        if (index > -1) {
            console.log("Removing window: " + windowTitle + " from all channels");
            value.splice(index, 1);
        }
    });
    channelsWindowMap.forEach((value, key) => value.length > 0 && console.log("Window(s) remaining in " + key + " channel: " + value));
};

const getChannelWindows = (channel) =>
{
    return channelsWindowMap.get(channel) || [];
};

const getAllChannels = () =>
{
    return Array.from(channelsWindowMap.keys());
};

const getChannelWindowMap = () => channelsWindowMap;

module.exports = {
    initializeChannels,
    addWindowToChannel,
    removeWindowFromChannel,
    getChannelWindows,
    getAllChannels,
    getChannelWindowMap
}; 
