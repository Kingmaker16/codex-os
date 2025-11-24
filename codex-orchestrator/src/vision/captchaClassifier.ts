export type CaptchaType =
  | "grid"
  | "slider"
  | "object-select"
  | "rotate"
  | "text-fuzzy"
  | "ui-element"
  | "unknown";

export function classifyCaptcha(textDescription: string): CaptchaType {
  const lower = textDescription.toLowerCase();

  // Grid-based image selection (most common)
  if (
    lower.includes("select all") ||
    lower.includes("tiles") ||
    lower.includes("9 images") ||
    lower.includes("grid") ||
    lower.includes("images containing") ||
    lower.includes("traffic lights") ||
    lower.includes("bicycles") ||
    lower.includes("crosswalks") ||
    lower.includes("fire hydrants") ||
    lower.includes("buses") ||
    lower.includes("cars") ||
    lower.includes("stairs")
  ) {
    return "grid";
  }

  // Slider/puzzle CAPTCHA
  if (
    lower.includes("drag") ||
    lower.includes("slide") ||
    lower.includes("puzzle") ||
    lower.includes("move") ||
    lower.includes("adjust") ||
    lower.includes("slider")
  ) {
    return "slider";
  }

  // Rotation-based CAPTCHA
  if (
    lower.includes("rotate") ||
    lower.includes("upright") ||
    lower.includes("correct orientation") ||
    lower.includes("turn") ||
    lower.includes("flip")
  ) {
    return "rotate";
  }

  // Object selection (click specific object)
  if (
    lower.includes("click the") ||
    lower.includes("find the") ||
    lower.includes("select the") ||
    lower.includes("tap the") ||
    lower.includes("choose the")
  ) {
    return "object-select";
  }

  // Fuzzy/distorted text CAPTCHA
  if (
    lower.includes("distorted") ||
    lower.includes("letters") ||
    lower.includes("characters") ||
    lower.includes("text") ||
    lower.includes("read") ||
    lower.includes("type")
  ) {
    return "text-fuzzy";
  }

  // UI element detection (navigation, buttons, etc.)
  if (
    lower.includes("button") ||
    lower.includes("menu") ||
    lower.includes("navigate") ||
    lower.includes("ui") ||
    lower.includes("interface")
  ) {
    return "ui-element";
  }

  return "unknown";
}
