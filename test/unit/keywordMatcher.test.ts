import { describe, it, expect } from 'vitest';

// Test keyword matching regex logic used by KeywordDecorator
function findKeywords(text: string, keywords: string[], caseInsensitive = false): { word: string; offset: number }[] {
  if (keywords.length === 0) return [];
  const flags = caseInsensitive ? 'gi' : 'g';
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, flags);

  const results: { word: string; offset: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    results.push({ word: match[0], offset: match.index });
  }
  return results;
}

describe('keyword matching', () => {
  it('should find simple keywords', () => {
    const results = findKeywords('if (x) return y;', ['if', 'return']);
    expect(results).toEqual([
      { word: 'if', offset: 0 },
      { word: 'return', offset: 7 },
    ]);
  });

  it('should respect word boundaries', () => {
    const results = findKeywords('notify iffy returnType', ['if', 'return']);
    expect(results).toHaveLength(0);
  });

  it('should handle case-insensitive matching', () => {
    const results = findKeywords('SELECT from WHERE', ['select', 'from', 'where'], true);
    expect(results).toHaveLength(3);
    expect(results[0].word).toBe('SELECT');
  });

  it('should handle empty keyword list', () => {
    const results = findKeywords('some text', []);
    expect(results).toHaveLength(0);
  });

  it('should find keywords with special regex chars', () => {
    const results = findKeywords('Where-Object test', ['Where-Object']);
    expect(results).toHaveLength(1);
    expect(results[0].word).toBe('Where-Object');
  });

  it('should find multiple occurrences', () => {
    const results = findKeywords('if (a) if (b)', ['if']);
    expect(results).toHaveLength(2);
  });
});
