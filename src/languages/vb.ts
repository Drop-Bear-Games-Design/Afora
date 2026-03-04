import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'vb',
  name: 'Visual Basic',
  lineComment: "'",
  stringDelimiters: ['"'],
  caseInsensitive: true,
  bracePairs: ['(', ')'],
  keywords: {
    flowControl: [
      'If', 'Then', 'Else', 'ElseIf', 'For', 'Each', 'While', 'Do', 'Loop',
      'Select', 'Case', 'Return', 'Throw', 'Try', 'Catch', 'Finally',
      'GoTo', 'Exit', 'Continue', 'With', 'Using',
    ],
    query: [
      'Select', 'From', 'Where', 'Join', 'Order', 'By', 'Group',
      'Let', 'Into', 'Aggregate', 'Distinct', 'Skip', 'Take',
    ],
    visibility: [
      'Public', 'Private', 'Protected', 'Friend', 'Static', 'Shared',
      'ReadOnly', 'Const', 'Dim', 'Module', 'Class',
    ],
  },
  escapePattern: /""/g,
};
