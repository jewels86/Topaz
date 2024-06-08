const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    fs: {
        save:       (x, path)   => ipcRenderer.invoke('req:fs:write', [path, x]),
        read:       (path)      => ipcRenderer.invoke('req:fs:read', path),
        exists:     (path)      => ipcRenderer.invoke('req:fs:exists', path),
        mkdir:      (path)      => ipcRenderer.invoke('req:fs:mkdir', path)
    },
    log:            (x)         => ipcRenderer.invoke('req:log', x)
});