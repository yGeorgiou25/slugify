/**
 * Core slugify logic, isolated from the public entry point so it can be
 * unit-tested directly and re-used by callers who want the raw function
 * without any framework-specific wrapper.
 */

/**
 * A small, hand-maintained map of characters Unicode's NFKD decomposition
 * leaves behind as combining marks or visually-distinct singletons.
 *
 * We rely on String.prototype.normalize('NFKD') for the bulk of accent
 * stripping, but a few characters survive that process as non-ASCII
 * codepoints (e.g. ñ -> n + combining tilde works, but ø -> ø does not,
 * and ß -> ss is a compatibility decomposition we handle explicitly).
 *
 * Keeping this list short and explicit is a deliberate trade-off: a full
 * transliteration table would be larger and harder to audit, while a
 * dependency like 'unidecode' would violate the zero-dependency rule.
 * The entries below cover the cases that actually appear in Latin-script
 * titles; anything outside that set is dropped by the fallback.
 */
const MANUAL_TRANSLITERATIONS = {
  ø: 'o', Ø: 'o',
  æ: 'ae', Æ: 'ae',
  ß: 'ss',
  ð: 'd', Ð: 'd',
  þ: 'th', Þ: 'th',
  ł: 'l', Ł: 'l',
  œ: 'oe', Œ: 'oe',
};

/**
 * Strip combining diacritical marks left behind by NFKD normalisation.
 *
 * NFKD splits accented letters (e.g. é) into a base letter plus a combining
 * mark (e + U+0301). Removing U+0300–U+036F leaves the base letter behind,
 * which is exactly what a URL slug wants. We do this before dropping other
 * non-ASCII so that the base letter is preserved.
 */
function stripCombiningMarks(str) {
  // U+0300–U+036F is the Combining Diacritical Marks block.
  return str.replace(/[\u0300-\u036f]/g, '');
}

/**
 * Apply the manual transliteration table, then NFKD-normalise and strip
 * combining marks. Returns lowercase ASCII-ish text.
 */
function transliterate(str) {
  let out = '';
  for (const ch of str) {
    out += MANUAL_TRANSLITERATIONS[ch] ?? ch;
  }
  // NFKD first so compatibility characters decompose, then strip marks.
  out = out.normalize('NFKD');
  out = stripCombiningMarks(out);
  return out;
}

/**
 * Default options. Kept as a frozen object so callers can safely spread it.
 */
export const DEFAULT_OPTIONS = Object.freeze({
  separator: '-',
  lower: true,
  strict: false,
});

/**
 * Convert a title into a URL-safe slug.
 *
 * @param {string} input - The title to slugify.
 * @param {object} [options]
 * @param {string} [options.separator='-'] - Character(s) placed between words.
 * @param {boolean} [options.lower=true] - Lowercase the output.
 * @param {boolean} [options.strict=false] - If true, strip every character
 *   that is not [a-z0-9] (case-insensitive). If false, allow word characters
 *   and underscores through, which preserves things like underscores already
 *   present in the input.
 * @returns {string} The slug.
 */
export function slugify(input, options = {}) {
  if (typeof input !== 'string') {
    throw new TypeError(`slugify expected a string, got ${typeof input}`);
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  let str = transliterate(input);

  if (opts.lower) {
    str = str.toLowerCase();
  }

  if (opts.strict) {
    // In strict mode we keep only ASCII alphanumerics; everything else
    // becomes a separator boundary.
    str = str.replace(/[^a-z0-9]+/gi, opts.separator);
  } else {
    // Non-strict: collapse any run of non-word characters (where "word"
    // means [A-Za-z0-9_]) into a single separator. This keeps underscores
    // that were intentionally in the title.
    str = str.replace(/[^\w]+/g, opts.separator);
  }

  // Trim separators from both ends.
  const sepEscape = opts.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  str = str.replace(new RegExp(`^${sepEscape}+|${sepEscape}+$`, 'g'), '');

  // Collapse runs of the separator that may have been introduced by adjacent
  // replacement boundaries or by a multi-character separator.
  if (opts.separator.length === 1) {
    str = str.replace(new RegExp(`${sepEscape}{2,}`, 'g'), opts.separator);
  }

  return str;
}
