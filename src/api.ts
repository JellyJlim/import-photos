import path from "node:path";
import { promises as fsp } from "node:fs";
import { randomUUID as genUuid } from "node:crypto";
import { exec, execAndNoti, exeFile } from "./exec";
import {
  addPolling,
  curryAFunc,
  awaitTruthyPromiseWithPolling
} from "./polling";

const libraryDir = path.join(__dirname, "./ps");

export const listDevice = async (): Promise<unknown> => {
  try {
    const execFileName = "listPhotoMedia.ps1";
    await fsp.access(path.join(libraryDir, execFileName));
    const listDevice = await exec(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-file", "./listPhotoMedia.ps1"],
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

////////////////////
export const listPhotosFromMobile: () => Promise<void> = async () => {
  try {
    const listPhotos = await exec(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-file", "./listPhotos.ps1"],
      {
        cwd: libraryDir
      }
    );
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

export const dirDevice: (
  deviceId: string,
  limit: number
) => Promise<unknown> = async (deviceId, limit) => {
  try {
    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./listPhotoItems.ps1",
        `${deviceId}`,
        `${limit}`
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

export const getThumbnail: (
  deviceId: string,
  deviceType: string,
  photos: Array<{ srcPhoto: string; destPhotoName: string }>
) => Promise<unknown> = async (deviceId, photos) => {
  try {
    // const arr = [
    //   {
    //     srcPhoto: "Pixel 6a\\Internal shared storage\\DCIM\\Camera\\20220705_172814_HDR.jpg",
    //     destPhotoName: "20220705_172814_HDR.jpg"
    //   },
    //   {
    //     srcPhoto: "Pixel 6a\\Internal shared storage\\DCIM\\Camera\\20190609_174614.jpg",
    //     destPhotoName: "20190609_174614.jpg"
    //   }
    // ];
    const strPhotos = JSON.stringify(photos);
    // console.log(sample);
    const listDevice = await exec(
      "powershell",
      [
        "-ExecutionPolicy",
        "Bypass",
        "-file",
        "./getThumbnail.ps1",
        `${deviceId}`,
        `${strPhotos}`,
        "C:\\Temp"
      ],
      {
        cwd: libraryDir
      }
    );
  } catch (e) {
    console.log(e);
    throw new Error("Error");
  }
};

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
  ouputDir: string,
  sendNoti: (msg: string) => void
) => Promise<unknown> = async (deviceId, ouputDir, sendNoti) => {
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

    sendNoti("Searging Devices....");
    exeFile(
      execFileName,
      [`${deviceId}`, `${ouputDir}`],
      {
        cwd: libraryDir
      },
      sendNoti
    );
    const result = await awaitTruthyPromiseWithPolling({
      taskAsync: curryAFunc(findFile, path.join(ouputDir, "photo_items.json")),
      pollingId: uuid,
      timeOut: 2 * 60 * 1000
    });

    console.log("list result ==== ", result[0].value);
    return result;
  } catch (e) {
    console.log(e);
    throw new Error("Error");
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