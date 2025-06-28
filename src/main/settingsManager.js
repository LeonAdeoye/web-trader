const settings = require('electron-settings');

settings.configure({
    atomicSave: true,
    fileName: 'settings.json',
    numSpaces: 2,
    prettify: false
});

console.log("settings file path: " + settings.file());

const saveWindowDimensions = async (window) => {
    const [x, y] = window.getPosition();
    const [w, h] = window.getSize();
    const title = window.getTitle();

    await settings.set(title, { x: x, y: y, h: h, w: w })
        .then(() => console.log(`Saving last window position and size of ${title} app: (${x},${y}) (${w},${h})`))
        .catch((err) => console.log(`Error saving child window position and size because of ${err}`));
};

const loadWindowDimensions = async (window) => {
    await settings.get(window.getTitle())
        .then((dimensions) => {
            if (dimensions === undefined) return;

            const { x, y, h, w } = dimensions;

            if (x !== undefined && y !== undefined)
                window.setPosition(x, y);

            if (w !== undefined && h !== undefined)
                window.setSize(w, h);
        })
        .catch((err) => console.log("Error loading window position: " + err));
};

module.exports = {
    saveWindowDimensions,
    loadWindowDimensions,
}; 
