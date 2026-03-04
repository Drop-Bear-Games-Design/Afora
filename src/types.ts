import type { Range } from 'vscode';

/** Scanner state machine states */
export const enum ScannerState {
  Text,
  LineComment,
  BlockComment,
  StringSingle,
  StringDouble,
  StringTemplate,
  StringRaw,
  CharLiteral,
  Regex,
}

/** A brace token found by the scanner */
export interface BraceToken {
  char: string;
  offset: number;
  line: number;
  character: number;
}

/** A region representing a string in the source */
export interface StringRegion {
  start: number;
  end: number;
  startLine: number;
  startChar: number;
  kind: 'single' | 'double' | 'template' | 'raw' | 'char';
  /** Whether this string supports escape sequences */
  supportsEscapes: boolean;
}

/** A region representing a comment in the source */
export interface CommentRegion {
  start: number;
  end: number;
  kind: 'line' | 'block';
}

/** Complete result from a single scan pass */
export interface ScanResult {
  braces: BraceToken[];
  strings: StringRegion[];
  comments: CommentRegion[];
}

/** Keyword categories */
export type KeywordCategory = 'flowControl' | 'query' | 'visibility';

/** Language definition for scanner parameterization */
export interface LanguageDefinition {
  id: string;
  /** Display name */
  name: string;
  /** Line comment prefix, e.g. '//' */
  lineComment?: string;
  /** Block comment open/close pair */
  blockComment?: [string, string];
  /** String delimiters (which quote chars start strings) */
  stringDelimiters: string[];
  /** Supports template strings (backtick) */
  templateStrings?: boolean;
  /** Raw/verbatim string prefix (e.g. '@' for C#, 'r' for Python) */
  rawStringPrefix?: string;
  /** Has char literals (single-quote is char, not string) */
  charLiterals?: boolean;
  /** Supports regex literals /.../ */
  regexLiterals?: boolean;
  /** Brace pairs to track */
  bracePairs: string[];
  /** Keywords per category */
  keywords: {
    flowControl: string[];
    query: string[];
    visibility: string[];
  };
  /** Valid escape sequences regex (inside strings) */
  escapePattern?: RegExp;
  /** Invalid escape pattern for detection */
  invalidEscapePattern?: RegExp;
  /** Printf/format specifier pattern */
  formatSpecifierPattern?: RegExp;
  /** Whether the language is case-insensitive for keywords (e.g. SQL, VB) */
  caseInsensitive?: boolean;
  /** Multi-line string support (e.g. Python triple-quotes) */
  multiLineStringDelimiter?: string;
  /** Nested block comment support (e.g. Rust) */
  nestedBlockComments?: boolean;
}

/** Feature interface - each feature implements this */
export interface Feature {
  /** Unique feature id */
  id: string;
  /** Apply decorations to the given editor */
  apply(editor: import('vscode').TextEditor, scanResult: ScanResult): void;
  /** Clear all decorations */
  clear(editor: import('vscode').TextEditor): void;
  /** Dispose resources */
  dispose(): void;
}

/** Debounce timer identifiers */
export interface DebounceTimers {
  typing?: ReturnType<typeof setTimeout>;
  scroll?: ReturnType<typeof setTimeout>;
}

/** Cached scanner state for incremental parsing */
export interface LineScanState {
  line: number;
  state: ScannerState;
  /** Nesting depth for block comments (for nested comment languages) */
  blockCommentDepth: number;
}
