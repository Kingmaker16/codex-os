import { v4 as uuid } from "uuid";
import { SAFE_ROOT } from "./types.js";

export function generateId(): string {
  return uuid();
}

export function validatePath(path: string): boolean {
  return path.startsWith(SAFE_ROOT);
}

export function timestamp(): string {
  return new Date().toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}
