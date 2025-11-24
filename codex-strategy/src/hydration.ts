import fetch from "node-fetch";

const KNOWLEDGE_ENGINE_URL = "http://localhost:4500";

/**
 * Initialize Strategic Intelligence Layer on startup
 * - Verify Knowledge Engine connectivity
 * - Warm up domain kernels
 * - Log hydration to Brain
 */
export async function initHydration(): Promise<void> {
  console.log("[Hydration] Starting SIL v1 hydration...");
  
  try {
    // Check Knowledge Engine availability
    const healthCheck = await fetch(`${KNOWLEDGE_ENGINE_URL}/health`, {
      method: "GET"
    }).catch(() => null);
    
    if (!healthCheck || !healthCheck.ok) {
      console.warn("[Hydration] Knowledge Engine not available at", KNOWLEDGE_ENGINE_URL);
      console.warn("[Hydration] Continuing without Knowledge Engine enrichment");
      return;
    }
    
    console.log("[Hydration] Knowledge Engine connected");
    
    // Verify domain kernels exist
    const domains = ["ecomm", "social", "trading", "kingmaker", "creative"];
    
    try {
      const kernelsResponse = await fetch(`${KNOWLEDGE_ENGINE_URL}/kernels`, {
        method: "GET"
      });
      
      if (kernelsResponse.ok) {
        const kernelsData: any = await kernelsResponse.json();
        console.log(`[Hydration] Knowledge Engine has ${kernelsData.kernels?.length || 0} kernels available`);
        
        // Check which strategy domains have corresponding kernels
        for (const domain of domains) {
          const hasKernel = kernelsData.kernels?.some((k: any) => 
            k.id === domain || k.name?.toLowerCase().includes(domain)
          );
          
          if (hasKernel) {
            console.log(`[Hydration] ✓ Domain '${domain}' kernel found`);
          } else {
            console.log(`[Hydration] ⚠ Domain '${domain}' kernel not found (will use base playbooks)`);
          }
        }
      }
    } catch (error) {
      console.warn("[Hydration] Could not verify kernels:", error);
    }
    
    console.log("[Hydration] SIL v1 hydration complete");
    
    // TODO: Log hydration event to Brain
    // await logToBrain({
    //   sessionId: "sil-hydration",
    //   event: "hydration_complete",
    //   timestamp: new Date().toISOString(),
    //   details: { domains, knowledgeEngineAvailable: true }
    // });
    
  } catch (error) {
    console.error("[Hydration] Hydration failed:", error);
    console.log("[Hydration] SIL will operate with base playbooks only");
  }
}

/**
 * TODO: Enhanced hydration features
 * - Preload recent strategy plans from Brain
 * - Cache top-performing plays from history
 * - Warm up model connections (OpenAI, Claude, Gemini, Grok)
 * - Sync with Monetization Engine for cost tracking
 * - Load user preferences and constraints
 */
