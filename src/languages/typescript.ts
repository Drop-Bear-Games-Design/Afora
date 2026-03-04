import type { LanguageDefinition } from '../types';

const baseDefinition = {
  name: 'TypeScript',
  lineComment: '//',
  blockComment: ['/*', '*/'] as [string, string],
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
      'public', 'private', 'protected', 'static', 'abstract', 'readonly',
      'declare', 'namespace', 'type', 'interface', 'enum',
    ],
  },
  escapePattern: /\\['"\\nrtbfv0]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/g,
};

export const definitions: LanguageDefinition[] = [
  { ...baseDefinition, id: 'typescript', name: 'TypeScript' },
  { ...baseDefinition, id: 'typescriptreact', name: 'TypeScript React' },
];
