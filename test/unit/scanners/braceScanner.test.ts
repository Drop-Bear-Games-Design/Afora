import { describe, it, expect } from 'vitest';
import { scan } from '../../../src/features/rainbowBraces/braceScanner';
import type { LanguageDefinition } from '../../../src/types';

// Minimal C-style language definition for testing
const cLike: LanguageDefinition = {
  id: 'test-c',
  name: 'Test C-like',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  templateStrings: false,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: { flowControl: [], query: [], visibility: [] },
};

const jsLike: LanguageDefinition = {
  id: 'test-js',
  name: 'Test JS',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  templateStrings: true,
  regexLiterals: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: { flowControl: [], query: [], visibility: [] },
};

const pythonLike: LanguageDefinition = {
  id: 'test-python',
  name: 'Test Python',
  lineComment: '#',
  stringDelimiters: ['"', "'"],
  rawStringPrefix: 'r',
  multiLineStringDelimiter: '"""',
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: { flowControl: [], query: [], visibility: [] },
};

const rustLike: LanguageDefinition = {
  id: 'test-rust',
  name: 'Test Rust',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"'],
  charLiterals: true,
  nestedBlockComments: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: { flowControl: [], query: [], visibility: [] },
};

describe('braceScanner', () => {
  describe('brace detection', () => {
    it('should find all braces in plain code', () => {
      const result = scan('foo(bar[1]){x}', cLike, 0, 0, 0);
      const braceChars = result.braces.map(b => b.char);
      expect(braceChars).toEqual(['(', '[', ']', ')', '{', '}']);
    });

    it('should return correct offsets and positions', () => {
      const result = scan('a(b)', cLike, 0, 0, 0);
      expect(result.braces[0]).toMatchObject({ char: '(', offset: 1, line: 0, character: 1 });
      expect(result.braces[1]).toMatchObject({ char: ')', offset: 3, line: 0, character: 3 });
    });

    it('should handle multi-line code', () => {
      const code = 'if (a) {\n  b[0]\n}';
      const result = scan(code, cLike, 0, 0, 0);
      expect(result.braces).toHaveLength(6); // ( ) { [ ] }
      // Check line tracking
      const closeBrace = result.braces.find(b => b.char === '}');
      expect(closeBrace?.line).toBe(2);
    });

    it('should return empty braces for brace-free text', () => {
      const result = scan('hello world', cLike, 0, 0, 0);
      expect(result.braces).toHaveLength(0);
    });
  });

  describe('string detection', () => {
    it('should detect double-quoted strings', () => {
      const result = scan('"hello"', cLike, 0, 0, 0);
      expect(result.strings).toHaveLength(1);
      expect(result.strings[0].kind).toBe('double');
      expect(result.strings[0].supportsEscapes).toBe(true);
    });

    it('should detect single-quoted strings', () => {
      const result = scan("'x'", cLike, 0, 0, 0);
      expect(result.strings).toHaveLength(1);
    });

    it('should handle escaped quotes inside strings', () => {
      const result = scan('"he\\"llo"', cLike, 0, 0, 0);
      expect(result.strings).toHaveLength(1);
    });

    it('should not detect braces inside strings', () => {
      const result = scan('"(foo)"', cLike, 0, 0, 0);
      expect(result.braces).toHaveLength(0);
      expect(result.strings).toHaveLength(1);
    });
  });

  describe('comment detection', () => {
    it('should detect line comments', () => {
      const result = scan('a // comment\nb', cLike, 0, 0, 0);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].kind).toBe('line');
    });

    it('should detect block comments', () => {
      const result = scan('a /* block */ b', cLike, 0, 0, 0);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].kind).toBe('block');
    });

    it('should not detect braces inside comments', () => {
      const result = scan('// (braces)\na', cLike, 0, 0, 0);
      expect(result.braces).toHaveLength(0);
    });

    it('should not detect braces inside block comments', () => {
      const result = scan('/* {braces} */ a', cLike, 0, 0, 0);
      expect(result.braces).toHaveLength(0);
    });
  });

  describe('template strings (JS/TS)', () => {
    it('should detect template strings', () => {
      const result = scan('`hello`', jsLike, 0, 0, 0);
      expect(result.strings).toHaveLength(1);
      expect(result.strings[0].kind).toBe('template');
    });

    it('should handle interpolation in template strings', () => {
      const result = scan('`${a + b}`', jsLike, 0, 0, 0);
      // Should see braces from ${} but not count template delimiters as braces
      expect(result.strings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Python-specific', () => {
    it('should detect Python line comments', () => {
      const result = scan('a # comment\nb', pythonLike, 0, 0, 0);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].kind).toBe('line');
    });
  });

  describe('nested block comments (Rust)', () => {
    it('should handle nested block comments', () => {
      const result = scan('a /* outer /* inner */ still comment */ b', rustLike, 0, 0, 0);
      expect(result.comments).toHaveLength(1);
      // After the comment, 'b' should be in text state
      expect(result.braces).toHaveLength(0);
    });
  });

  describe('startOffset support', () => {
    it('should apply startOffset to brace offsets', () => {
      const result = scan('()', cLike, 100, 5, 0);
      expect(result.braces[0].offset).toBe(100);
      expect(result.braces[0].line).toBe(5);
      expect(result.braces[1].offset).toBe(101);
    });
  });
});
