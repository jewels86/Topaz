const { app, BrowserWindow } = require('electron')

const defaults = {
    width: 1000,
    height: 600
}

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: defaults.width,
        height: defaults.height
    })
    win.loadFile('./pages/test.html')
    win.maximize();

    app.on('window-all-closed', () => {
        app.quit();
    })
})

