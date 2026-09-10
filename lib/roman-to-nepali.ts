/**
 * Romanized Nepali → Devanagari Unicode.
 * Dictionary for common words, then longest-match phonetic conversion.
 */

const WORD_DICT: Record<string, string> = {
  nepal: "नेपाल",
  nepali: "नेपाली",
  samachar: "समाचार",
  samacharpatra: "समाचारपत्र",
  namaste: "नमस्ते",
  dhanyabad: "धन्यवाद",
  dhanyavaad: "धन्यवाद",
  kathmandu: "काठमाडौँ",
  kathmandau: "काठमाडौँ",
  sarkar: "सरकार",
  desh: "देश",
  bikas: "विकास",
  bikash: "विकास",
  raajneeti: "राजनीति",
  rajneeti: "राजनीति",
  hami: "हामी",
  haru: "हरू",
  timi: "तिमी",
  tapai: "तपाईं",
  tapaai: "तपाईं",
  lai: "लाई",
  bata: "बाट",
  ra: "र",
  ani: "अनि",
  tara: "तर",
  kinaki: "किनकि",
  kinabhane: "किनभने",
  aaja: "आज",
  hijo: "हिजो",
  bholi: "भोलि",
  ghar: "घर",
  manche: "मान्छे",
  manchhe: "मान्छे",
  khabar: "खबर",
  setopati: "सेतोपाटी",
  online: "अनलाइन",
  echo: "इको",
  manch: "मञ्च",
  mancha: "मञ्च",
};

type VowelRule = { roman: string; independent: string; matra: string };
type ConsonantRule = { roman: string; letter: string };

/** Vowels longest-first. Empty matra = inherent अ (consumed, no sign). */
const VOWELS: VowelRule[] = [
  { roman: "aa", independent: "आ", matra: "ा" },
  { roman: "ii", independent: "ई", matra: "ी" },
  { roman: "ee", independent: "ई", matra: "ी" },
  { roman: "uu", independent: "ऊ", matra: "ू" },
  { roman: "oo", independent: "ऊ", matra: "ू" },
  { roman: "ai", independent: "ऐ", matra: "ै" },
  { roman: "au", independent: "औ", matra: "ौ" },
  { roman: "ri", independent: "ऋ", matra: "ृ" },
  { roman: "a", independent: "अ", matra: "" },
  { roman: "i", independent: "इ", matra: "ि" },
  { roman: "u", independent: "उ", matra: "ु" },
  { roman: "e", independent: "ए", matra: "े" },
  { roman: "o", independent: "ओ", matra: "ो" },
].sort((a, b) => b.roman.length - a.roman.length);

/** Consonant bases without inherent vowel (longest-first). */
const CONSONANTS: ConsonantRule[] = [
  { roman: "chh", letter: "छ" },
  { roman: "ksh", letter: "क्ष" },
  { roman: "gy", letter: "ज्ञ" },
  { roman: "shr", letter: "श्र" },
  { roman: "tr", letter: "त्र" },
  { roman: "kh", letter: "ख" },
  { roman: "gh", letter: "घ" },
  { roman: "ch", letter: "च" },
  { roman: "jh", letter: "झ" },
  { roman: "th", letter: "थ" },
  { roman: "dh", letter: "ध" },
  { roman: "ph", letter: "फ" },
  { roman: "bh", letter: "भ" },
  { roman: "sh", letter: "श" },
  { roman: "ng", letter: "ङ" },
  { roman: "yn", letter: "ञ" },
  { roman: "k", letter: "क" },
  { roman: "g", letter: "ग" },
  { roman: "j", letter: "ज" },
  { roman: "t", letter: "त" },
  { roman: "d", letter: "द" },
  { roman: "n", letter: "न" },
  { roman: "p", letter: "प" },
  { roman: "f", letter: "फ" },
  { roman: "b", letter: "ब" },
  { roman: "m", letter: "म" },
  { roman: "y", letter: "य" },
  { roman: "r", letter: "र" },
  { roman: "l", letter: "ल" },
  { roman: "w", letter: "व" },
  { roman: "v", letter: "व" },
  { roman: "s", letter: "स" },
  { roman: "h", letter: "ह" },
].sort((a, b) => b.roman.length - a.roman.length);

const DIGITS: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

function startsWithRoman(input: string, i: number, roman: string): boolean {
  return input.slice(i, i + roman.length) === roman;
}

function findVowel(input: string, i: number): VowelRule | null {
  for (const v of VOWELS) {
    if (startsWithRoman(input, i, v.roman)) return v;
  }
  return null;
}

function findConsonant(input: string, i: number): ConsonantRule | null {
  for (const c of CONSONANTS) {
    if (startsWithRoman(input, i, c.roman)) return c;
  }
  return null;
}

function convertWordPhonetic(word: string): string {
  const input = word.toLowerCase();
  let out = "";
  let i = 0;
  let pendingHalant = false;

  while (i < input.length) {
    const cons = findConsonant(input, i);
    if (cons) {
      if (pendingHalant) out += "्";
      out += cons.letter;
      i += cons.roman.length;

      const vowel = findVowel(input, i);
      if (vowel) {
        if (vowel.matra) out += vowel.matra;
        i += vowel.roman.length;
        pendingHalant = false;
      } else {
        // No vowel yet — may form a conjunct with the next consonant
        pendingHalant = true;
      }
      continue;
    }

    const vowel = findVowel(input, i);
    if (vowel) {
      pendingHalant = false;
      out += vowel.independent;
      i += vowel.roman.length;
      continue;
    }

    const ch = word[i] ?? input[i];
    pendingHalant = false;
    out += DIGITS[ch] ?? ch;
    i += 1;
  }

  return out;
}

function convertWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  if (WORD_DICT[lower]) return WORD_DICT[lower];
  return convertWordPhonetic(word);
}

/** Convert romanized Nepali (mixed with spaces/punctuation) to Devanagari. */
export function romanToNepali(text: string): string {
  if (!text) return "";
  return text.replace(/[A-Za-z]+/g, (word) => convertWord(word));
}
