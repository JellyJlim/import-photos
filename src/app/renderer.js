import "./index.css";
import "toastify-js/src/toastify.css";
import { VirtualList } from "./vitualised-list";
import Toastify from "toastify-js";

let arrDevice = [];
let arrPhotos = [];
Array.prototype.clear = function() {
  this.length = 0;
};

let arrTimer = [];

let list = null;
const thumbDir = "c:\\path\\to\\thumbnails\\";
const photoDir = "c:\\path\\to\\copy\\";


const strDevicId = document.getElementById("device-id");
const strCntPhotos = document.getElementById("count-photos");
const strCntDevices = document.getElementById("count-devices");
const listDevice = document.getElementById("select-device");


const generateRandomID = () => {
  return "xxxx-xxxx".replace(/[x]/g, function() {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return chars[Math.floor(Math.random() * chars.length)];
  });
}

const getFileExtension = (filename) => {
  const parts = filename.split(".");
  return parts.length > 1 ? "." + parts.pop() : "";
}

const showInfoToast = info => {
  Toastify({
    text: info,
    className: "info",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)"
    }
  }).showToast();
};

const startTimer = id => {
  const addId = id ? id : generateRandomID();
  const startTime = new Date();
  arrTimer.push({ id: addId, startTime });
  return addId;
};

const endTimer = id => {
  if (id) {
    const endTime = new Date();
    const targetIdx = arrTimer.findIndex(elem => elem.id === id);
    if (targetIdx != -1) {
      const startTime = arrTimer[targetIdx].startTime;
      arrTimer.splice(targetIdx, 1);
      updateTimerInfo(id, endTime - startTime)
      return endTime - startTime;
    }
  }
  return 0;
};

const updateTimerInfo = (id, time) => {
  const divTimeInfo = document.querySelector("#time-info")
  const pInfo = document.getElementById(id) || document.createElement("p");
  pInfo.id = id
  pInfo.innerHTML = `${id}: ${time}ms`;
  if(!divTimeInfo.querySelector(`#${id}`))
    divTimeInfo.appendChild(pInfo);
}

const information = document.getElementById("info");
information.innerText = `This app is using Chrome (v${window.electronAPI.chrome()}), Node.js (v${window.electronAPI.node()}), and Electron (v${window.electronAPI.electron()})`;

const container = document.createElement("div");
document.body.append(container);



const btnFindDevices = document.getElementById("btn-list-devices");
btnFindDevices.addEventListener("click", event => {
  showInfoToast("Seaching Devices");
  strCntDevices.innerHTML = " : Searching...";
  btnFindDevices.disabled = true;
  for (let i = listDevice.children.length - 1; i >= 0; i--) {
    listDevice.removeChild(listDevice.children[i]);
  }
  window.electronAPI.requestListDevices();
  event.preventDefault();
});

const btnListPhotos = document.getElementById("btn-list-photos");
btnListPhotos.addEventListener("click", event => {
  const selectedIndex = listDevice.selectedIndex;
  if (selectedIndex >= 0) {
    const selected = listDevice.options[selectedIndex];
    const deviceId = selected.value;
    console.log(selected, deviceId);
    strDevicId.innerText = `${selected.label}`;
    startTimer("list-up-photos");
    window.electronAPI.requestListPhotos(deviceId, thumbDir);
  }
  event.preventDefault();
});

const btnWatchFetchPhotos = document.getElementById("btn-watch-fetch-photos");
btnWatchFetchPhotos.addEventListener("click", event => {
  showInfoToast("Seaching Devices");
  btnWatchFetchPhotos.textContent = "Watching";
  arrDevice.clear();
  btnWatchFetchPhotos.disabled = true;
  for (let i = listDevice.children.length - 1; i >= 0; i--) {
    listDevice.removeChild(listDevice.children[i]);
  }
  window.electronAPI.requestFindDevice();
  event.preventDefault();
});

const btnImportPhotos = document.getElementById("btn-import-photos");
btnImportPhotos.addEventListener("click", event => {
  showInfoToast("Importing Photos");
  startTimer("import-photos");

  //Get Device
  const selectedIndex = listDevice.selectedIndex;
  console.log("selectedIndex", selectedIndex);
  console.log("selectedIndex", selectedIndex);
  if (selectedIndex >= 0) {
    const device = listDevice.options[selectedIndex];
    const deviceName = `${device.label}`;
    console.log(arrPhotos);
    const selected = arrPhotos.reduce(
      (acc, photo) =>
        photo.isSelected ? [...acc, [photo.source, photo.output]] : acc,
      []
    );
    console.log("selected", selected);
    if(selected.length > 0 )
      window.electronAPI.requestImportPhotos(selected, deviceName, photoDir);
  }
  event.preventDefault();
});

