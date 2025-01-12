const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('_api', {
    setTitleBarColor:   (color) => ipcRenderer.send('setTitleBarColor', color),

    getDirectory:       () => ipcRenderer.invoke('getDirectory'),
    exists:             (path) => ipcRenderer.invoke('exists', path),
    write:              (path, data) => ipcRenderer.invoke('write', path, data),
    read:              (path) => ipcRenderer.invoke('read', path),
})