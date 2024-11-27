const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  crawlUrl: (url) => ipcRenderer.invoke('crawl-url', url),
});
