const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CYK Parser Studio - Cocke–Younger–Kasami Visualizer',
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // In production desktop bundle, load index.html from dist
  const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
  const fs = require('fs');

  if (fs.existsSync(distIndex)) {
    win.loadFile(distIndex);
  } else {
    // If running in development with vite dev server
    win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
