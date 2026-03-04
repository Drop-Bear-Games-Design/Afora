import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'fsharp',
  name: 'F#',
  lineComment: '//',
  blockComment: ['(*', '*)'],
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'then', 'elif', 'else', 'match', 'with', 'for', 'while',
      'do', 'return', 'yield', 'try', 'finally', 'raise', 'async',
    ],
    query: [
      'query', 'select', 'where', 'join', 'groupBy', 'sortBy',
    ],
    visibility: [
      'public', 'private', 'internal', 'static', 'mutable',
      'let', 'module', 'open',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0a]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\U[0-9a-fA-F]{8}/g,
};
