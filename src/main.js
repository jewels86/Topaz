const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const dir = path.dirname(app.getPath('exe'))
var global = { 
    selectorWin: null, dir: dir,
    workspace: null, profile: null 
}

function createSelectorWindow() {
    const selectorWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000'
        },
    })
    selectorWin.maximizable = false
    selectorWin.resizable = false

    ipcMain.on('setTitleBarColor', (event, color) => { selectorWin.setTitleBarOverlay({ color }) })
    ipcMain.handle('getDirectory', () => dir)
    ipcMain.handle('exists', (event, path) => fs.existsSync(path))
    ipcMain.handle('write', (event, path, data) => { console.log(path); return fs.writeFileSync(path, data) })
    ipcMain.handle('read', (event, path) => fs.readFileSync(path, 'utf8'))
    ipcMain.handle('tryCreateDir', (event, path) => fs.mkdirSync(path, { recursive: true }))
    ipcMain.handle('isAbsolute', (event, _path) => path.isAbsolute(_path))
    ipcMain.handle('pathJoin', (event, ...paths) => path.join(...paths))
    ipcMain.handle('workspace', () => global.workspace)
    ipcMain.handle('profile', () => global.profile)
    ipcMain.handle('setWorkspace', (event, workspace) => global.workspace = workspace)
    ipcMain.handle('setProfile', (event, profile) => global.profile = profile)
    ipcMain.handle('openIndex', (ev, workspace) => createIndexWindow(workspace))

    selectorWin.loadFile('pages/selector.html')

    global.selectorWin = selectorWin
}

function createIndexWindow(workspace) {
    global.selectorWin.close()
    global.workspace = workspace
    console.log(workspace)

    const indexWin = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false,
    })
    indexWin.maximize()

    indexWin.loadFile('pages/index.html')
    indexWin.once('ready-to-show', () => indexWin.show())
    global.indexWin = indexWin
}

app.whenReady().then(createSelectorWindow)