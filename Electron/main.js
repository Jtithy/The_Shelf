const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let backendProcess;

// Copy the existing development database to Electron's
// writable user-data folder on first launch.
function prepareDatabase() {
    const sourceDatabase = path.join(
        __dirname,
        "..",
        "Backend",
        "data",
        "the_shelf.db"
    );

    const targetDatabase = path.join(
        app.getPath("userData"),
        "the_shelf.db"
    );

    const fs = require("fs");

    // Only copy if the Electron database does not already exist.
    if (!fs.existsSync(targetDatabase)) {

        if (fs.existsSync(sourceDatabase)) {

            fs.mkdirSync(
                path.dirname(targetDatabase),
                { recursive: true }
            );

            fs.copyFileSync(
                sourceDatabase,
                targetDatabase
            );

            console.log("Existing SQLite database copied.");
            console.log("From:", sourceDatabase);
            console.log("To:", targetDatabase);

        } else {
            console.log("No existing SQLite database found.");
        }

    } else {
        console.log("Electron SQLite database already exists.");
    }
}

// Express Backend server
function startBackend() {

    let backendPath;

    if (app.isPackaged) {
        // Packaged application
        backendPath = path.join(process.resourcesPath, "Backend");
    } else {
        // Development
        backendPath = path.join(__dirname, "..", "Backend");
    }

    const serverPath = path.join(backendPath, "server.js");

    // SQLite database location
    const databasePath = path.join(
        app.getPath("userData"),
        "the_shelf.db"
    );

    console.log("Starting The_Shelf backend..");
    console.log("Backend path:", backendPath);
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


// Wait for backend
function waitForBackend(callback) {

    const request = http.get(
        "http://localhost:3000",
        (res) => {

            console.log("Backend is ready!");

            if (callback) {
                callback();
            }
        }
    );

    request.on("error", () => {

        console.log("Waiting for backend...");

        setTimeout(() => {
            waitForBackend(callback);
        }, 500);
    });
}


// Electron window
function createWindow() {

    let frontendPath;

    if (app.isPackaged) {
        // Packaged application
        frontendPath = path.join(
            process.resourcesPath,
            "Frontend",
            "index.html"
        );
    } else {
        // Development
        frontendPath = path.join(
            __dirname,
            "..",
            "Frontend",
            "index.html"
        );
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(frontendPath);
}


// Start application
app.whenReady().then(() => {

    prepareDatabase();

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