import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'rust',
  name: 'Rust',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"'],
  rawStringPrefix: 'r',
  charLiterals: true,
  nestedBlockComments: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'match', 'for', 'while', 'loop', 'return',
      'break', 'continue', 'async', 'await', 'yield',
    ],
    query: [],
    visibility: [
      'pub', 'static', 'const', 'mut', 'unsafe', 'extern',
      'crate', 'mod', 'use',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0]|\\x[0-9a-fA-F]{2}|\\u\{[0-9a-fA-F]+\}/g,
};
