import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'go',
  name: 'Go',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"'],
  templateStrings: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'switch', 'select', 'return', 'break', 'continue',
      'go', 'defer', 'fallthrough', 'range', 'case', 'default',
    ],
    query: [],
    visibility: [],
  },
  escapePattern: /\\['"\\nrtbfva0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\[0-7]{1,3}/g,
};
