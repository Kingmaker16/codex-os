/**
 * Social Engine v1 - Account Manager
 * 
 * Manages multi-account storage and retrieval
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { SocialAccount, CreateAccountRequest } from "./types.js";
import { CONFIG } from "./config.js";

const ACCOUNTS_FILE = join(process.cwd(), CONFIG.accountsFile);

let accounts: SocialAccount[] = [];

// Load accounts from disk on startup
export function loadAccounts(): SocialAccount[] {
  try {
    if (existsSync(ACCOUNTS_FILE)) {
      const data = readFileSync(ACCOUNTS_FILE, "utf-8");
      accounts = JSON.parse(data);
      console.log(`[AccountManager] Loaded ${accounts.length} accounts`);
    } else {
      accounts = [];
      saveAccounts(); // Create empty file
      console.log("[AccountManager] Created new accounts file");
    }
  } catch (error: any) {
    console.error("[AccountManager] Failed to load accounts:", error.message);
    accounts = [];
  }
  return accounts;
}

// Save accounts to disk
function saveAccounts(): void {
  try {
    writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (error: any) {
    console.error("[AccountManager] Failed to save accounts:", error.message);
  }
}

// Create new account
export function createAccount(request: CreateAccountRequest): SocialAccount {
  const account: SocialAccount = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    platform: request.platform,
    username: request.username,
    email: request.email,
    loginState: "pending",
    niche: request.niche,
    postingStyle: request.postingStyle,
    proxy: request.proxy,
    createdAt: new Date().toISOString()
  };

  accounts.push(account);
  saveAccounts();
  
  console.log(`[AccountManager] Created account: ${account.id} (${account.platform})`);
  return account;
}

// Get account by ID
export function getAccount(accountId: string): SocialAccount | undefined {
  return accounts.find(acc => acc.id === accountId);
}

// Get all accounts
export function getAllAccounts(): SocialAccount[] {
  return accounts;
}

// Get accounts by platform
export function getAccountsByPlatform(platform: string): SocialAccount[] {
  return accounts.filter(acc => acc.platform === platform);
}

// Update account
export function updateAccount(accountId: string, updates: Partial<SocialAccount>): SocialAccount | undefined {
  const account = getAccount(accountId);
  if (!account) {
    console.warn(`[AccountManager] Account not found: ${accountId}`);
    return undefined;
  }

  Object.assign(account, updates);
  saveAccounts();
  
  console.log(`[AccountManager] Updated account: ${accountId}`);
  return account;
}

// Delete account
export function deleteAccount(accountId: string): boolean {
  const index = accounts.findIndex(acc => acc.id === accountId);
  if (index === -1) {
    console.warn(`[AccountManager] Account not found: ${accountId}`);
    return false;
  }

  accounts.splice(index, 1);
  saveAccounts();
  
  console.log(`[AccountManager] Deleted account: ${accountId}`);
  return true;
}

// Update login state
export function updateLoginState(
  accountId: string, 
  state: SocialAccount["loginState"],
  retentionToken?: string
): void {
  const account = getAccount(accountId);
  if (!account) return;

  account.loginState = state;
  if (state === "logged_in") {
    account.lastLogin = new Date().toISOString();
    if (retentionToken) {
      account.retentionToken = retentionToken;
    }
  }
  
  saveAccounts();
}
