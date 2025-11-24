import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { IModelProvider } from "./providers/types.js";

export async function loadProviders(dir?: string): Promise<Record<string, IModelProvider>> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const providersDir = dir ? path.resolve(dir) : path.resolve(__dirname, "providers");

  const result: Record<string, IModelProvider> = {};

  if (!fs.existsSync(providersDir)) return result;

  // If an Anthropic API key is present, try to load a real Claude provider first
  const preferAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  if (preferAnthropic) {
    const candidates = ["anthropicProvider.ts", "anthropicProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  // If an OpenAI API key is present, try to load a real OpenAI provider next
  const preferReal = Boolean(process.env.OPENAI_API_KEY);
  if (preferReal) {
    const candidates = ["openaiRealProvider.ts", "openaiRealProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                // prefer real provider: do not overwrite later
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  // If an XAI API key is present, try to load a real Grok provider next
  const preferXai = Boolean(process.env.XAI_API_KEY);
  if (preferXai) {
    const candidates = ["grokProvider.ts", "grokProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  // If a Google API key is present, try to load a real Gemini provider next
  const preferGoogle = Boolean(process.env.GOOGLE_API_KEY);
  if (preferGoogle) {
    const candidates = ["geminiProvider.ts", "geminiProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  // If a Manus API key is present, try to load a real Manus provider next
  const preferManus = Boolean(process.env.MANUS_API_KEY);
  if (preferManus) {
    const candidates = ["manusProvider.ts", "manusProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  // If a Qwen API key is present, try to load Qwen provider next
  const preferQwen = Boolean(process.env.QWEN_API_KEY);
  if (preferQwen) {
    const candidates = ["qwenProvider.ts", "qwenProvider.js"];
    for (const c of candidates) {
      const p = path.join(providersDir, c);
      if (fs.existsSync(p)) {
        try {
          const mod = await import(pathToFileURL(p).href);
          const exports = Object.values(mod);
          for (const exp of exports) {
            if (typeof exp !== "function") continue;
            try {
              const inst = new (exp as any)();
              const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
                && typeof inst.respond === "function" && typeof inst.health === "function";
              if (ok) {
                if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (err) {
          console.warn(`failed to import preferred provider file ${c}:`, (err as Error).message);
        }
        break;
      }
    }
  }

  const files = fs.readdirSync(providersDir).filter(f => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(providersDir, file);
    try {
      const mod = await import(pathToFileURL(filePath).href);
      const exports = Object.values(mod);
      for (const exp of exports) {
        try {
          if (typeof exp !== "function") continue;
          // attempt to instantiate (provider classes have no constructor args in this repo)
          const inst = new (exp as any)();
          const ok = inst && typeof inst.name === "string" && Array.isArray(inst.models)
            && typeof inst.respond === "function" && typeof inst.health === "function";
          if (ok) {
            // don't overwrite providers that were preferred/loaded already
            if (!result[inst.name]) result[inst.name] = inst as IModelProvider;
          }
        } catch (e) {
          // ignore non-instantiable exports
          continue;
        }
      }
    } catch (err) {
      // skip files that fail to import
      // eslint-disable-next-line no-console
      console.warn(`failed to import provider file ${file}:`, (err as Error).message);
      continue;
    }
  }

  return result;
}
