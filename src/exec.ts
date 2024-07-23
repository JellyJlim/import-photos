import { spawn, execFile, ChildProcess } from "child_process";
import { Buffer } from "node:buffer";

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

export const exeFile = (
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
  }).catch((code: any) => {
    // throw new ExecutionError(`Failed with code(${code})`, code);
    sendNoti(`Failed with code(${code})`);
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

export const exec = (cmd = "", args = [] as string[], opt = {}) =>
  new Promise((res, rej) => {
    console.log("ps will start", args, opt);
    const subp = spawn(cmd, args, opt);
    const cmdline = [cmd].concat(args).join(" ");
    let buffer = Buffer.alloc(0);
    subp.stdout.on("data", data => {
      buffer = Buffer.concat([buffer, data]);
    });
    subp.on("error", e => {
      console.log("spawn error", e);
      rej(e);
    });
    subp.on("exit", code => {
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
