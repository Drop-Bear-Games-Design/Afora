import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'powershell',
  name: 'PowerShell',
  lineComment: '#',
  blockComment: ['<#', '#>'],
  stringDelimiters: ['"', "'"],
  bracePairs: ['(', ')', '{', '}', '[', ']'],
  keywords: {
    flowControl: [
      'if', 'elseif', 'else', 'switch', 'for', 'foreach', 'while', 'do',
      'until', 'break', 'continue', 'return', 'throw', 'try', 'catch',
      'finally', 'trap', 'exit',
    ],
    query: [
      'Where-Object', 'Select-Object', 'Sort-Object',
      'Group-Object', 'ForEach-Object',
    ],
    visibility: [
      'function', 'filter', 'param', 'begin', 'process', 'end',
      'class', 'enum', 'hidden',
    ],
  },
  escapePattern: /`['"\\nrtbfva0`$]/g,
};
