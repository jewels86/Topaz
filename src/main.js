const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const dir = path.dirname(app.getPath('exe'))

function createSelectorWindow() {
    global = { win: null, dir: dir }
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000'
        }
    })
    win.maximizable = false
    win.resizable = false

    ipcMain.on('setTitleBarColor', (event, color) => { win.setTitleBarOverlay({ color }) })
    ipcMain.handle('getDirectory', () => dir)
    ipcMain.handle('exists', (event, path) => fs.existsSync(path))
    ipcMain.handle('write', (event, path, data) => { console.log(path); return fs.writeFileSync(path, data) })
    ipcMain.handle('read', (event, path) => fs.readFileSync(path, 'utf8'))
    ipcMain.handle('tryCreateDir', (event, path) => fs.mkdirSync(path, { recursive: true }))

    ipcMain.handle('openIndex', () => createIndexWindow())

    win.loadFile('pages/selector.html')
    global.win = win
}

function createIndexWindow() {
    global.win.close()

    const indexWin = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    indexWin.maximized = true

    indexWin.loadFile('pages/index.html')
}

app.whenReady().then(createSelectorWindow)