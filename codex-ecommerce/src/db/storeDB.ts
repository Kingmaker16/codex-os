/**
 * E-Commerce Engine v2 - Database Layer
 * SQLite-based storage for stores, products, orders, and analytics
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'ecommerce.db');

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    theme TEXT DEFAULT 'modern',
    status TEXT DEFAULT 'draft',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    images TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT,
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    fulfillment_status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    metric TEXT NOT NULL,
    value REAL NOT NULL,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT,
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS research_cache (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    query TEXT NOT NULL,
    results TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

export interface Store {
  id: string;
  name: string;
  domain?: string;
  theme?: string;
  status?: string;
  created_at?: number;
  updated_at?: number;
  metadata?: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  images?: string;
  category?: string;
  status?: string;
  created_at?: number;
  metadata?: string;
}

export interface Order {
  id: string;
  store_id: string;
  product_id: string;
  customer_email: string;
  amount: number;
  currency?: string;
  status?: string;
  fulfillment_status?: string;
  created_at?: number;
  metadata?: string;
}

export interface Analytic {
  id?: number;
  store_id: string;
  metric: string;
  value: number;
  timestamp?: number;
  metadata?: string;
}

export const storeDB = {
  // Store operations
  createStore: (store: Store) => {
    const stmt = db.prepare(`
      INSERT INTO stores (id, name, domain, theme, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      store.id,
      store.name,
      store.domain || null,
      store.theme || 'modern',
      store.status || 'draft',
      store.metadata || null
    );
  },

  getStore: (id: string): Store | undefined => {
    const stmt = db.prepare('SELECT * FROM stores WHERE id = ?');
    return stmt.get(id) as Store | undefined;
  },

  listStores: (): Store[] => {
    const stmt = db.prepare('SELECT * FROM stores ORDER BY created_at DESC');
    return stmt.all() as Store[];
  },

  updateStore: (id: string, updates: Partial<Store>) => {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const values = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => updates[k as keyof Store]);
    
    const stmt = db.prepare(`
      UPDATE stores 
      SET ${fields}, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    return stmt.run(...values, id);
  },

  // Product operations
  createProduct: (product: Product) => {
    const stmt = db.prepare(`
      INSERT INTO products (id, store_id, name, description, price, currency, images, category, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      product.id,
      product.store_id,
      product.name,
      product.description || null,
      product.price,
      product.currency || 'USD',
      product.images || null,
      product.category || null,
      product.status || 'active',
      product.metadata || null
    );
  },

  getProduct: (id: string): Product | undefined => {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id) as Product | undefined;
  },

  listProducts: (storeId: string): Product[] => {
    const stmt = db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC');
    return stmt.all(storeId) as Product[];
  },

  // Order operations
  createOrder: (order: Order) => {
    const stmt = db.prepare(`
      INSERT INTO orders (id, store_id, product_id, customer_email, amount, currency, status, fulfillment_status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      order.id,
      order.store_id,
      order.product_id,
      order.customer_email,
      order.amount,
      order.currency || 'USD',
      order.status || 'pending',
      order.fulfillment_status || 'pending',
      order.metadata || null
    );
  },

  listOrders: (storeId: string): Order[] => {
    const stmt = db.prepare('SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC');
    return stmt.all(storeId) as Order[];
  },

  updateOrder: (id: string, updates: Partial<Order>) => {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const values = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => updates[k as keyof Order]);
    
    const stmt = db.prepare(`UPDATE orders SET ${fields} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  // Analytics operations
  recordAnalytic: (analytic: Analytic) => {
    const stmt = db.prepare(`
      INSERT INTO analytics (store_id, metric, value, metadata)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      analytic.store_id,
      analytic.metric,
      analytic.value,
      analytic.metadata || null
    );
  },

  getAnalytics: (storeId: string, metric?: string): Analytic[] => {
    let query = 'SELECT * FROM analytics WHERE store_id = ?';
    const params: any[] = [storeId];
    
    if (metric) {
      query += ' AND metric = ?';
      params.push(metric);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT 100';
    const stmt = db.prepare(query);
    return stmt.all(...params) as Analytic[];
  },

  // Research cache operations
  cacheResearch: (id: string, type: string, query: string, results: any) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO research_cache (id, type, query, results)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(id, type, query, JSON.stringify(results));
  },

  getResearchCache: (id: string) => {
    const stmt = db.prepare('SELECT * FROM research_cache WHERE id = ?');
    const row = stmt.get(id) as any;
    if (row) {
      row.results = JSON.parse(row.results);
    }
    return row;
  }
};

export default storeDB;
