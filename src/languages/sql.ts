import type { LanguageDefinition } from '../types';

export const definition: LanguageDefinition = {
  id: 'sql',
  name: 'SQL',
  lineComment: '--',
  blockComment: ['/*', '*/'],
  stringDelimiters: ["'"],
  caseInsensitive: true,
  bracePairs: ['(', ')'],
  keywords: {
    flowControl: [
      'IF', 'ELSE', 'WHILE', 'BREAK', 'RETURN', 'BEGIN', 'END',
      'TRY', 'CATCH', 'GOTO', 'CONTINUE', 'THROW', 'WAITFOR', 'RAISERROR',
    ],
    query: [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
      'CROSS', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING',
      'UNION', 'INTERSECT', 'EXCEPT', 'INSERT', 'INTO', 'UPDATE', 'SET',
      'DELETE', 'VALUES', 'TOP', 'DISTINCT', 'AS', 'IN', 'EXISTS',
      'BETWEEN', 'LIKE', 'IS', 'NULL', 'NOT', 'AND', 'OR',
      'ALL', 'ANY', 'SOME',
    ],
    visibility: [
      'CREATE', 'ALTER', 'DROP', 'GRANT', 'REVOKE', 'DENY',
      'EXEC', 'EXECUTE', 'DECLARE', 'TABLE', 'VIEW', 'PROCEDURE',
      'FUNCTION', 'TRIGGER', 'INDEX', 'SCHEMA', 'DATABASE',
    ],
  },
  escapePattern: /''/g,
};
