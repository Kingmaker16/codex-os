import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { app, BrowserWindow } = require("electron");
import path from "node:path";

console.log("codex-desktop Electron main started");
const isMac = process.platform === "darwin";

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(process.cwd(), "codex-desktop", "preload.ts"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In dev we expect the Vite dev server URL; otherwise fall back to a local file.
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

  try {
    await win.loadURL(devServerUrl);
  } catch (err) {
    // fallback (optional) if Vite dev server is not available
    try {
      await win.loadFile("index.html");
    } catch (err2) {
      console.error("Failed to load renderer:", err2);
    }
  }
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
  if (!isMac) {
    app.quit();
  }
});
