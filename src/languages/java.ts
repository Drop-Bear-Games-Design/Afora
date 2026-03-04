import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'java',
  name: 'Java',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  charLiterals: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
      'return', 'throw', 'try', 'catch', 'finally', 'break', 'continue', 'assert',
    ],
    query: [],
    visibility: [
      'public', 'private', 'protected', 'static', 'final', 'abstract',
      'synchronized', 'volatile', 'transient', 'native', 'strictfp',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}/g,
};
