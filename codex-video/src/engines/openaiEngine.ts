export async function openaiGenerate(script: string) {
  return {
    ok: true,
    engine: "openai",
    path: "openai_output.mp4"
  };
}

export async function generateFromTemplate(templateScript: string, options: {
  aspectRatio?: string;
  durationSec?: number;
}): Promise<{ ok: boolean; engine: string; path?: string; error?: string }> {
  // TODO: integrate with real OpenAI Sora API (when available)
  // - Use templateScript as prompt for Sora video generation
  // - Configure resolution based on aspectRatio
  // - Set duration parameter (Sora supports up to 60 seconds)
  // - Wait for video generation and download result
  // Alternative: Use DALL-E for static frames + assembly
  // For now, stub a response:
  return {
    ok: true,
    engine: "openai",
    path: `openai_template_${Date.now()}.mp4`
  };
}
