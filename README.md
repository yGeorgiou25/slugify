# Slugify

Convert a title into a URL-safe slug. Zero dependencies, ESM only.

```js
import { slugify } from './src/index.js';

slugify('Café Crème!');        // 'cafe-creme'
slugify('Hello World', { separator: '_' });  // 'hello_world'
slugify('hello_world', { strict: true });    // 'hello-world'
```

## Why

Most slugify libraries pull in a Unicode transliteration table or a full
normalisation dependency. This one ships a tiny hand-maintained map for the
Latin-script characters that `NFKD` decomposition does not handle on its own
(ø, æ, ß, ð, þ, ł, œ) and relies on `String.prototype.normalize('NFKD')` plus
combining-mark stripping for everything else. The trade-off is coverage: titles
in non-Latin scripts will have their characters dropped rather than
phonetically transliterated. That is an acceptable choice for a URL slug, where
the goal is a stable, readable identifier rather than a faithful romanisation.

## Edge cases

- Non-ASCII characters without a transliteration entry are removed, not
  approximated. A Cyrillic title produces an empty slug in strict mode.
- In the default (non-strict) mode, underscores in the input are preserved.
  Pass `{ strict: true }` to collapse them into separators.
- Input that is entirely punctuation returns an empty string.

## API

### `slugify(input, options?)`

- `input` — string to convert.
- `options.separator` — string placed between words. Default `'-'`.
- `options.lower` — lowercase the result. Default `true`.
- `options.strict` — strip everything except `[a-z0-9]`. Default `false`.

### `DEFAULT_OPTIONS`

Frozen object of the default options, exported for inspection or extension.

## Running the tests

```
node --test
```
