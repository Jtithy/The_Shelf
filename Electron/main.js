const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let backendProcess;

//Express Backend server
function startBackend() {
    const backendPath = path.join(__dirname, "..", "Backend");
    const serverPath = path.join(backendPath, "server.js");

    console.log("Starting The_Shelf backend..");

    backendProcess = spawn(
        process.execPath,
        [serverPath],
        {
            cwd: backendPath,
            env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
            stdio: "inherit"
        }
    );

    backendProcess.on("error", (error) => {
        console.error("Failed to start backend: ", error);
    });

    backendProcess.on("exit", (code) => {
        console.error(`Backend process exited with code ${code}`);
    });
}

//If backend is running???
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreference: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    //Load index.html

    win.loadFile(path.join(__dirname, "..", "Frontend", "index.html"));
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});