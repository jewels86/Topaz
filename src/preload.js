const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('_api', {
    setTitleBarColor:   (color) => ipcRenderer.send('setTitleBarColor', color),

    getDirectory:       () => ipcRenderer.invoke('getDirectory'),
    exists:             (path) => ipcRenderer.invoke('exists', path),
    write:              (path, data) => ipcRenderer.invoke('write', path, data),
    read:              (path) => ipcRenderer.invoke('read', path),
    tryCreateDir:       (path) => ipcRenderer.invoke('tryCreateDir', path),
    isAbsolute:         (path) => ipcRenderer.invoke('isAbsolute', path),
    pathJoin:           (...paths) => ipcRenderer.invoke('pathJoin', ...paths),

    workspace:          () => ipcRenderer.invoke('workspace'),

    // selector.js
    openIndex:          (workspace) => ipcRenderer.invoke('openIndex', workspace),
    openMarketplace:    (marketplace) => ipcRenderer.invoke('openMarketplace', marketplace),

    // market-selector.js
    openSelector:        () => ipcRenderer.invoke('openSelector'),

    openPrompt:        (title, questions) => ipcRenderer.invoke('openPrompt', title, questions)
})