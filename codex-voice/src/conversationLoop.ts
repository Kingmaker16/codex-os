// Codex Voice OS v2 - Continuous Conversation Loop

import { VoiceRouter } from "./voiceRouter.js";
import { bargeInV2Manager } from "./bargeInV2.js";
import { parseIntent } from "./intentParser.js";

export interface ConversationSession {
  sessionId: string;
  active: boolean;
  listening: boolean;
  startTime: Date;
  turnCount: number;
}

export class ConversationLoop {
  private sessions: Map<string, ConversationSession> = new Map();
  private voiceRouter: VoiceRouter;

  constructor(voiceRouter: VoiceRouter) {
    this.voiceRouter = voiceRouter;
  }

  /**
   * Start a continuous conversation loop for a session.
   * Microphone → STT → Orchestrator → TTS → repeat until "stop listening"
   */
  async startListening(sessionId: string): Promise<ConversationSession> {
    if (this.sessions.has(sessionId)) {
      const existing = this.sessions.get(sessionId)!;
      existing.listening = true;
      return existing;
    }

    const session: ConversationSession = {
      sessionId,
      active: true,
      listening: true,
      startTime: new Date(),
      turnCount: 0,
    };

    this.sessions.set(sessionId, session);
    console.log(`🎤 [ConversationLoop] Started listening for session: ${sessionId}`);

    // In production, this would continuously process microphone input
    // For now, it's a stub that waits for external input via processInput()
    return session;
  }

  /**
   * Stop listening for a session
   */
  stopListening(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.listening = false;
    session.active = false;
    console.log(`🛑 [ConversationLoop] Stopped listening for session: ${sessionId}`);
    return true;
  }

  /**
   * Process a single turn of conversation:
   * 1. Parse intent
   * 2. Check for "stop listening" command
   * 3. Route to Orchestrator
   * 4. Synthesize response with barge-in support
   * 5. Continue loop if still listening
   */
  async processInput(
    sessionId: string,
    userText: string,
    options?: { fast?: boolean; provider?: string }
  ): Promise<{
    ok: boolean;
    userText: string;
    intent: string;
    replyText?: string;
    shouldContinue: boolean;
    turnNumber: number;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.listening) {
      return {
        ok: false,
        userText,
        intent: "UNKNOWN",
        shouldContinue: false,
        turnNumber: 0,
      };
    }

    // Increment turn count
    session.turnCount++;

    // Parse intent
    const intent = parseIntent(userText);
    console.log(`🧠 [ConversationLoop] Turn ${session.turnCount} - Intent: ${intent.type}`);

    // Check for stop command
    if (this.isStopCommand(userText)) {
      this.stopListening(sessionId);
      return {
        ok: true,
        userText,
        intent: "COMMAND",
        replyText: "Stopping conversation loop. Goodbye!",
        shouldContinue: false,
        turnNumber: session.turnCount,
      };
    }

    // Check for barge-in (user speaking while AI is talking)
    bargeInV2Manager.handleBargeIn();

    try {
      // Route to Orchestrator
      const replyText = await this.voiceRouter.routeToOrchestrator(
        sessionId,
        userText,
        options?.provider
      );

      // Synthesize response with barge-in support
      bargeInV2Manager.startSpeaking();
      await this.voiceRouter.speak(replyText, {
        fast: options?.fast ?? intent.confidence > 0.8, // Use fast TTS for high-confidence commands
      });
      bargeInV2Manager.stopSpeaking();

      return {
        ok: true,
        userText,
        intent: intent.type,
        replyText,
        shouldContinue: session.listening,
        turnNumber: session.turnCount,
      };
    } catch (err: any) {
      console.error(`❌ [ConversationLoop] Error processing turn:`, err);
      bargeInV2Manager.stopSpeaking();
      return {
        ok: false,
        userText,
        intent: intent.type,
        replyText: "Sorry, I encountered an error. Please try again.",
        shouldContinue: session.listening,
        turnNumber: session.turnCount,
      };
    }
  }

  /**
   * Check if user said "stop listening" or equivalent
   */
  private isStopCommand(text: string): boolean {
    const stopPhrases = [
      "stop listening",
      "stop conversation",
      "end conversation",
      "goodbye",
      "exit",
      "quit",
      "stop voice",
    ];

    const normalized = text.toLowerCase().trim();
    return stopPhrases.some((phrase) => normalized.includes(phrase));
  }

  /**
   * Get active session info
   */
  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): ConversationSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.active);
  }
}
