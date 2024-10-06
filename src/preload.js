const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('_api', { // sets up ipc
    write:          async (path, x)     => await ipcRenderer.invoke('write', [path, x]),
    read:           async (path)        => await ipcRenderer.invoke('read', [path]),
    exists:         async (path)        => await ipcRenderer.invoke('exists', [path]),
    mkdir:          async (path)        => await ipcRenderer.invoke('mkdir', [path]),
    getSecureData:  async (id)          => await ipcRenderer.invoke('getSD', [id]),
    setSecureData:  async (id, value)   => await ipcRenderer.invoke('setSD', [id, value]),

    subscribeToClose:  (x)              => ipcRenderer.on('close?', x),
    close: ()                           => ipcRenderer.send('close', []),
    openSettings: ()                    => ipcRenderer.send('open-settings', [])
})