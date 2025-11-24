import { contextBridge } from "node:electron";

console.log("codex-desktop preload loaded");

// Minimal contextBridge for future use
contextBridge.exposeInMainWorld("codexDesktop", {
  ping: () => "pong",
});
