const { app, BrowserWindow, ipcMain  } = require("electron");
const fs = require('fs');
const path = require("path");
const http = require("http");
const express = require("express");

let httpServer;
let loaderWin;
let secondsOfDelay = 1;

function startStaticServer() {
  const server = express();
  const isDev = !app.isPackaged;
  const appPath = isDev ? __dirname : path.join(process.resourcesPath, 'app');
  server.use(express.static(appPath));

  const distPath = path.join(appPath, "_dist");
  server.use("/dist", express.static(distPath));
  
  return new Promise(resolve => {
    httpServer = server.listen(8080, () => {
      console.log("Static server running on http://localhost:8080");
      resolve();
    });
  });
}

function createCemiWindowDev() {

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false,
    kiosk: false
  });


  win.loadURL('http://localhost:8080/cemi-app');
}

function createCemiWindow() {

  const win = new BrowserWindow({
    width: 400,
    height: 300,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  
  ipcMain.on("assets-ready", () => {
    setTimeout(() => {
      if(loaderWin)
        loaderWin.close();
      win.show();
    },
    secondsOfDelay * 1000);
  });

  win.loadURL('http://localhost:8080/cemi-app');
}

app.whenReady().then(async () => {
  console.log("start application..");
  await startStaticServer();
  if(!app.isPackaged)
    createCemiWindowDev();
  else {
    loaderWin = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      center: true
    });
    loaderWin.loadFile(path.join(__dirname, "loading.html"));

    createCemiWindow();
  }
});

app.on("window-all-closed", () => {
  if (httpServer) httpServer.close();
  app.quit();
});