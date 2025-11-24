export interface CaptchaProviderConfig {
  enabled: boolean;
  apiKey: string;
  provider: "generic-token-service"; // placeholder name
  endpoint: string; // e.g. "https://api.example-captcha.com/solve"
}

export function getCaptchaConfig(): CaptchaProviderConfig {
  const enabled = process.env.CAPTCHA_ENABLED === "true";
  const apiKey = process.env.CAPTCHA_API_KEY || "";
  const endpoint =
    process.env.CAPTCHA_ENDPOINT || "https://example-captcha.com/solve";

  return {
    enabled,
    apiKey,
    provider: "generic-token-service",
    endpoint,
  };
}
