/**
 * Player Display Name Moderation Utility
 *
 * Rules:
 * 1. Applies ONLY to PLAYER display names.
 * 2. Support English names.
 * 3. Allow normal letters (A-Z, a-z), spaces, hyphens (-), and apostrophes (').
 * 4. Reject clearly vulgar/abusive names using a reasonable curated English profanity filter.
 * 5. Handle obvious simple obfuscation attempts (e.g., leetspeak, punctuation insertion).
 * 6. Do NOT automatically reject ambiguous names like "XXX", "Dickson", "Assaad", etc.
 * 7. Show: "Please choose an appropriate player name."
 * 8. Keep profanity list private / unexposed in generic user messages.
 */

const PROFANITY_WORDS = new Set([
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "shitter",
  "shitting",
  "bitch",
  "bitches",
  "bitching",
  "cunt",
  "cunts",
  "asshole",
  "assholes",
  "motherfucker",
  "motherfucking",
  "bastard",
  "dickhead",
  "whore",
  "slut",
  "pussy",
  "pussies",
  "nigger",
  "niggers",
  "nigga",
  "faggot",
  "faggots",
  "wanker",
  "cockhead",
  "blowjob",
]);

const LEET_MAP = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "!": "i",
};

function normalizeText(text) {
  const lower = text.toLowerCase();
  let deLeeted = "";
  for (let ch of lower) {
    deLeeted += LEET_MAP[ch] || ch;
  }
  const collapsed = deLeeted.replace(/[\s\.\-_'"`]/g, "");
  return { lower, deLeeted, collapsed };
}

export function validatePlayerName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Please enter your full name." };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters long." };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Name cannot exceed 50 characters." };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const validCharsRegex = /^[a-zA-Z\s'-]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return { valid: false, error: "Please choose an appropriate player name." };
  }

  const { lower, collapsed } = normalizeText(trimmed);

  // Check individual words
  const words = lower.split(/[\s'-]+/);
  for (let word of words) {
    if (PROFANITY_WORDS.has(word)) {
      return { valid: false, error: "Please choose an appropriate player name." };
    }
  }

  // Check collapsed/obfuscated strings
  for (let badWord of PROFANITY_WORDS) {
    if (badWord.length >= 4 && collapsed.includes(badWord)) {
      if (collapsed === badWord || words.some((w) => w === badWord)) {
        return { valid: false, error: "Please choose an appropriate player name." };
      }
      const isObfuscated = words.length > 1 && words.join("").includes(badWord);
      if (isObfuscated) {
        return { valid: false, error: "Please choose an appropriate player name." };
      }
    }
  }

  return { valid: true, error: null };
}
