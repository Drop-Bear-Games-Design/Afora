import type { LanguageDefinition } from '../types';

const baseDefinition = {
  name: 'HTML',
  blockComment: ['<!--', '-->'] as [string, string],
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '<', '>', '{', '}'],
  keywords: {
    flowControl: [],
    query: [],
    visibility: [],
  },
};

export const definitions: LanguageDefinition[] = [
  { ...baseDefinition, id: 'html', name: 'HTML' },
  { ...baseDefinition, id: 'xml', name: 'XML' },
];
