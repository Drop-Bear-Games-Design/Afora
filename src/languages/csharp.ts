import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'csharp',
  name: 'C#',
  lineComment: '//',
  blockComment: ['/*', '*/'],
  stringDelimiters: ['"', "'"],
  rawStringPrefix: '@',
  charLiterals: true,
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'default',
      'return', 'throw', 'try', 'catch', 'finally', 'yield', 'await', 'async',
      'break', 'continue', 'goto', 'lock', 'using',
    ],
    query: [
      'select', 'from', 'where', 'join', 'on', 'equals', 'into',
      'orderby', 'descending', 'ascending', 'group', 'by', 'let',
    ],
    visibility: [
      'public', 'private', 'protected', 'internal', 'static', 'abstract',
      'virtual', 'override', 'sealed', 'readonly', 'const', 'extern',
      'volatile', 'unsafe', 'new',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0aeux]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}/g,
};
