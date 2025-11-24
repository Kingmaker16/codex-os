import { fuseVisionResults, parseVisionResponse, VisionClick } from "./fusionEngine.js";
import { classifyCaptcha, CaptchaType } from "./captchaClassifier.js";

export interface VisionSolveOutput {
  ok: boolean;
  clicks?: VisionClick[];
  type?: CaptchaType;
  error?: string;
}

interface VisionRequest {
  sessionId: string;
  imageBase64: string;
  hint?: string;
  instructions?: string;
}

const BRIDGE_URL = "http://localhost:4000";

/**
 * Call a vision model via Bridge
 */
async function callVisionModel(
  provider: string,
  model: string,
  imageBase64: string,
  hint: string,
  instructions: string
): Promise<VisionClick[]> {
  const systemPrompt = `You are a vision analysis engine. Analyze images and identify clickable elements.
Return your response as valid JSON with this structure:
{
  "clicks": [
    { "x": 123, "y": 456, "confidence": 0.9, "selector": "optional-css-selector" }
  ]
}
Coordinates should be in pixel units for a 1440x900 viewport.
Confidence should be 0.0 to 1.0.`;

  const userPrompt = `${hint}\n\n${instructions}\n\nProvide up to 8 clicks with confidence scores.`;

  try {
    // Build content array with provider-specific image format
    let imageContent: any;
    if (provider === "claude") {
      // Claude uses "image" type with source object
      imageContent = {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: imageBase64,
        },
      };
    } else {
      // OpenAI uses "image_url" type
      imageContent = {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${imageBase64}` },
      };
    }

    const response = await fetch(
      `${BRIDGE_URL}/respond?provider=${provider}&model=${model}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                imageContent,
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `[Vision] ${provider} error:`,
        response.status,
        await response.text()
      );
      return [];
    }

    const data = (await response.json()) as any;
    const content = data.reply?.content || data.content || "";

    return parseVisionResponse(content);
  } catch (err) {
    console.error(`[Vision] ${provider} exception:`, err);
    return [];
  }
}

/**
 * Run hybrid vision analysis using OpenAI + Claude
 */
export async function runHybridVision(
  req: VisionRequest
): Promise<VisionSolveOutput> {
  const { sessionId, imageBase64, hint = "", instructions = "" } = req;

  // Classify CAPTCHA type based on hint + instructions
  const captchaType = classifyCaptcha(hint + " " + instructions);

  // Prepare instructions
  const defaultInstructions =
    instructions ||
    "Solve the visual challenge and return which elements to click. If grid, return approximate coordinates for tiles. If UI navigation, return button/element coordinates.";

  try {
    // Call both models in parallel
    const [openaiClicks, claudeClicks] = await Promise.all([
      callVisionModel(
        "openai",
        "gpt-4o",
        imageBase64,
        hint,
        defaultInstructions
      ),
      callVisionModel(
        "claude",
        "claude-3-5-sonnet-20241022",
        imageBase64,
        hint,
        defaultInstructions
      ),
    ]);

    console.log(
      `[Vision] OpenAI returned ${openaiClicks.length} clicks, Claude returned ${claudeClicks.length} clicks`
    );

    // Fuse results
    const fusedClicks = fuseVisionResults(openaiClicks, claudeClicks);

    console.log(`[Vision] Fused to ${fusedClicks.length} clicks`);

    // Check if we have any valid clicks
    if (fusedClicks.length === 0) {
      return {
        ok: false,
        error: "No valid clicks detected by vision models",
        type: captchaType,
      };
    }

    return {
      ok: true,
      clicks: fusedClicks,
      type: captchaType,
    };
  } catch (err: any) {
    console.error("[Vision] Hybrid vision error:", err);
    return {
      ok: false,
      error: err?.message || "Vision analysis failed",
      type: captchaType,
    };
  }
}
