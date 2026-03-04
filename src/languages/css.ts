import type { LanguageDefinition } from '../types';

const baseDefinition = {
  name: 'CSS',
  blockComment: ['/*', '*/'] as [string, string],
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [],
    query: [],
    visibility: [],
  },
  escapePattern: /\\[0-9a-fA-F]{1,6}/g,
};

export const definitions: LanguageDefinition[] = [
  { ...baseDefinition, id: 'css', name: 'CSS' },
  { ...baseDefinition, id: 'scss', name: 'SCSS', lineComment: '//' },
  { ...baseDefinition, id: 'less', name: 'Less', lineComment: '//' },
];
