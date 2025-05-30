const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const dir = path.dirname(app.getPath('exe'))
var global = { 
    selectorWin: null, dir: dir,
    workspace: null, profile: null,
    marketplaceSelectorWin: null,
    indexWin: null, promptWin: null

}
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
ipcMain.handle('openMarketplace', () => createMarketplaceSelectorWindow())
ipcMain.handle('openMarketplaceSite', (ev, src) => openMarketplaceSite(src))
ipcMain.handle('openSelector', () => createSelectorWindow())
ipcMain.handle('openPrompt', (event, title, questions) => createPromptWindow(title, questions))

function createSelectorWindow() {
    if (global.marketplaceSelectorWin) global.marketplaceSelectorWin.close()
    if (global.indexWin) global.indexWin.close()

    console.log("Selector window created.")

    const selectorWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000'
        },
    })
    selectorWin.maximizable = false
    selectorWin.resizable = false

    try { ipcMain.once('setTitleBarColor', (event, color) => { selectorWin.setTitleBarOverlay({ color }) }) }
    catch {}

    selectorWin.loadFile('src/pages/selector.html')

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
            preload: path.join(__dirname, 'src', 'preload.js'),
        },
        show: false,
    })
    indexWin.maximize()

    indexWin.loadFile('src/pages/index.html')
    indexWin.once('ready-to-show', () => indexWin.show())
    global.indexWin = indexWin
}

function createMarketplaceSelectorWindow() {
    global.selectorWin.close()

    console.log("Marketplace selector open.")
    
    const marketplaceSelectorWin = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
        },
        show: false,
    })
    marketplaceSelectorWin.maximizable = false
    marketplaceSelectorWin.resizable = false
    marketplaceSelectorWin.setMenuBarVisibility(false)

    marketplaceSelectorWin.loadFile('src/pages/marketplace-selector.html')
    marketplaceSelectorWin.once('ready-to-show', () => marketplaceSelectorWin.show())
    global.marketplaceSelectorWin = marketplaceSelectorWin
}

function createPromptWindow(title, questions) {
    const queryParams = new URLSearchParams({ title, questions: JSON.stringify(questions) }).toString();
    console.log(`Prompt opened ${queryParams}`)
    const promptWin = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
        },
        show: false,
    })
    promptWin.maximizable = false
    
    promptWin.loadURL(`file://${path.join(__dirname, 'src', 'pages', 'prompt.html')}?${queryParams}`);
    promptWin.once('ready-to-show', () => promptWin.show())

    global.promptWin = promptWin
}

function openMarketplaceSite(src) {
    if (global.marketplaceSelectorWin) global.marketplaceSelectorWin.close()
    
    console.log(`Opening marketplace site ${src}`)
    const marketplaceSiteWin = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js')
        },
        show: false
    })
    marketplaceSiteWin.loadURL(`file://${path.join(__dirname, 'src', 'pages', 'marketplace.html')}?src=${encodeURIComponent(src)}`);
    marketplaceSiteWin.once('ready-to-show', () => marketplaceSiteWin.show())
    global.marketplaceSelectorWin = marketplaceSiteWin
}

app.whenReady().then(createSelectorWindow)