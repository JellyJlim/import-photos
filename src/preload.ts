import { ipcRenderer, contextBridge } from 'electron';
import {IpcRendererEvent} from 'electron/renderer'

function setupIpcRendererListener(channel: string, callback: (...args: any[]) => void): void {
  const eventCallback = (event: IpcRendererEvent, ...args: any[]) => callback(...args);
  ipcRenderer.on(channel, eventCallback);
}


contextBridge.exposeInMainWorld('electronAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  requestListDevices:() => ipcRenderer.send('list-devices'),
  requestListPhotos:(deviceId:string, outputDir:string) => ipcRenderer.send('list-photos', deviceId, outputDir),
  requestFindDevice:(deviceId:string) => ipcRenderer.send('find-device', deviceId),
  requestImportPhotos:(photos:Record<string,string>, deviceName:string, outputDir:string) => ipcRenderer.send('import-photos', photos, deviceName, outputDir),

  onGeneralMsg: (callback: (...args: any[]) => void): any => setupIpcRendererListener('general-msg', callback),
  onUpdatePhotos: (callback: (...args: any[]) => void): any => setupIpcRendererListener('list-photos-reply', callback),
  onUpdateDevices: (callback: (...args: any[]) => void): any => setupIpcRendererListener('list-devices-reply', callback),
  onFoundDevice: (callback: (...args: any[]) => void): any => setupIpcRendererListener('find-device-reply', callback),
  onCompleteImport: (callback: (...args: any[]) => void): any => setupIpcRendererListener('import-photos-reply', callback),
});