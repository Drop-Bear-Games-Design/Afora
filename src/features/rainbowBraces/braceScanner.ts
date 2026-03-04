import {
  ScannerState,
  type BraceToken,
  type CommentRegion,
  type LanguageDefinition,
  type ScanResult,
  type StringRegion,
} from '../../types';

// ── Pre-regex-context chars ──────────────────────────────────────────
// When a '/' follows one of these, it is treated as the start of a regex
// literal rather than a division operator.
const REGEX_PREV_CHARS = new Set([
  '(', '[', '{', ',', ';', '!', '&', '|', '?', ':', '=', '^', '~',
  '+', '-', '*', '%', '<', '>', '\n',
]);

/**
 * Single-pass scanner that extracts braces, strings, and comments from source
 * text.  Operates as a state machine driven by `ScannerState`.
 *
 * Performance-critical: the main loop avoids regex and allocations on the hot
 * path.  Every character is visited at most once.
 */
export function scan(
  text: string,
  lang: LanguageDefinition,
  startOffset: number,
  startLine: number,
  startChar: number,
): ScanResult {
  const len = text.length;

  // ── Result accumulators ──────────────────────────────────────────
  const braces: BraceToken[] = [];
  const strings: StringRegion[] = [];
  const comments: CommentRegion[] = [];

  // ── Pre-compute language properties once ─────────────────────────
  const braceSet = new Set(lang.bracePairs);
  const lineCommentPrefix = lang.lineComment ?? '';
  const lineCommentLen = lineCommentPrefix.length;
  const hasBlockComment = lang.blockComment !== undefined;
  const blockOpen = hasBlockComment ? lang.blockComment![0] : '';
  const blockClose = hasBlockComment ? lang.blockComment![1] : '';
  const blockOpenLen = blockOpen.length;
  const blockCloseLen = blockClose.length;
  const nestedBlocks = lang.nestedBlockComments === true;
  const hasTemplateStrings = lang.templateStrings === true;
  const hasRegexLiterals = lang.regexLiterals === true;
  const hasCharLiterals = lang.charLiterals === true;
  const rawPrefix = lang.rawStringPrefix ?? '';
  const hasRawPrefix = rawPrefix.length > 0;
  const hasTriple = (lang.multiLineStringDelimiter ?? '').length > 0;
  const stringDelims = new Set(lang.stringDelimiters);

  // ── Scanner state ────────────────────────────────────────────────
  let state: ScannerState = ScannerState.Text;
  let line = startLine;
  let char = startChar;
  let i = 0;

  // Shared sub-state for strings / comments:
  let regionStart = 0;           // offset where current region began
  let regionStartLine = 0;       // line where current region began
  let regionStartChar = 0;       // char where current region began
  let stringQuote = '';           // the opening quote character
  let isTripleQuoted = false;    // Python triple-quoted string
  let blockCommentDepth = 0;     // nesting depth for block comments

  // Template-string interpolation tracking.
  // When we encounter `${` inside a template literal, we push the current
  // template depth onto this stack and switch to Text state. Matching `}`
  // pops the stack and resumes StringTemplate.
  let templateDepthStack: number[] = [];
  let templateBraceDepth = 0;    // brace depth inside current interpolation

  // Track last significant non-whitespace character for regex heuristic.
  let lastSignificantChar = '\n';

  // ── Helpers ──────────────────────────────────────────────────────

  /** Advance position counters by one character. */
  function advance(): void {
    if (text.charCodeAt(i) === 0x0A /* \n */) {
      line++;
      char = 0;
    } else {
      char++;
    }
    i++;
  }

  /** Check whether `text` matches `pattern` at position `pos`. */
  function matchAt(pattern: string, pos: number): boolean {
    if (pos + pattern.length > len) return false;
    for (let k = 0; k < pattern.length; k++) {
      if (text.charCodeAt(pos + k) !== pattern.charCodeAt(k)) return false;
    }
    return true;
  }

  /** Advance `n` characters, updating line/char properly. */
  function advanceN(n: number): void {
    for (let k = 0; k < n; k++) advance();
  }

  /** Begin a string region. */
  function beginString(quote: string, triple: boolean): void {
    regionStart = startOffset + i;
    regionStartLine = line;
    regionStartChar = char;
    stringQuote = quote;
    isTripleQuoted = triple;
  }

  /** End the current string region. */
  function endString(kind: StringRegion['kind'], escapes: boolean): void {
    strings.push({
      start: regionStart,
      end: startOffset + i,
      startLine: regionStartLine,
      startChar: regionStartChar,
      kind,
      supportsEscapes: escapes,
    });
  }

  /** Begin a comment region. */
  function beginComment(): void {
    regionStart = startOffset + i;
  }

  /** End the current comment region. */
  function endComment(kind: CommentRegion['kind']): void {
    comments.push({
      start: regionStart,
      end: startOffset + i,
      kind,
    });
  }

  // ── Main loop ────────────────────────────────────────────────────
  while (i < len) {
    const ch = text.charAt(i);
    const cc = text.charCodeAt(i);

    switch (state) {
      // ── TEXT ──────────────────────────────────────────────────
      case ScannerState.Text: {
        // --- Line comment ------------------------------------------------
        if (lineCommentLen > 0 && matchAt(lineCommentPrefix, i)) {
          state = ScannerState.LineComment;
          beginComment();
          advanceN(lineCommentLen);
          break;
        }

        // --- Block comment -----------------------------------------------
        if (hasBlockComment && matchAt(blockOpen, i)) {
          state = ScannerState.BlockComment;
          blockCommentDepth = 1;
          beginComment();
          advanceN(blockOpenLen);
          break;
        }

        // --- Template string (backtick) ----------------------------------
        if (hasTemplateStrings && cc === 0x60 /* ` */) {
          state = ScannerState.StringTemplate;
          beginString('`', false);
          advance();
          break;
        }

        // --- Raw string check (before normal string check) ---------------
        if (hasRawPrefix && ch === rawPrefix && i + 1 < len && stringDelims.has(text.charAt(i + 1))) {
          const quote = text.charAt(i + 1);
          state = ScannerState.StringRaw;
          // Check for triple-quoted raw string (Python r""" or r''')
          if (hasTriple && i + 3 < len && text.charAt(i + 2) === quote && text.charAt(i + 3) === quote) {
            beginString(quote, true);
            advanceN(4); // skip prefix + triple quote
          } else {
            beginString(quote, false);
            advanceN(2); // skip prefix + quote
          }
          break;
        }

        // --- Regex literal (JS/TS) ---------------------------------------
        if (hasRegexLiterals && cc === 0x2F /* / */ && REGEX_PREV_CHARS.has(lastSignificantChar)) {
          // Ensure the next char is not / or * (that would be a comment start)
          if (i + 1 < len) {
            const next = text.charCodeAt(i + 1);
            if (next !== 0x2F /* / */ && next !== 0x2A /* * */) {
              state = ScannerState.Regex;
              regionStart = startOffset + i;
              advance();
              break;
            }
          }
        }

        // --- String delimiters -------------------------------------------
        if (stringDelims.has(ch)) {
          // Check for char literal (C#: 'x')
          if (hasCharLiterals && cc === 0x27 /* ' */) {
            state = ScannerState.CharLiteral;
            beginString("'", false);
            advance();
            break;
          }

          // Check for triple-quoted string (Python """ or ''')
          if (hasTriple && i + 2 < len && text.charAt(i + 1) === ch && text.charAt(i + 2) === ch) {
            state = cc === 0x27 ? ScannerState.StringSingle : ScannerState.StringDouble;
            beginString(ch, true);
            advanceN(3);
            break;
          }

          // Normal single or double quote
          if (cc === 0x27 /* ' */) {
            state = ScannerState.StringSingle;
            beginString("'", false);
          } else {
            state = ScannerState.StringDouble;
            beginString('"', false);
          }
          advance();
          break;
        }

        // --- Template interpolation close --------------------------------
        // When inside `${ ... }` of a template string, a `}` that returns
        // brace depth to zero resumes the template literal state.
        if (templateDepthStack.length > 0 && cc === 0x7D /* } */) {
          if (templateBraceDepth === 0) {
            // Pop back into the enclosing template string
            templateBraceDepth = templateDepthStack.pop()!;
            state = ScannerState.StringTemplate;
            // The } is not a code brace, so we don't record it
            advance();
            break;
          }
          templateBraceDepth--;
        }

        // --- Track brace depth inside interpolation ----------------------
        if (templateDepthStack.length > 0 && cc === 0x7B /* { */) {
          templateBraceDepth++;
        }

        // --- Brace characters --------------------------------------------
        if (braceSet.has(ch)) {
          braces.push({
            char: ch,
            offset: startOffset + i,
            line,
            character: char,
          });
        }

        // Track last significant character for regex heuristic
        if (cc !== 0x20 /* space */ && cc !== 0x09 /* tab */ && cc !== 0x0A /* \n */ && cc !== 0x0D /* \r */) {
          lastSignificantChar = ch;
        }

        advance();
        break;
      }

      // ── LINE COMMENT ─────────────────────────────────────────
      case ScannerState.LineComment: {
        if (cc === 0x0A /* \n */) {
          endComment('line');
          state = ScannerState.Text;
          lastSignificantChar = '\n';
          // Don't advance past newline here; the Text state will see it
          // on the next iteration, but we should still advance so we
          // don't loop forever.
          advance();
        } else {
          advance();
        }
        break;
      }

      // ── BLOCK COMMENT ────────────────────────────────────────
      case ScannerState.BlockComment: {
        // Nested block comment open (Rust-style)
        if (nestedBlocks && matchAt(blockOpen, i)) {
          blockCommentDepth++;
          advanceN(blockOpenLen);
          break;
        }

        if (matchAt(blockClose, i)) {
          blockCommentDepth--;
          advanceN(blockCloseLen);
          if (blockCommentDepth <= 0) {
            endComment('block');
            state = ScannerState.Text;
          }
          break;
        }

        advance();
        break;
      }

      // ── STRING (single quote) ────────────────────────────────
      case ScannerState.StringSingle: {
        if (cc === 0x5C /* \ */ && i + 1 < len) {
          // Escaped character - skip two
          advance();
          advance();
          break;
        }
        if (cc === 0x0A /* \n */ && !isTripleQuoted) {
          // Unterminated single-line string - end it here
          endString('single', true);
          state = ScannerState.Text;
          lastSignificantChar = '\n';
          advance();
          break;
        }
        // Check for triple-quote close
        if (isTripleQuoted && matchAt("'''", i)) {
          advanceN(3);
          endString('single', true);
          state = ScannerState.Text;
          break;
        }
        if (!isTripleQuoted && cc === 0x27 /* ' */) {
          advance();
          endString('single', true);
          state = ScannerState.Text;
          break;
        }
        advance();
        break;
      }

      // ── STRING (double quote) ────────────────────────────────
      case ScannerState.StringDouble: {
        if (cc === 0x5C /* \ */ && i + 1 < len) {
          advance();
          advance();
          break;
        }
        if (cc === 0x0A /* \n */ && !isTripleQuoted) {
          endString('double', true);
          state = ScannerState.Text;
          lastSignificantChar = '\n';
          advance();
          break;
        }
        // Check for triple-quote close
        if (isTripleQuoted && matchAt('"""', i)) {
          advanceN(3);
          endString('double', true);
          state = ScannerState.Text;
          break;
        }
        if (!isTripleQuoted && cc === 0x22 /* " */) {
          advance();
          endString('double', true);
          state = ScannerState.Text;
          break;
        }
        advance();
        break;
      }

      // ── TEMPLATE STRING (backtick) ───────────────────────────
      case ScannerState.StringTemplate: {
        if (cc === 0x5C /* \ */ && i + 1 < len) {
          advance();
          advance();
          break;
        }
        // Interpolation start: ${
        if (cc === 0x24 /* $ */ && i + 1 < len && text.charCodeAt(i + 1) === 0x7B /* { */) {
          // Push current interpolation brace depth onto the stack and
          // switch to Text mode to scan the interpolated expression.
          templateDepthStack.push(templateBraceDepth);
          templateBraceDepth = 0;
          state = ScannerState.Text;
          advanceN(2); // skip ${
          break;
        }
        if (cc === 0x60 /* ` */) {
          advance();
          endString('template', true);
          state = ScannerState.Text;
          break;
        }
        advance();
        break;
      }

      // ── RAW STRING ───────────────────────────────────────────
      case ScannerState.StringRaw: {
        // Raw strings have no escape processing.
        if (isTripleQuoted) {
          // Close on triple-quote matching the opening quote char
          const tripleClose = stringQuote.repeat(3);
          if (matchAt(tripleClose, i)) {
            advanceN(3);
            endString('raw', false);
            state = ScannerState.Text;
            break;
          }
        } else {
          // C# @"..." uses "" to escape a literal quote inside
          if (cc === stringQuote.charCodeAt(0)) {
            // Check for doubled quote (C# verbatim string escape)
            if (i + 1 < len && text.charCodeAt(i + 1) === cc) {
              advanceN(2); // skip ""
              break;
            }
            // End of raw string
            advance();
            endString('raw', false);
            state = ScannerState.Text;
            break;
          }
          // In languages with triple-quote support (Python), non-triple raw
          // strings (r"...") are single-line.  In languages without triple
          // quotes (C# @"..."), raw strings are inherently multi-line.
          if (hasTriple && cc === 0x0A /* \n */) {
            endString('raw', false);
            state = ScannerState.Text;
            lastSignificantChar = '\n';
            advance();
            break;
          }
        }
        advance();
        break;
      }

      // ── CHAR LITERAL ─────────────────────────────────────────
      case ScannerState.CharLiteral: {
        if (cc === 0x5C /* \ */ && i + 1 < len) {
          advance();
          advance();
          break;
        }
        if (cc === 0x27 /* ' */) {
          advance();
          endString('char', true);
          state = ScannerState.Text;
          break;
        }
        if (cc === 0x0A /* \n */) {
          // Unterminated char literal
          endString('char', true);
          state = ScannerState.Text;
          lastSignificantChar = '\n';
          advance();
          break;
        }
        advance();
        break;
      }

      // ── REGEX LITERAL ────────────────────────────────────────
      case ScannerState.Regex: {
        if (cc === 0x5C /* \ */ && i + 1 < len) {
          advance();
          advance();
          break;
        }
        // Character class - skip until ]
        if (cc === 0x5B /* [ */) {
          advance();
          while (i < len) {
            const rc = text.charCodeAt(i);
            if (rc === 0x5C /* \ */ && i + 1 < len) {
              advance();
              advance();
              continue;
            }
            if (rc === 0x5D /* ] */) {
              advance();
              break;
            }
            if (rc === 0x0A /* \n */) break; // unterminated
            advance();
          }
          break;
        }
        if (cc === 0x2F /* / */) {
          advance();
          // Skip regex flags (g, i, m, s, u, y, d, v)
          while (i < len && isRegexFlagChar(text.charCodeAt(i))) {
            advance();
          }
          state = ScannerState.Text;
          break;
        }
        if (cc === 0x0A /* \n */) {
          // Unterminated regex, bail back to text
          state = ScannerState.Text;
          lastSignificantChar = '\n';
          advance();
          break;
        }
        advance();
        break;
      }

      default:
        // Should never happen - advance to avoid infinite loop
        advance();
        break;
    }
  }

  // ── Flush any unterminated regions at end of text ─────────────────
  switch (state) {
    case ScannerState.LineComment:
      endComment('line');
      break;
    case ScannerState.BlockComment:
      endComment('block');
      break;
    case ScannerState.StringSingle:
      endString('single', true);
      break;
    case ScannerState.StringDouble:
      endString('double', true);
      break;
    case ScannerState.StringTemplate:
      endString('template', true);
      break;
    case ScannerState.StringRaw:
      endString('raw', false);
      break;
    case ScannerState.CharLiteral:
      endString('char', true);
      break;
    // Regex: unterminated regex is not recorded as a string region
    default:
      break;
  }

  return { braces, strings, comments };
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Returns true if the char code is a valid regex flag character. */
function isRegexFlagChar(cc: number): boolean {
  // d(100) g(103) i(105) m(109) s(115) u(117) v(118) y(121)
  return (
    cc === 0x64 ||
    cc === 0x67 ||
    cc === 0x69 ||
    cc === 0x6D ||
    cc === 0x73 ||
    cc === 0x75 ||
    cc === 0x76 ||
    cc === 0x79
  );
}
