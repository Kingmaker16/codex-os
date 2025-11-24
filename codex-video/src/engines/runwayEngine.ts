export async function runwayGenerate(script: string) {
  return {
    ok: true,
    engine: "runway",
    path: "runway_output.mp4"
  };
}

export async function generateFromTemplate(templateScript: string, options: {
  aspectRatio?: string;
  durationSec?: number;
}): Promise<{ ok: boolean; engine: string; path?: string; error?: string }> {
  // TODO: integrate with real Runway API (https://api.runwayml.com/v1)
  // - Use templateScript as prompt for Gen-3 Alpha Turbo
  // - Map aspectRatio to Runway format (1280x768, 768x1280, 768x768)
  // - Set duration_seconds from durationSec (4-10 seconds supported)
  // - Poll for generation status and download result
  // For now, stub a response:
  return {
    ok: true,
    engine: "runway",
    path: `runway_template_${Date.now()}.mp4`
  };
}
