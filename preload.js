const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  notifyAssetsReady: () => ipcRenderer.send("assets-ready")
});