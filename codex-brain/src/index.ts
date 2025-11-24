import Fastify from "fastify";
import { ensureDb, insertEvent, getEventsBySession, insertDocument, insertChunk, getDocumentsByDomain, getAllDocuments, getChunksByDocId } from "./db.js";
import { buildSummary } from "./summaryBuilder.js";
import { startMemoryWatcher } from "./memoryWatcher.js";
import { brainV2Routes } from "./v2/router.js";

const app = Fastify({ logger: true });

app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
  }
});

app.get("/health", async () => ({ ok: true, service: "codex-brain" }));

// POST /event expects { kind: string, event: any }
app.post("/event", async (req, res) => {
  try {
    const body = req.body as any;
    if (!body || typeof body.kind !== "string" || !body.event) {
      res.status(400);
      return { error: "invalid_event", message: "expected { kind, event }" };
    }

    const ev = body.event as any;
    const sessionId = ev?.sessionId ?? null;
    if (!sessionId) {
      res.status(400);
      return { error: "missing_sessionId", message: "event.sessionId required" };
    }

    await insertEvent({ sessionId, kind: body.kind, json: JSON.stringify(ev), createdAt: ev.ts ?? new Date().toISOString() });
    return { ok: true };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    // Ensure error message is a string
    const msg = err instanceof Error ? err.message : String(err);
    return { error: "insert_failed", message: msg };
  }
});

// GET /memory?sessionId=...
app.get("/memory", async (req, res) => {
  try {
    const q = (req.query as any) || {};
    const sessionId: string | undefined = q.sessionId;
    if (!sessionId) {
      res.status(400);
      return { error: "missing_sessionId" };
    }

    const rows = await getEventsBySession(sessionId, 200);
    const events = rows.map(r => {
      try { return JSON.parse(r.json); } catch { return r; }
    });
    const summary = buildSummary(events);

    return { ok: true, sessionId, summary, events };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    const msg = err instanceof Error ? err.message : String(err);
    return { error: "memory_error", message: msg };
  }
});

// Knowledge Engine v1 - Ingestion

// POST /ingest - Ingest a document with chunking
app.post("/ingest", async (req, res) => {
  try {
    const body = req.body as any;
    
    // Validate required fields
    if (!body || typeof body.domain !== "string" || !body.domain.trim()) {
      res.status(400);
      return { ok: false, error: "Invalid input", details: "domain is required" };
    }
    if (typeof body.type !== "string" || !body.type.trim()) {
      res.status(400);
      return { ok: false, error: "Invalid input", details: "type is required" };
    }
    if (typeof body.title !== "string" || !body.title.trim()) {
      res.status(400);
      return { ok: false, error: "Invalid input", details: "title is required" };
    }
    if (typeof body.source !== "string" || !body.source.trim()) {
      res.status(400);
      return { ok: false, error: "Invalid input", details: "source is required" };
    }
    if (typeof body.content !== "string" || !body.content.trim()) {
      res.status(400);
      return { ok: false, error: "Invalid input", details: "content is required" };
    }

    // Generate docId
    const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ingestedAt = new Date().toISOString();
    
    // Handle tags
    const tags = Array.isArray(body.tags) ? body.tags.join(",") : undefined;

    // Insert document metadata
    await insertDocument({
      docId,
      domain: body.domain,
      type: body.type,
      title: body.title,
      source: body.source,
      tags,
      ingestedAt
    });

    // Split content into chunks
    const chunks = splitIntoChunks(body.content);
    
    // Insert chunks
    for (let i = 0; i < chunks.length; i++) {
      await insertChunk({
        docId,
        chunkIndex: i,
        content: chunks[i],
        createdAt: ingestedAt
      });
    }

    return {
      ok: true,
      docId,
      domain: body.domain,
      chunksStored: chunks.length
    };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: "Internal error", message: msg };
  }
});

// GET /documents?domain={domain}
app.get("/documents", async (req, res) => {
  try {
    const q = (req.query as any) || {};
    const domain: string | undefined = q.domain;

    let documents;
    if (domain) {
      documents = await getDocumentsByDomain(domain);
    } else {
      documents = await getAllDocuments();
    }

    return {
      ok: true,
      documents
    };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: "Internal error", message: msg };
  }
});

// GET /documentChunks?docId={docId}
app.get("/documentChunks", async (req, res) => {
  try {
    const q = (req.query as any) || {};
    const docId: string | undefined = q.docId;

    if (!docId) {
      res.status(400);
      return { ok: false, error: "missing_docId" };
    }

    const chunks = await getChunksByDocId(docId);

    return {
      ok: true,
      chunks
    };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: "Internal error", message: msg };
  }
});

// GET /skills?domain={domain}
app.get("/skills", async (req, res) => {
  try {
    const q = (req.query as any) || {};
    const domain: string | undefined = q.domain;

    if (!domain) {
      res.status(400);
      return { ok: false, error: "missing_domain", message: "domain parameter required" };
    }

    const sessionId = `codex-skill-${domain}`;
    const rows = await getEventsBySession(sessionId, 500);
    const events = rows.map(r => {
      try { return JSON.parse(r.json); } catch { return r; }
    });
    const summary = buildSummary(events);

    return {
      ok: true,
      domain,
      sessionId,
      summary,
      events
    };
  } catch (err) {
    req.log.error(err);
    res.status(500);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: "Internal error", message: msg };
  }
});

// Helper function to split content into chunks
function splitIntoChunks(content: string): string[] {
  const MAX_CHUNK_SIZE = 1500;
  const chunks: string[] = [];

  // First split on double newlines (paragraphs)
  const paragraphs = content.split(/\n\n+/);

  for (const para of paragraphs) {
    if (para.trim().length === 0) continue;

    if (para.length <= MAX_CHUNK_SIZE) {
      chunks.push(para.trim());
    } else {
      // For very long paragraphs, split by single newlines
      const lines = para.split(/\n/);
      let currentChunk = "";

      for (const line of lines) {
        if ((currentChunk + "\n" + line).length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = line;
        } else {
          currentChunk += (currentChunk ? "\n" : "") + line;
        }
      }

      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
    }
  }

  return chunks.length > 0 ? chunks : [content.trim()];
}


async function main() {
  try {
    await ensureDb();
    
    // Register v2 routes
    await app.register(brainV2Routes);
    
    const port = Number(process.env.PORT ?? 4100);
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`codex-brain listening on :${port}`);
    
    // Start memory growth monitor
    startMemoryWatcher();
  } catch (err) {
    // Avoid logging raw objects that show as [Object: null prototype]
    console.error("codex-brain startup error:", err instanceof Error ? err.message : JSON.stringify(err));
    process.exit(1);
  }
}

main();
