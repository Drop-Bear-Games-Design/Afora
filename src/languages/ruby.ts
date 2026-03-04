import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'ruby',
  name: 'Ruby',
  lineComment: '#',
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'elsif', 'else', 'unless', 'for', 'while', 'until', 'do',
      'begin', 'end', 'rescue', 'ensure', 'raise', 'return', 'break',
      'next', 'redo', 'retry', 'yield', 'case', 'when',
    ],
    query: [],
    visibility: [
      'public', 'private', 'protected',
      'attr_reader', 'attr_writer', 'attr_accessor',
    ],
  },
  escapePattern: /\\['"\\nrtbfva0es]|\\x[0-9a-fA-F]{1,2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}|\\[0-7]{1,3}/g,
};
