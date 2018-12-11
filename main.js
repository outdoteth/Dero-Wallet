'use strict';

require("electron-reload")(__dirname);
var child = require('child_process').execFile;
var {Menu} = require("electron");
var path = require("path");
const fs = require("fs");
const axios =   require("axios");
var bodyParser = require('body-parser');

const { app, BrowserWindow } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 1200, height: 700 })
  var executablePath = path.join(__dirname, "Golang_walletapi_bindings/Golang_walletapi_bindings");

  child(executablePath, function(err, data) {
      if(err){
         console.error(err);
         return;
      }
      console.log("sucess");
      console.log(data.toString());
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
  setTimeout(() => {   win.show();}, 3000);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

      var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

var express = require('express');
var app_b = express();
var router = express.Router();

app_b.use(bodyParser.json()); // support json encoded bodies
app_b.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app_b.use('/', router);

// Check if we already have a wallet file
// if yes then return true
// else create a new wallet and insert the file
app_b.post("/remove_and_insert_wallet_new", function (req, res) {
  const pathToFile = path.join(__dirname, 'wallet_file/wallet.db');
  const pathFile = path.join(__dirname, "wallet_file");
  fs.unlink(pathToFile, function(err) {
    axios.post("http://127.0.0.1:8000/create_new_wallet", {path: pathFile, password: req.body.password}).then(res1 => {
      console.log(res1.data);
      res.send(false);//file doesnt exist
    }).catch(e => {
      console.log(e);
      res.send(false);
    });
  });
});

//check if wallet.db file exists
app_b.get("/check_wallet_exists", function (req, res) {
  const pathTo = path.join(__dirname, "wallet_file/wallet.db");
  if (fs.existsSync(pathTo)) {
    res.send(true);
  } else {
    res.send(false);
  }
});

app_b.post("/unlock_wallet", function(req, res) {
	const pathTo = path.join(__dirname, "wallet_file/wallet.db");
	console.log(pathTo);
	axios.post("http://127.0.0.1:8000/open_wallet", {password: req.body.password, file: pathTo}).then(res1 => {
		console.log(res1);
		res.send("success");
	});
});

app_b.get("/remove_and_insert_wallet_import", function (req, res) {

});

// Listen to port 5000
app_b.listen(5000, function () {
  console.log('Dev app listening on port 5000!');
});


