import { app, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'node:fs'
import path from 'node:path'

const defaults = {
    width: 1000,
    height: 600
}

app.whenReady().then(() => {
    ipcMain.handle('req:fs:write',      (ev, args) => { return fs.writeFileSync(args[1], args[0]) })
    ipcMain.handle('req:fs:read',       (ev, args) => { return fs.readFileSync(args) })
    ipcMain.handle('req:fs:exists',     (ev, args) => { return fs.existsSync(args) })
    ipcMain.handle('req:fs:mkdir',      (ev, args) => { return fs.mkdirSync(args) })
    ipcMain.handle('req:fs:ls',         (ev, args) => { return fs.readdirSync(args) })
    ipcMain.handle('log',               (ev, args) => { console.log(args) })
    ipcMain.handle('emit',              (ev, args) => { ipcMain.emit(args) })

    let win = new BrowserWindow({
        width: defaults.width,
        height: defaults.height,
        webPreferences: { preload: path.join(process.cwd(), 'preload.js') }
    })

    win.hide()
    win.loadFile('./pages/index.html')

    win.once('ready-to-show', () => win.show())
    win.maximize()

    win.on('close', () => {
        //win.hide()
        ipcMain.handle('res:end', () => app.exit(0))
        //win = null
    })
})