const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // win.loadFile('index_botstrap.html');
    win.loadFile('index_bulma.html');
}

app.whenReady().then(createWindow);
