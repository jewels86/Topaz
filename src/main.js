const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const dir = path.dirname(app.getPath('exe'))

function createSelectorWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            resizable: false,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000'
        }
    })

    ipcMain.on('setTitleBarColor', (event, color) => { win.setTitleBarOverlay({ color }) })
    ipcMain.handle('getDirectory', () => dir)
    ipcMain.handle('exists', (event, path) => fs.existsSync(path))
    ipcMain.handle('write', (event, path, data) => fs.writeFileSync(path, data))
    ipcMain.handle('read', (event, path) => fs.readFileSync(path, 'utf8'))

    win.loadFile('pages/selector.html')
}

app.whenReady().then(createSelectorWindow)