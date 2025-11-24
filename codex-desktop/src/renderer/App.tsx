import React, { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string; provider?: string; model?: string };

type MemorySummary = {
  summary: string;
  count: number;
  recent: string[];
} | null;

export default function App() {
  const [sessionId, setSessionId] = useState("ui-session-1");
  const [provider, setProvider] = useState<"openai" | "claude" | "grok" | "gemini" | "mock">("openai");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<MemorySummary>(null);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
    }
  }, []);

  async function fetchMemory(sessionId: string) {
    if (!sessionId.trim()) return;
    try {
      const resp = await fetch(`http://localhost:4100/memory?sessionId=${encodeURIComponent(sessionId)}`);
      if (!resp.ok) {
        throw new Error(`Memory fetch failed: ${resp.status}`);
      }
      const data = await resp.json();
      if (data?.summary) {
        setMemory({
          summary: data.summary.summary || "",
          count: data.summary.count || 0,
          recent: data.summary.recent || []
        });
        setMemoryError(null);
      } else {
        setMemory(null);
      }
    } catch (err: any) {
      console.error("Memory fetch error:", err);
      setMemoryError("Unable to load memory");
      setMemory(null);
    }
  }

  useEffect(() => {
    fetchMemory(sessionId);
  }, [sessionId]);

  function handleVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input not supported on this browser");
      return;
    }

    if (isRecording) {
      // Already recording, user wants to stop (for v1, just let it end naturally)
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecording(true);
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after transcription
      setTimeout(() => {
        if (transcript.trim()) {
          // Trigger send by simulating the send logic
          const userText = transcript.trim();
          const userMsg: Message = { role: "user", content: userText };
          setMessages(m => [...m, userMsg]);
          setInput("");
          setError(null);
          setIsLoading(true);
          
          fetch("http://localhost:4200/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              provider,
              model: "",
              messages: [{ role: "user", content: userText }],
              max_tokens: 200,
            }),
          })
            .then(resp => resp.json().then(data => ({ resp, data })))
            .then(({ resp, data }) => {
              if (!resp.ok) {
                const errMsg = data?.message ?? data?.error ?? `status ${resp.status}`;
                throw new Error(errMsg);
              }
              if (data?.error) {
                setError(String(data?.message ?? data?.error));
                return;
              }
              const reply: string = data?.reply ?? data?.output ?? "";
              const respProvider: string = data?.provider ?? provider;
              const respModel: string = data?.model ?? "";
              const botMsg: Message = { role: "assistant", content: String(reply), provider: respProvider, model: respModel };
              setMessages(m => [...m, botMsg]);
              
              // TTS for voice replies
              if (window && "speechSynthesis" in window && reply) {
                const utterance = new SpeechSynthesisUtterance(reply);
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
              }
              
              fetchMemory(sessionId);
            })
            .catch((err: any) => {
              console.error(err);
              setError(String(err?.message ?? err ?? "Unknown error"));
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }, 100);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setIsListening(false);
    };

    recognition.start();
  }

  async function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg: Message = { role: "user", content: userText };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setError(null);

    setIsLoading(true);
    try {
      const resp = await fetch("http://localhost:4200/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          provider,
          model: "",
          messages: [{ role: "user", content: userText }],
          max_tokens: 200,
        }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        const errMsg = data?.message ?? data?.error ?? `status ${resp.status}`;
        throw new Error(errMsg);
      }

      if (data?.error) {
        // orchestrator returned error payload
        setError(String(data?.message ?? data?.error));
        return;
      }

      const reply: string = data?.reply ?? data?.output ?? "";
      const respProvider: string = data?.provider ?? provider;
      const respModel: string = data?.model ?? "";

      const botMsg: Message = { role: "assistant", content: String(reply), provider: respProvider, model: respModel };
      setMessages(m => [...m, botMsg]);
      
      // TTS for assistant replies
      if (window && "speechSynthesis" in window && reply) {
        const utterance = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
      
      // Refresh memory after successful chat
      fetchMemory(sessionId);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err ?? "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="codex-app">
      <div className="codex-main">
        <header className="topbar">
          <div className="controls">
            <label>Session: <input value={sessionId} onChange={e=>setSessionId(e.target.value)} /></label>
            <label>Provider: 
              <select value={provider} onChange={e=>setProvider(e.target.value as any)}>
                <option value="openai">openai</option>
                <option value="claude">claude</option>
                <option value="grok">grok</option>
                <option value="gemini">gemini</option>
                <option value="mock">mock</option>
              </select>
            </label>
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        {isListening && (
          <div className="codex-listening">● Listening…</div>
        )}

        <div className="chat" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === "user" ? "user" : "assistant"}`}>
              {m.role === "assistant" && (m.provider || m.model) && (
                <div className="meta">{m.provider ?? ""}{m.model ? ` / ${m.model}` : ""}</div>
              )}
              {m.content}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="codex-thinking">
            Codex is thinking…
          </div>
        )}

        <div className="composer">
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') send();}} placeholder="Type a message..." />
          <button onClick={send}>Send</button>
          <button
            type="button"
            className="codex-voice-btn"
            onClick={handleVoiceInput}
            disabled={!recognitionSupported}
          >
            {isRecording ? "🎙️ Stop" : "🎤 Voice"}
          </button>
        </div>
      </div>

      <div className="codex-memory">
        <h2>Memory</h2>
        {memoryError && <div className="codex-memory-error">{memoryError}</div>}
        {!memory && !memoryError && <p>No memory loaded yet.</p>}
        {memory && (
          <div>
            <p><strong>Summary:</strong> {memory.summary || "N/A"}</p>
            <p><strong>Count:</strong> {memory.count}</p>
            {memory.recent.length > 0 && (
              <div>
                <strong>Recent:</strong>
                <ul>
                  {memory.recent.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
