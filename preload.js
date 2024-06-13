const { contextBridge, ipcRenderer } = require('electron');

let endfunc;

contextBridge.exposeInMainWorld('api', {
    fs: {
        write:      (x, path)   => ipcRenderer.invoke('req:fs:write', [path, x]),
        read:       (path)      => ipcRenderer.invoke('req:fs:read', path),
        exists:     (path)      => ipcRenderer.invoke('req:fs:exists', path),
        mkdir:      (path)      => ipcRenderer.invoke('req:fs:mkdir', path),
        ls:         (path)      => ipcRenderer.invoke('req:fs:ls', path)
    },
    log:            (x)         => ipcRenderer.invoke('log', x),
    subscribe:      (event, x)  => ipcRenderer.on(event, x),
    respondToEnd:   (x)         => ipcRenderer.invoke('res:end', x),
    setEndFunc:     (x)         => endfunc = x
});

window.onbeforeunload = async (e) => await endfunc();