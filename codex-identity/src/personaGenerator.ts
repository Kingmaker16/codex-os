import { Persona } from "./types.js";

const voices = [
  "energetic and direct",
  "calm and instructive",
  "humorous and witty",
  "authoritative",
  "friendly and conversational"
];

export function generatePersona(niche: string): Persona {
  return {
    name: niche + "_persona_" + Math.floor(Math.random() * 1000),
    voice: voices[Math.floor(Math.random() * voices.length)],
    niche,
    targetAudience: "people interested in " + niche,
    styleTraits: ["authentic", "hook-driven", "algorithm-friendly"]
  };
}
