import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'python',
  name: 'Python',
  lineComment: '#',
  stringDelimiters: ['"', "'"],
  rawStringPrefix: 'r',
  multiLineStringDelimiter: '"""',
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'return',
      'raise', 'try', 'except', 'finally', 'yield', 'await', 'async',
      'with', 'pass', 'assert', 'del',
    ],
    query: [],
    visibility: [],
  },
  escapePattern: /\\['"\\nrtbfva0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\N\{[^}]+\}|\\[0-7]{1,3}/g,
};
