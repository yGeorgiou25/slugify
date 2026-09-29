import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/core.js';

describe('slugify', () => {
  it('slugifies a simple title', () => {
    assert.equal(slugify('Hello World'), 'hello-world');
  });

  it('collapses multiple spaces into a single separator', () => {
    assert.equal(slugify('Hello    World'), 'hello-world');
  });

  it('trims leading and trailing separators', () => {
    assert.equal(slugify('  Hello World  '), 'hello-world');
  });

  it('strips accents via NFKD normalisation', () => {
    assert.equal(slugify('Café Crème'), 'cafe-creme');
  });

  it('handles ñ correctly', () => {
    assert.equal(slugify('Niño'), 'nino');
  });

  it('transliterates ø and æ manually', () => {
    assert.equal(slugify('Æblegrød'), 'aeblegrod');
  });

  it('transliterates ß to ss', () => {
    assert.equal(slugify('Straße'), 'strasse');
  });

  it('replaces punctuation with the separator', () => {
    assert.equal(slugify('Hello, World!'), 'hello-world');
  });

  it('returns an empty string for input that is only separators', () => {
    assert.equal(slugify('!!! ???'), '');
  });

  it('respects a custom separator', () => {
    assert.equal(slugify('Hello World', { separator: '_' }), 'hello_world');
  });

  it('preserves case when lower is false', () => {
    assert.equal(slugify('Hello World', { lower: false }), 'Hello-World');
  });

  it('preserves underscores in non-strict mode', () => {
    assert.equal(slugify('hello_world test'), 'hello_world-test');
  });

  it('strips underscores in strict mode', () => {
    assert.equal(slugify('hello_world test', { strict: true }), 'hello-world-test');
  });

  it('drops non-ASCII characters that have no transliteration', () => {
    // Cyrillic "Привет" has no Latin transliteration in our table; strict mode
    // drops it entirely, leaving an empty string.
    assert.equal(slugify('Привет', { strict: true }), '');
  });

  it('throws a TypeError for non-string input', () => {
    assert.throws(() => slugify(42), { name: 'TypeError' });
  });

  it('handles an empty string', () => {
    assert.equal(slugify(''), '');
  });
});