const textContentOutput = document.getElementById("textContentOutput");

window.electronAPI.onGeneralMsg(msg => {
  textContentOutput.value += msg + "\r\n";
  textContentOutput.scrollTop = textContentOutput.scrollHeight;
  if (msg == "~COMPLETED") {
    const timerMs = endTimer("read-thumbnails");
  }
});

const checkError = value => (value && value.status === "error" ? true : false);

window.electronAPI.onUpdatePhotos(value => {
  endTimer("list-up-photos");
  console.log("html === event", value);
  if (checkError()) {
    console.log("ERROR hanpped");
    return;
  }
  const { data } = value;
  const totalPhotos = data.length;
  const numImageLine = 3;
  const totalRows =
    totalPhotos % numImageLine
      ? totalPhotos / numImageLine + 1
      : totalPhotos / numImageLine;
  strCntPhotos.innerText = `${totalPhotos} Photos Found`;
  startTimer("read-thumbnails");
  if (totalPhotos > 0) {
    if (list) {
      document.getElementById("placeholder").removeChild(list.container);
      list = null;
      arrPhotos.clear();
    }

    for (let idx = 0; idx < totalPhotos; idx++) {
      if (data[idx]) {
        //arrPhotos
        const photoData = data[idx];
        const photo = {};
        const ext = getFileExtension(photoData.Name);
        photo.isSelected = false;
        photo.thumb =  encodeURI(photoData.Thumb);
        photo.source = photoData.Path + "\\" + photoData.Name;
        photo.output = `IMG${idx}${ext}`;
        arrPhotos[idx] = photo;
      }
    }

    list = new VirtualList({
      h: 600,
      itemHeight: 200,
      totalRows,
      generatorFn: row => {
        const el = document.createElement("div");
        el.style.textAlign = "center";
        el.style.width = "100%";

        for (let idx = row * numImageLine; idx < row * numImageLine + numImageLine; idx++) {
          if (arrPhotos[idx]) {
            const photoData = arrPhotos[idx];
            const img = document.createElement("img");
            img.src = `atom://${photoData.thumb}`;
            img.style.height = "200px";
            img.style.display = "inline";
            img.style.width = "200px";
            img.classList.add("imgBox");

            img.dataset.isSelected = photoData.isSelected;
            img.addEventListener("click", function(e) {
              arrPhotos[idx].isSelected = !(arrPhotos[idx].isSelected);
              e.target.dataset.isSelected = arrPhotos[idx].isSelected
            });
            el.appendChild(img);
          }
        }
        return el;
      }
    });
  }
  list.container.style.marginLeft = "auto";
  list.container.style.marginRight = "auto";
  document.getElementById("placeholder").appendChild(list.container);
});

window.electronAPI.onUpdateDevices(value => {
  btnFindDevices.disabled = false;
  console.log("onFoundDevice === event", value);
  if (checkError()) {
    console.log("ERROR hanpped");
    return;
  }
  const { data } = value;

  strCntDevices.innerHTML = ` : Found ${data.length}`;
  data &&
    data.map((device, idx) => {
      arrDevice.push(device);
      const listItem = document.createElement("option");
      listItem.value = device.deviceId;
      listItem.label = device.name;
      listDevice.appendChild(listItem);
    });
});

window.electronAPI.onFoundDevice(value => {
  console.log("onFoundDevice === event", value);
  if (checkError()) {
    console.log("ERROR hanpped");
    return;
  }
  const { data } = value;

  // Found Device
  if (data.length > 0) {
    const target = data[0];
    strDevicId.innerText = `${target.name}`;
    showInfoToast(`Found a device${target.name}`);
    //Get List
    const deviceId = target.deviceId;
    console.log(deviceId);
    showInfoToast("Listing up Photos");
    //    window.electronAPI.requestListPhotos(deviceId, photoDir);
  }
});

window.electronAPI.onCompleteImport(value => {
  endTimer("import-photos");
})