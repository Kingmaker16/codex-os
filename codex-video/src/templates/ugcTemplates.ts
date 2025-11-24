export interface UGCTemplate {
  id: string;
  name: string;
  type: "ugc" | "ad" | "testimonial" | "pov" | "unboxing";
  script: string;
  mood: string;
  shotList: Array<{ type: string; description: string }>;
}

export const UGC_TEMPLATES: UGCTemplate[] = [
  {
    id: "problem-solution",
    name: "Problem → Agitation → Solution",
    type: "ad",
    script: "Tired of [PROBLEM]? Let me show you [PRODUCT] that fixes it in seconds.",
    mood: "energetic",
    shotList: [
      { type: "talking_head", description: "Person looking frustrated with problem" },
      { type: "problem_demo", description: "Show the painful problem scenario" },
      { type: "product_reveal", description: "Dramatic product reveal with lighting" },
      { type: "product_action", description: "Show product solving the problem" },
      { type: "transformation", description: "Happy result shot with satisfied customer" }
    ]
  },
  {
    id: "testimonial",
    name: "Customer Testimonial",
    type: "testimonial",
    script: "I was skeptical at first, but [PRODUCT] completely changed my [ASPECT]. Here's my story...",
    mood: "authentic",
    shotList: [
      { type: "talking_head", description: "Customer speaking directly to camera" },
      { type: "before_shot", description: "Show before situation" },
      { type: "product_use", description: "Customer using product naturally" },
      { type: "after_shot", description: "Show positive results" },
      { type: "closeup", description: "Emotional closeup of satisfied customer" }
    ]
  },
  {
    id: "unboxing",
    name: "Unboxing Experience",
    type: "unboxing",
    script: "Let's unbox [PRODUCT] together! Watch what's inside and my first impressions...",
    mood: "exciting",
    shotList: [
      { type: "package_arrival", description: "Package on doorstep or in hands" },
      { type: "opening", description: "Opening the box with anticipation" },
      { type: "reveal", description: "First look at product inside packaging" },
      { type: "product_details", description: "Close-ups of product features" },
      { type: "first_use", description: "Testing product for the first time" }
    ]
  },
  {
    id: "pov-lifestyle",
    name: "POV Lifestyle",
    type: "pov",
    script: "POV: You finally found [PRODUCT] and your life is about to get so much easier...",
    mood: "aspirational",
    shotList: [
      { type: "pov_approach", description: "First-person view approaching product" },
      { type: "pov_interaction", description: "Hands interacting with product" },
      { type: "pov_result", description: "POV of enjoying the benefit" },
      { type: "lifestyle_shot", description: "Product integrated into daily life" },
      { type: "satisfaction", description: "POV of contentment/success" }
    ]
  },
  {
    id: "three-reasons",
    name: "3 Reasons Why",
    type: "ad",
    script: "3 reasons why everyone is obsessed with [PRODUCT]: 1) [REASON], 2) [REASON], 3) [REASON]",
    mood: "educational",
    shotList: [
      { type: "hook", description: "Bold text overlay: '3 Reasons Why'" },
      { type: "reason_one", description: "Demo first feature/benefit" },
      { type: "reason_two", description: "Demo second feature/benefit" },
      { type: "reason_three", description: "Demo third feature/benefit" },
      { type: "cta", description: "Call-to-action with product showcase" }
    ]
  },
  {
    id: "before-after",
    name: "Before & After Transformation",
    type: "ugc",
    script: "I tried [PRODUCT] for [TIME_PERIOD]. Here's the before and after...",
    mood: "dramatic",
    shotList: [
      { type: "before_intro", description: "Show initial state/problem" },
      { type: "before_evidence", description: "Close-up of before condition" },
      { type: "product_intro", description: "Introduce product as solution" },
      { type: "time_lapse", description: "Quick montage of usage over time" },
      { type: "after_reveal", description: "Dramatic after results reveal" },
      { type: "comparison", description: "Side-by-side before/after comparison" }
    ]
  },
  {
    id: "day-in-life",
    name: "Day in the Life with Product",
    type: "ugc",
    script: "Day in my life using [PRODUCT] - you won't believe how much it helps!",
    mood: "casual",
    shotList: [
      { type: "morning", description: "Morning routine with product" },
      { type: "midday", description: "Using product during day activities" },
      { type: "evening", description: "Product helping in evening routine" },
      { type: "benefits_recap", description: "Quick recap of benefits shown" },
      { type: "recommendation", description: "Personal recommendation to camera" }
    ]
  },
  {
    id: "myth-busting",
    name: "Myth Busting",
    type: "ad",
    script: "Everyone thinks [MYTH], but here's the truth about [PRODUCT]...",
    mood: "authoritative",
    shotList: [
      { type: "myth_statement", description: "Text overlay of common myth" },
      { type: "expert_intro", description: "Speaker introduces themselves" },
      { type: "truth_reveal", description: "Explain the actual truth" },
      { type: "product_demo", description: "Demo product proving the truth" },
      { type: "final_proof", description: "Evidence/results that confirm truth" }
    ]
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): UGCTemplate | undefined {
  return UGC_TEMPLATES.find(t => t.id === id);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): UGCTemplate[] {
  return UGC_TEMPLATES;
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: UGCTemplate["type"]): UGCTemplate[] {
  return UGC_TEMPLATES.filter(t => t.type === type);
}

/**
 * Get default template for ads
 */
export function getDefaultAdTemplate(): UGCTemplate {
  return UGC_TEMPLATES.find(t => t.id === "problem-solution")!;
}

/**
 * Get template by angle/keyword
 */
export function getTemplateByAngle(angle?: string): UGCTemplate {
  if (!angle) return getDefaultAdTemplate();
  
  const normalized = angle.toLowerCase();
  
  if (normalized.includes("list") || normalized.includes("reason")) {
    return UGC_TEMPLATES.find(t => t.id === "three-reasons")!;
  }
  if (normalized.includes("testimon")) {
    return UGC_TEMPLATES.find(t => t.id === "testimonial")!;
  }
  if (normalized.includes("unbox")) {
    return UGC_TEMPLATES.find(t => t.id === "unboxing")!;
  }
  if (normalized.includes("pov") || normalized.includes("lifestyle")) {
    return UGC_TEMPLATES.find(t => t.id === "pov-lifestyle")!;
  }
  if (normalized.includes("before") || normalized.includes("after") || normalized.includes("transform")) {
    return UGC_TEMPLATES.find(t => t.id === "before-after")!;
  }
  if (normalized.includes("myth")) {
    return UGC_TEMPLATES.find(t => t.id === "myth-busting")!;
  }
  if (normalized.includes("day")) {
    return UGC_TEMPLATES.find(t => t.id === "day-in-life")!;
  }
  
  return getDefaultAdTemplate();
}
