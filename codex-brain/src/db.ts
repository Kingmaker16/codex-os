import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";

const DB_DIR = path.resolve(process.cwd(), "codex-brain-data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, "codex-brain.db");

let dbPromise: Promise<Database> | null = null;

export async function ensureDb(): Promise<Database> {
  if (!dbPromise) {
    sqlite3.verbose();
    dbPromise = open({ filename: DB_PATH, driver: sqlite3.Database });
    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT,
        kind TEXT,
        json TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        docId TEXT UNIQUE,
        domain TEXT,
        type TEXT,
        title TEXT,
        source TEXT,
        tags TEXT,
        ingestedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS doc_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        docId TEXT,
        chunkIndex INTEGER,
        content TEXT,
        createdAt TEXT
      );
    `);
  }
  return dbPromise;
}

export async function insertEvent(eventRow: { sessionId: string; kind: string; json: string; createdAt?: string }): Promise<void> {
  const db = await ensureDb();
  const createdAt = eventRow.createdAt ?? new Date().toISOString();
  await db.run(
    `INSERT INTO events (sessionId, kind, json, createdAt) VALUES (?, ?, ?, ?)`,
    eventRow.sessionId,
    eventRow.kind,
    eventRow.json,
    createdAt
  );
}

export async function getEventsBySession(sessionId: string, limit = 100): Promise<any[]> {
  const db = await ensureDb();
  const rows = await db.all(`SELECT * FROM events WHERE sessionId = ? ORDER BY id DESC LIMIT ?`, sessionId, limit);
  return rows;
}

export async function getRecentEvents(limit = 100): Promise<any[]> {
  const db = await ensureDb();
  const rows = await db.all(`SELECT * FROM events ORDER BY id DESC LIMIT ?`, limit);
  return rows;
}

// Knowledge Engine v1 - Document Management

export async function insertDocument(doc: {
  docId: string;
  domain: string;
  type: string;
  title: string;
  source: string;
  tags?: string;
  ingestedAt: string;
}): Promise<void> {
  const db = await ensureDb();
  await db.run(
    `INSERT INTO documents (docId, domain, type, title, source, tags, ingestedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    doc.docId,
    doc.domain,
    doc.type,
    doc.title,
    doc.source,
    doc.tags ?? null,
    doc.ingestedAt
  );
}

export async function insertChunk(chunk: {
  docId: string;
  chunkIndex: number;
  content: string;
  createdAt: string;
}): Promise<void> {
  const db = await ensureDb();
  await db.run(
    `INSERT INTO doc_chunks (docId, chunkIndex, content, createdAt) VALUES (?, ?, ?, ?)`,
    chunk.docId,
    chunk.chunkIndex,
    chunk.content,
    chunk.createdAt
  );
}

export async function getDocumentsByDomain(domain: string): Promise<
  { docId: string; title: string; type: string; source: string; tags: string | null; ingestedAt: string }[]
> {
  const db = await ensureDb();
  const rows = await db.all(
    `SELECT docId, title, type, source, tags, ingestedAt FROM documents WHERE domain = ? ORDER BY ingestedAt DESC`,
    domain
  );
  return rows;
}

export async function getAllDocuments(): Promise<
  { docId: string; domain: string; title: string; type: string; source: string; tags: string | null; ingestedAt: string }[]
> {
  const db = await ensureDb();
  const rows = await db.all(
    `SELECT docId, domain, title, type, source, tags, ingestedAt FROM documents ORDER BY ingestedAt DESC`
  );
  return rows;
}

export async function getChunksByDocId(docId: string): Promise<
  { chunkIndex: number; content: string }[]
> {
  const db = await ensureDb();
  const rows = await db.all(
    `SELECT chunkIndex, content FROM doc_chunks WHERE docId = ? ORDER BY chunkIndex ASC`,
    docId
  );
  return rows;
}
