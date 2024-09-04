import { spawn, execFile, ChildProcess } from "child_process";
import { Buffer } from "node:buffer";

import { randomUUID as genUuid } from 'node:crypto';

const processMap = new Map();
export const addProcess = ( process: ChildProcess, uuid?: string): string | null => {
  if (uuid && processMap.has(uuid)) return null;
  const newUuid = uuid || genUuid();
  processMap.set(newUuid, process);
  return newUuid;
};
export const abortProcess = (uuid: string) => {
  if(processMap.has(uuid)){
    console.log("AbortProcess found --- uuid");
    const process = processMap.get(uuid)
    console.log("AbortProcess will kill --- uuid", process===null);
    process?.kill();
    processMap.delete(uuid);
  }
};
export const deleteProcess = (uuid: string) => {
  processMap.delete(uuid);
};

//not yet
export const abortAllProcess = () => processMap .clear();


let currentChild: ChildProcess = null;

class ExecutionError extends Error {
  code: number;
  name = "ExecutionError";
  constructor(message?: string, code = 0) {
    super(message);
    this.code = code;
  }
}

function tryParseJSONObject(jsonString: string) {
  try {
    const rawStr = String.raw`${jsonString}`;
    var json = JSON.parse(rawStr);
    if (json && typeof json === "object") {
      return json;
    }
  } catch (e) {}
  return jsonString;
}

export const execWithIn = (cmd = "", args = [] as string[], opt = {}) =>
  new Promise((res, rej) => {
    console.log("ps will start", args, opt);
    if (currentChild) {
      console.log("current Child is running. will be killed");
      currentChild.kill();
      currentChild = null;
    }

    currentChild = spawn(cmd, args, opt);

    const cmdline = [cmd].concat(args).join(" ");

    let buffer = Buffer.alloc(0);
    currentChild.stdout.on("data", data => {
      buffer = Buffer.concat([buffer, data]);
      console.log("stream data: ", data.toString());
    });
    currentChild.on("error", e => {
      console.log("spawn error", e);
      rej(e);
    });
    currentChild.on("exit", code => {
      if (code === 0) {
        const output = buffer.toString();
        console.log("exec(output) : ", output);
        res(tryParseJSONObject(output));
      } else {
        const output = buffer.toString();
        console.log("output Error == ", output);
        const e = new Error("Process exited with error code " + code);
        // e.code = code;
        rej(e);
      }
      currentChild = null;
    });
  });

export const inputNumber = () => {
  if (currentChild) {
    currentChild.stdin.write("100\n");
    currentChild.stdin.end();
  }
};

export const stopExe = () => {
  if (currentChild) {
    console.log("current Child is running. will be killed : enough files");
    currentChild.kill();
    currentChild = null;
  }
};

export const processExe = (
  cmd = "",
  args = [] as string[],
  opt = {},
  sendNoti: (msg: string) => void
) =>
  new Promise((res, rej) => {
    if (currentChild) {
      console.log("current Child is running. will be killed");
      currentChild.kill();
    }

    currentChild = execFile(cmd, args, opt, (error, stdout, stderr) => {
      if (error) {
        console.log("Error output");
        if (error.name === "AbortError") console.log("Abored");
        rej(error);
      } else {
        if (stderr) {
          rej(stderr);
          console.log("Error stderr:", stderr);
          sendNoti("~THUMB ERRROR");
        }
        console.log("Output:", stdout);
        res(tryParseJSONObject(stdout));
        sendNoti("~COMPLETED");
      }
      currentChild = null;
    });
  });

export const execAndNoti = (
  cmd = "",
  args = [] as string[],
  opt = {},
  sendNoti: (msg: string) => void
) =>
  new Promise((res, rej) => {
    let buffer = Buffer.alloc(0);
    let strLine = "";

    const subp = spawn(cmd, args, opt);
    subp.stdout.on("data", data => {
      buffer = Buffer.concat([buffer, data]);

      const str = data.toString();
      console.log(str);
    });
    subp.on("error", e => {
      console.log("spawn error", e);
      rej(e);
    });
    subp.on("exit", code => {
      sendNoti("~COMPLETED");
      if (code === 0) {
        const output = buffer.toString();
        // console.log("exec(output) : ", output)
        res(tryParseJSONObject(output));
      } else {
        const output = buffer.toString();
        console.log("output Error == ", output);
        const e = new Error("Process exited with error code " + code);
        // e.code = code;
        rej(e);
      }
    });
  }).catch(code => {
    throw new ExecutionError(`Failed with code(${code})`, code);
  });


interface ProcessOptions {
    processId?: string; // Known optional property
    [key: string]: any; // Index signature to allow any other properties
}
export const exec = (cmd = "", args = [] as string[], opt: ProcessOptions= {}) =>
  new Promise((res, rej) => {
    console.log("ps will start", args, opt);
    const {processId, ...options} = opt;
    const subp = spawn(cmd, args, options);
    if(processId){
      console.log("???", subp)
      addProcess(subp, processId);
    }
    let buffer = Buffer.alloc(0);
    subp.stdout.on("data", data => {
      buffer = Buffer.concat([buffer, data]);
      console.log(buffer.toString());
    });
    subp.stderr.on("data", data => {
      buffer = Buffer.concat([buffer, data]);
      
    });
    subp.on("error", e => {
      console.log("spawn error", e);
      if(processId) deleteProcess(processId)
      rej(e);
    });
    subp.on("exit", code => {
      if(processId) deleteProcess(processId)
      if (code === 0) {
        const output = buffer.toString();
        console.log("exec(output) : ", output);
        res(tryParseJSONObject(output));
      } else {
        const output = buffer.toString();
        console.log("output Error == ", output);
        const e = new Error("Process exited with error code " + code);
        // e.code = code;
        rej(e);
      }
    });
  }).catch(code => {
    throw new ExecutionError(`Failed with code(${code})`, code);
  });
