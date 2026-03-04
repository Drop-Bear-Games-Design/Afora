import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'javascript',
  name: 'JavaScript',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  templateStrings: true,
  regexLiterals: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
      'return', 'throw', 'try', 'catch', 'finally', 'yield', 'await',
      'break', 'continue', 'with',
    ],
    query: [],
    visibility: [
      'export', 'const', 'let', 'var', 'default', 'async', 'function', 'class',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/g,
};
