import { ipcRenderer, contextBridge } from 'electron';
import {IpcRendererEvent} from 'electron/renderer'

type IpcResult<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: {
    name: string;
  };
};

function setupIpcRendererListener(channel: string, callback: (...args: any[]) => void): void {
  const eventCallback = (event: IpcRendererEvent, ...args: any[]) => callback(...args);
  ipcRenderer.on(channel, eventCallback);
}

const invokeIpcMethod = async <T>(methodName: string, ...args: any[]): Promise<T> => {
  const result: IpcResult<T> = await ipcRenderer.invoke(methodName, ...args);
  const { status } = result;
  
  if (status === 'success') {
    return result.data as T;
  }
  
  throw new Error(result.error?.name || `Error:${methodName}`);
};

contextBridge.exposeInMainWorld('electronAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // requestListDevices:() => ipcRenderer.send('list-devices'),
  requestListPhotos:(deviceId:string, deviceName:string, outputDir:string) => ipcRenderer.send('list-photos', deviceId, deviceName, outputDir),
  requestFindDevice:(deviceId:string) => ipcRenderer.send('find-device', deviceId),
  requestImportPhotos:(photos:Record<string,string>, deviceName:string, outputDir:string) => ipcRenderer.send('import-photos', photos, deviceName, outputDir),
  testStdin:() => ipcRenderer.send('test-stdin'),
  testStdin2:(thumbsDir:string, limit:number) => ipcRenderer.invoke('test-stdin2', thumbsDir, limit),

  // waitForDevice: async (requestId:string, type = 'MOBILE', secTimeOut = 2*60) => {
  //   const result = await ipcRenderer.invoke('wait-device-list', requestId, type, secTimeOut);
  //   const { status } = result
  //   if ( status == 'success') {
  //     return result?.data;
  //   }
  //   throw new Error(result.error?.name || 'Error:wait-device-list');
  // },
  // monitorMobileConnection: async (requestId:string, secTimeOut = 2*60) => {
  //   const result = await ipcRenderer.invoke('monitor-mobile-connection', requestId, secTimeOut);
  //   const { status } = result
  //   if ( status == 'success') {
  //     return result?.data;
  //   }
  //   throw new Error(result.error?.name || 'Error:monitor-mobile-connection');
  // },

  waitForDevice: (requestId: string, type = 'MOBILE', secTimeOut = 2 * 60) => invokeIpcMethod<any>('wait-device-list', requestId, type, secTimeOut),
  monitorMobileConnection: (requestId: string, secTimeOut = 2 * 60) => invokeIpcMethod<any>('monitor-mobile-connection', requestId, secTimeOut),
  stopProcess: (requestId:string) => ipcRenderer.send('stop-process', requestId),

  onGeneralMsg: (callback: (...args: any[]) => void): any => setupIpcRendererListener('general-msg', callback),
  onUpdatePhotos: (callback: (...args: any[]) => void): any => setupIpcRendererListener('list-photos-reply', callback),
  onUpdateDevices: (callback: (...args: any[]) => void): any => setupIpcRendererListener('list-devices-reply', callback),
  onFoundDevice: (callback: (...args: any[]) => void): any => setupIpcRendererListener('find-device-reply', callback),
  onCompleteImport: (callback: (...args: any[]) => void): any => setupIpcRendererListener('import-photos-reply', callback),
});