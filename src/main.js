const { app, BrowserWindow, ipcMain, Menu } = require("electron")
const path = require('node:path')
const fn = require('./functions.js')
let win;
let settingsWindow;
let widgetWindow;

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.handle('write', (ev, args) => fn.write(args[0], args[1]))
    ipcMain.handle('read', (ev, args) => fn.read(args[0], args[1]))
    ipcMain.handle('exists', (ev, args) => fn.exists(args[0]))
    ipcMain.handle('mkdir', (ev, args) => fn.mkdir(args[0]))
    ipcMain.handle('getSD', (ev, args) => fn.getSecureData(args[0]))
    ipcMain.handle('setSD', (ev, args) => fn.setSecureData(args[0], args[1]))

    ipcMain.handle('show', (ev, args) => win.show())

    ipcMain.on('open-settings', () => openSettings())
    ipcMain.on('open-new-widget', () => openNewWidget())

    win.loadFile('pages/index.html')
    win.once('ready-to-show', () => { win.show(); win.maximize(); win.focus() })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    win.on('close', (ev) => {
        ev.preventDefault()
        win.hide()
        if (settingsWindow != undefined) { 
            if (!settingsWindow.isDestroyed()) settingsWindow.close() 
        }
        if (widgetWindow != undefined) widgetWindow.close()
        win.webContents.send('close?')
    })

    ipcMain.on('close', (ev) => win.destroy());
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

function openSettings() {
    settingsWindow = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        maximizable: false,
        minimizable: false,
        alwaysOnTop: true,
        parent: win
    })
    settingsWindow.loadFile("pages/settings.html")

    settingsWindow.on('close', (ev) => {
        ev.preventDefault()
        settingsWindow.hide()
        settingsWindow.webContents.send("close-settings?")
        settingsWindow.destroy()
    })
    ipcMain.on('close-settings', () => settingsWindow.destroy())
    ipcMain.emit('settings-changed')
}

function openNewWidget() {
    widgetWindow = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        maximizable: false,
        minimizable: false,
        resizable: false,
        alwaysOnTop: true
    })
    widgetWindow.loadFile("pages/new.html")
    widgetWindow.show()

    widgetWindow.on('close', (ev) => {
        ev.preventDefault()
        widgetWindow.hide()
        widgetWindow.webContents.send("close-widget?");
    })
    ipcMain.on('close-widget', () => widgetWindow.destroy())
}