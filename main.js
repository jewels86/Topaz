const { app, browserWindow, BrowserWindow } = require('electron')

const defaults = {
    width: 800,
    height: 600
}

function load(page, options) {
    const win = new BrowserWindow({
        width: options.width ? options.width : defaults.width,
        height: options.height ? options.width : defaults.height
    })
    win.loadFile(`./pages/${page}`);
}