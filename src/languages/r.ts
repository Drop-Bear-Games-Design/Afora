import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'r',
  name: 'R',
  lineComment: '#',
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'while', 'repeat', 'break', 'next',
      'return', 'switch', 'tryCatch', 'stop', 'warning',
    ],
    query: [],
    visibility: [
      'function', 'library', 'require', 'source',
    ],
  },
  escapePattern: /\\['"\\nrtbfva0]|\\x[0-9a-fA-F]{1,2}|\\u[0-9a-fA-F]{1,4}|\\U[0-9a-fA-F]{1,8}/g,
};
