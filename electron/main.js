const { app, BrowserWindow, globalShortcut } = require('electron');

function createWindow() {
    // Crear la ventana del navegador.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // y carga el archivo index.html de la aplicación.
    win.loadFile('index_bulma.html');

    // Abre las herramientas de desarrollo (DevTools).
    // win.webContents.openDevTools();

    // Atajo para abrir las herramientas de desarrollo con F12
    globalShortcut.register('F12', () => {
        win.webContents.openDevTools();
    });
}

app.whenReady().then(createWindow);
