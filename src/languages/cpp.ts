import type { LanguageDefinition } from '../types';

const baseDefinition = {
  name: 'C/C++',
  lineComment: '//',
  blockComment: ['/*', '*/'] as [string, string],
  stringDelimiters: ['"', "'"],
  charLiterals: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
      'return', 'throw', 'try', 'catch', 'break', 'continue', 'goto',
    ],
    query: [],
    visibility: [
      'public', 'private', 'protected', 'static', 'extern', 'virtual',
      'const', 'volatile', 'inline', 'explicit', 'friend', 'mutable',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0?a]|\\x[0-9a-fA-F]{1,2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}|\\[0-7]{1,3}/g,
  formatSpecifierPattern: /%[-+0 #]*(\d+|\*)?(\.\d+|\.\*)?[hlLzjt]*[diouxXeEfFgGaAcspn%]/g,
};

export const definitions: LanguageDefinition[] = [
  { ...baseDefinition, id: 'c', name: 'C' },
  { ...baseDefinition, id: 'cpp', name: 'C++' },
];
