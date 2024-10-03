const { app, BrowserWindow, ipcMain, Menu } = require("electron")
const path = require('node:path')
const fn = require('./functions.js')

app.whenReady().then(() => {
    const win = new BrowserWindow({
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

    win.loadFile('pages/index.html')
    win.once('ready-to-show', () => { win.show(); win.maximize(); win.focus() })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    win.on('close', (ev) => {
        ev.preventDefault()
        win.hide()
        win.webContents.send('close?')
    })

    ipcMain.on('close', (ev) => win.destroy());
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})