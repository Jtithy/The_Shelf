const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

//Express Backend server
function startBackend() {
    const backendPath = path.join(__dirname, "..", "Backend");
    const serverPath = path.join(backendPath, "server.js");

    // SQLite database location
    const databasePath = path.join(
        app.getPath("userData"),
        "the_shelf.db"
    );

    console.log("Starting The_Shelf backend..");
    console.log("SQLite database:", databasePath);

    backendProcess = spawn(
        process.execPath,
        [serverPath],
        {
            cwd: backendPath,

            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: "1",
                THE_SHELF_DB_PATH: databasePath
            },

            stdio: "inherit"
        }
    );

    backendProcess.on("error", (error) => {
        console.error("Failed to start backend:", error);
    });

    backendProcess.on("exit", (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}


//If backend is running
function waitForBackend(callback) {
    const http = require("http");

    const request = http.get("http://localhost:3000", (res) => {
        console.log("Backend is ready!");

        if (callback) {
            callback();
        }
    });

    request.on("error", () => {
        console.log("Waiting for backend...");

        setTimeout(() => {
            waitForBackend(callback);
        }, 500);
    });
}

//Electron window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, "..", "Frontend", "index.html")
    );
}

// Start application
app.whenReady().then(() => {
    startBackend();

    waitForBackend(() => {
        createWindow();
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Close backend when Electron closes
app.on("window-all-closed", () => {
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});