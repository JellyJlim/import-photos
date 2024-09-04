import path from "node:path";
import { promises as fsp } from "node:fs";
import { randomUUID as genUuid } from "node:crypto";
import { exec, execAndNoti, processExe, execWithIn, inputNumber, stopExe, abortProcess } from "./exec";
import {
  addPolling,
  curryAFunc,
  awaitTruthyPromiseWithPolling
} from "./polling";

const libraryDir = path.join(__dirname, "./ps");

export const testStdin = async (): Promise<unknown> => {
  try {
    // const execFileName = "TestStdin.ps1";
    // await fsp.access(path.join(libraryDir, execFileName));
    const listDevice = await execWithIn(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-file", "./TestStdin.ps1"],
      {
        cwd: libraryDir
      }
    );
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
}

const countFiles = async (p: string, limit: number) =>
  fsp
    .readdir(p)
    .then( (files) => {
      console.log("thumbdir has ", files.length)
      return files.length > limit;
    })
    .catch(e => false);

export const testStdin2 = async(thumbsDir="", limit=10000) => {
  if(!thumbsDir) return 0;
  const uuid = genUuid();
  const result = await awaitTruthyPromiseWithPolling({
    taskAsync: curryAFunc(countFiles, thumbsDir, limit),
    pollingId: uuid,
    timeOut: 2 * 60 * 1000
  });
  if(result) stopExe();
  return result;
}

export const listDevice = async (): Promise<unknown> => {
  try {
    const execFileName = "listPhotoMedia.ps1";
    await fsp.access(path.join(libraryDir, execFileName));
    const listDevice = await exec(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-file", execFileName],
      {
        cwd: libraryDir
      }
    );
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

export const waitForDevice = async (
  requestId: string,
  connectType: string,
  secTimeOut: number
): Promise<unknown> => {
  try {
    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./findDeviceByConnection.ps1",
        `${connectType}`,
        `${secTimeOut}`
      ],
      {
        cwd: libraryDir,
        processId: requestId,
      }
    );

    console.log("wiatForDevice get succee?");
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

export const stopProcess = (requestId:string) => {
  abortProcess(requestId);
}

export const monitorMobileConnection = async (requestId:string, secTimeOut: number) => {
  try{
    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./pollingMobileConnection.ps1",
        `${secTimeOut}`
      ],
      {
        cwd: libraryDir,
        processId: requestId,
      }
    );    
    return;
  }catch(e){
    console.log(e);
    throw new Error("Error");
  }
}


export const findDevice = async (
  connectType = "Mobile",
  secTimeOut = 0
): Promise<unknown> => {
  try {
    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./findDeviceByConnection.ps1",
        `${connectType}`,
        `${secTimeOut}`
      ],
      {
        cwd: libraryDir
      }
    );
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

export const getDeviceFromId = async (deviceId: string): Promise<unknown> => {
  try {
    const listDevice = await exec(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-file", "./getDeviceFromId.ps1"],
      {
        cwd: libraryDir
      }
    );
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

//
// Import Photos
//

const findFile = async (p: string) =>
  fsp
    .access(p)
    .then(async () => {
      console.log("found", p);
      const responseData = await fsp.readFile(p, { encoding: "utf8" });
      return JSON.parse(responseData);
    })
    .catch(e => false);

export const listPhotosByApp: (
  deviceId: string,
  deviceName: string,
  ouputDir: string,
  sendNoti: (msg: string) => void
) => Promise<unknown> = async (deviceId, deviceName, ouputDir, sendNoti) => {
  try {
    const execFileName = "MTPThumbImaging.exe";
    const uuid = genUuid();

    await fsp.access(path.join(libraryDir, execFileName));
    console.log(path.join(libraryDir, execFileName), deviceId);

    // ONLY Read : output direactory
    // const result = await awaitTruthyPromiseWithPolling({
    //   taskAsync: curryAFunc(findFile,  path.join(ouputDir, "photo_items.json")),
    //   pollingId: uuid,
    //   timeOut: 2 * 60 * 1000,
    // })

    sendNoti("Searching Devices....");
    processExe(
      execFileName,
      [`${deviceId}`, `${deviceName}`, `${ouputDir}`],
      {
        cwd: libraryDir
      },
      sendNoti
    ).catch(e => {
      console.log("listPhotosByApp after exec", e);
      if (!(e instanceof Error)) {
        e = new Error("Error");
      }
    });
    const result = await awaitTruthyPromiseWithPolling({
      taskAsync: curryAFunc(findFile, path.join(ouputDir, "photo_items.json")),
      pollingId: uuid,
      timeOut: 2 * 60 * 1000
    });

    // maybe promise race 

    return result;
  } catch (e) {
    console.log("listPhotosByApp", e);
    if (!(e instanceof Error)) {
      e = new Error("Error");
    }
    throw e;
  }
};


export const importPhotos: (
  photos: Record<string,string>,
  devicenName: string,
  outputDir: string
) => Promise<unknown> = async (photos, devicenName, outputDir) => {
  try {
    const execFileName = "copyFilesFromPhone.ps1";
    await fsp.access(path.join(libraryDir, execFileName));

    const strPhotos = JSON.stringify(photos);//?.replace(/\\\\/g, '\\');;

    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./copyFilesFromPhone.ps1",
        `${strPhotos}`,
        `${devicenName}`,
        `${outputDir}`,
      ],
      {
        cwd: libraryDir
      }
    );
    return listDevice;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};