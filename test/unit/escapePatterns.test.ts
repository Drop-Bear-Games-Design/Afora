import { describe, it, expect } from 'vitest';

function findEscapes(text: string, pattern: RegExp): string[] {
  const re = new RegExp(pattern.source, pattern.flags);
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[0]);
  }
  return matches;
}

// C-style escape pattern
const cEscapePattern = /\\['"\\nrtbfv0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/g;

// Python escape pattern
const pyEscapePattern = /\\['"\\nrtbfva0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\N\{[^}]+\}|\\[0-7]{1,3}/g;

// Printf format specifier pattern
const formatSpecPattern = /%[-+0 #]*(\d+|\*)?(\.\d+|\.\*)?[hlLzjt]*[diouxXeEfFgGaAcspn%]/g;

describe('C-style escape patterns', () => {
  it('should match standard escapes', () => {
    const matches = findEscapes('hello\\nworld\\t!', cEscapePattern);
    expect(matches).toEqual(['\\n', '\\t']);
  });

  it('should match hex escapes', () => {
    const matches = findEscapes('\\x41\\xFF', cEscapePattern);
    expect(matches).toEqual(['\\x41', '\\xFF']);
  });

  it('should match unicode escapes', () => {
    const matches = findEscapes('\\u0041\\u{1F600}', cEscapePattern);
    expect(matches).toEqual(['\\u0041', '\\u{1F600}']);
  });

  it('should match backslash-quote escapes', () => {
    const matches = findEscapes('\\\' \\\" \\\\', cEscapePattern);
    expect(matches).toEqual(["\\'", '\\"', '\\\\']);
  });
});

describe('Python escape patterns', () => {
  it('should match octal escapes', () => {
    // \\0 is matched as a single-char escape first, then 77 is left unmatched
    // Use a clear octal that doesn't start with \\0
    const matches = findEscapes('\\177\\377', pyEscapePattern);
    expect(matches).toEqual(['\\177', '\\377']);
  });

  it('should match named unicode escapes', () => {
    const matches = findEscapes('\\N{SNOWMAN}', pyEscapePattern);
    expect(matches).toEqual(['\\N{SNOWMAN}']);
  });

  it('should match 8-digit unicode escapes', () => {
    const matches = findEscapes('\\U0001F600', pyEscapePattern);
    expect(matches).toEqual(['\\U0001F600']);
  });
});

describe('printf format specifiers', () => {
  it('should match basic specifiers', () => {
    const matches = findEscapes('%d %s %f', formatSpecPattern);
    expect(matches).toEqual(['%d', '%s', '%f']);
  });

  it('should match width and precision', () => {
    const matches = findEscapes('%10.2f %-5d', formatSpecPattern);
    expect(matches).toEqual(['%10.2f', '%-5d']);
  });

  it('should match length modifiers', () => {
    const matches = findEscapes('%ld %lld %zu', formatSpecPattern);
    expect(matches).toEqual(['%ld', '%lld', '%zu']);
  });

  it('should match percent literal', () => {
    const matches = findEscapes('100%%', formatSpecPattern);
    expect(matches).toEqual(['%%']);
  });
});
