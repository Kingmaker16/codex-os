// Codex Boot Manager v1 - Wake Word Listener (Stub)
// Full implementation in Voice OS v1.1

export async function startWakeWordListener(): Promise<void> {
  console.log("🎤 Starting wake-word listener (stub)...");
  
  // TODO: Voice OS v1.1 - Integrate with SpeechRecognition API
  // For now, simulate immediate readiness
  const wakeWordEnabled = process.env.CODEX_WAKEWORD_ENABLED === "true";
  
  if (wakeWordEnabled) {
    console.log("✅ Wake-word detection enabled (stub)\n");
  } else {
    console.log("⏸️  Wake-word detection disabled (use CODEX_WAKEWORD_ENABLED=true)\n");
  }
}

export async function stopWakeWordListener(): Promise<void> {
  console.log("🛑 Stopping wake-word listener...");
  // TODO: Voice OS v1.1 - Clean up listeners
  console.log("✅ Wake-word listener stopped\n");
}
