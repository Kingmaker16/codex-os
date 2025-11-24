// Codex Voice OS v1.1 - WebSocket Audio Server

import { WebSocketServer, WebSocket } from "ws";
import { transcribeAudioChunk } from "./stt/openaiStt.js";
import { bargeInManager } from "./bargeIn.js";

export interface AudioServerOptions {
  port: number;
  apiKey?: string;
}

export class AudioServer {
  private wss: WebSocketServer | null = null;

  constructor(private options: AudioServerOptions) {}

  start(): void {
    this.wss = new WebSocketServer({ 
      port: this.options.port + 1, // Use port+1 for WS (e.g., 9002 if HTTP is 9001)
      path: "/ws/voice"
    });

    console.log(`🎧 WebSocket audio server listening on ws://localhost:${this.options.port + 1}/ws/voice`);

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("🔌 Client connected to audio stream");

      ws.on("message", async (data: Buffer) => {
        // Check for barge-in
        const didBargeIn = bargeInManager.handleBargeIn();
        
        if (didBargeIn) {
          ws.send(JSON.stringify({ type: "barge_in", message: "Speech interrupted" }));
        }

        // Process audio chunk
        try {
          const text = await transcribeAudioChunk(data, this.options.apiKey);
          
          ws.send(JSON.stringify({
            type: "transcription",
            text,
            timestamp: new Date().toISOString(),
          }));
        } catch (err) {
          console.error("❌ Transcription error:", err);
          ws.send(JSON.stringify({
            type: "error",
            message: "Transcription failed",
          }));
        }
      });

      ws.on("close", () => {
        console.log("🔌 Client disconnected from audio stream");
      });

      ws.on("error", (err) => {
        console.error("❌ WebSocket error:", err);
      });
    });
  }

  stop(): void {
    if (this.wss) {
      this.wss.close();
      console.log("🛑 WebSocket audio server stopped");
    }
  }
}
