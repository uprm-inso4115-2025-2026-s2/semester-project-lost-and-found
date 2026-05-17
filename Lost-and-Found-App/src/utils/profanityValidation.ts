import { containsProfanity } from "../utils/profanityFilter";

export function validateProfanityAllFields(fields: Record<string, string | string[]>): string | null {
  
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && containsProfanity(value)) {
      return `Profanity detected in field: ${key}`;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        if (containsProfanity(v)) {
          return `Profanity detected in field: ${key}`;
        }
      }
    }
  }
  return null;
}
