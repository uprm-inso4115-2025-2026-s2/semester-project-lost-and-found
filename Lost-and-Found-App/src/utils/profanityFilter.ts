import { PROFANITY_LIST } from "./profanityList";

/**
 * Checks if the input text contains any profane words.
 * @param text The text to check.
 * @returns {boolean} True if profanity is found, false otherwise.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return PROFANITY_LIST.some(word =>
    lowerText.includes(word.toLowerCase())
  );
}

/**
 * Optionally, you can use this to censor profane words (replace with asterisks)
 */
export function censorProfanity(text: string): string {
  let censored = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, "gi");
    censored = censored.replace(regex, "*".repeat(word.length));
  });
  return censored;
}
