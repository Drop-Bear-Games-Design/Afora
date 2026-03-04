import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'php',
  name: 'PHP',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch',
      'case', 'default', 'return', 'throw', 'try', 'catch', 'finally',
      'break', 'continue', 'yield',
    ],
    query: [],
    visibility: [
      'public', 'private', 'protected', 'static', 'abstract',
      'final', 'const', 'var',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0e$]|\\x[0-9a-fA-F]{1,2}|\\u\{[0-9a-fA-F]+\}|\\[0-7]{1,3}/g,
};
