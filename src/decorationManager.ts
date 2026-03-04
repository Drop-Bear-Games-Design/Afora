import * as vscode from 'vscode';
import type { KeywordCategory } from './types';

/** Number of built-in rainbow color contributions (afora.rainbow1 .. afora.rainbow9). */
const RAINBOW_COLOR_COUNT = 9;

/**
 * Manages the lifecycle of all `TextEditorDecorationType` instances used by
 * the Afora extension.
 *
 * Decoration types are created lazily on first access and cached for the
 * lifetime of this manager.  Call `dispose()` to release every cached type.
 */
export class DecorationManager implements vscode.Disposable {
  // -- Caches -----------------------------------------------------------------

  /** Indexed 0..RAINBOW_COLOR_COUNT-1 */
  private readonly _rainbowDecorations: (vscode.TextEditorDecorationType | undefined)[] =
    new Array(RAINBOW_COLOR_COUNT).fill(undefined);

  private _mismatchDecoration: vscode.TextEditorDecorationType | undefined;

  private readonly _keywordDecorations = new Map<KeywordCategory, vscode.TextEditorDecorationType>();

  private _escapeDecoration: vscode.TextEditorDecorationType | undefined;
  private _invalidEscapeDecoration: vscode.TextEditorDecorationType | undefined;
  private _formatSpecifierDecoration: vscode.TextEditorDecorationType | undefined;

  private _obfuscationDecoration: vscode.TextEditorDecorationType | undefined;
  private _currentLineDecoration: vscode.TextEditorDecorationType | undefined;
  private _currentColumnDecoration: vscode.TextEditorDecorationType | undefined;

  // ---------------------------------------------------------------------------
  // Rainbow braces
  // ---------------------------------------------------------------------------

  /**
   * Returns the decoration type for the given nesting depth.
   *
   * Depth is zero-based and wraps around `maxDepth` so callers never need to
   * clamp it themselves.
   *
   * @param depth   Zero-based nesting depth of the brace.
   * @param maxDepth  Maximum depth from user configuration (used for modulo).
   */
  getRainbowDecoration(depth: number, maxDepth: number): vscode.TextEditorDecorationType {
    const effectiveMax = Math.min(Math.max(maxDepth, 1), RAINBOW_COLOR_COUNT);
    const index = depth % effectiveMax;

    let decoration = this._rainbowDecorations[index];
    if (!decoration) {
      decoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor(`afora.rainbow${index + 1}`),
      });
      this._rainbowDecorations[index] = decoration;
    }
    return decoration;
  }

  // ---------------------------------------------------------------------------
  // Mismatch brace
  // ---------------------------------------------------------------------------

  getMismatchDecoration(): vscode.TextEditorDecorationType {
    if (!this._mismatchDecoration) {
      this._mismatchDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor('afora.braceMismatch'),
      });
    }
    return this._mismatchDecoration;
  }

  // ---------------------------------------------------------------------------
  // Keyword categories
  // ---------------------------------------------------------------------------

  private static readonly _keywordColorIds: Record<KeywordCategory, string> = {
    flowControl: 'afora.flowControlKeyword',
    query: 'afora.queryKeyword',
    visibility: 'afora.visibilityKeyword',
  };

  getKeywordDecoration(category: KeywordCategory): vscode.TextEditorDecorationType {
    let decoration = this._keywordDecorations.get(category);
    if (!decoration) {
      decoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor(DecorationManager._keywordColorIds[category]),
      });
      this._keywordDecorations.set(category, decoration);
    }
    return decoration;
  }

  // ---------------------------------------------------------------------------
  // Escape sequences
  // ---------------------------------------------------------------------------

  getEscapeDecoration(): vscode.TextEditorDecorationType {
    if (!this._escapeDecoration) {
      this._escapeDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor('afora.escapeSequence'),
      });
    }
    return this._escapeDecoration;
  }

  getInvalidEscapeDecoration(): vscode.TextEditorDecorationType {
    if (!this._invalidEscapeDecoration) {
      this._invalidEscapeDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor('afora.invalidEscapeSequence'),
      });
    }
    return this._invalidEscapeDecoration;
  }

  getFormatSpecifierDecoration(): vscode.TextEditorDecorationType {
    if (!this._formatSpecifierDecoration) {
      this._formatSpecifierDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        color: new vscode.ThemeColor('afora.formatSpecifier'),
      });
    }
    return this._formatSpecifierDecoration;
  }

  // ---------------------------------------------------------------------------
  // Text obfuscation
  // ---------------------------------------------------------------------------

  /**
   * Returns a decoration that makes text invisible.
   *
   * Uses `opacity: '0'` to hide the text content and a solid background color
   * so the region still occupies space but reveals nothing.
   */
  getObfuscationDecoration(): vscode.TextEditorDecorationType {
    if (!this._obfuscationDecoration) {
      this._obfuscationDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        opacity: '0',
        backgroundColor: new vscode.ThemeColor('editor.background'),
      });
    }
    return this._obfuscationDecoration;
  }

  // ---------------------------------------------------------------------------
  // Current line / column highlight
  // ---------------------------------------------------------------------------

  /** Full-line background highlight for the current cursor line. */
  getCurrentLineDecoration(): vscode.TextEditorDecorationType {
    if (!this._currentLineDecoration) {
      this._currentLineDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        isWholeLine: true,
        backgroundColor: new vscode.ThemeColor('editor.lineHighlightBackground'),
      });
    }
    return this._currentLineDecoration;
  }

  /** Single-character background highlight for the current cursor column. */
  getCurrentColumnDecoration(): vscode.TextEditorDecorationType {
    if (!this._currentColumnDecoration) {
      this._currentColumnDecoration = vscode.window.createTextEditorDecorationType({
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: new vscode.ThemeColor('editor.rangeHighlightBackground'),
      });
    }
    return this._currentColumnDecoration;
  }

  // ---------------------------------------------------------------------------
  // Disposal
  // ---------------------------------------------------------------------------

  dispose(): void {
    for (const d of this._rainbowDecorations) {
      d?.dispose();
    }
    this._rainbowDecorations.fill(undefined);

    this._mismatchDecoration?.dispose();
    this._mismatchDecoration = undefined;

    for (const d of this._keywordDecorations.values()) {
      d.dispose();
    }
    this._keywordDecorations.clear();

    this._escapeDecoration?.dispose();
    this._escapeDecoration = undefined;

    this._invalidEscapeDecoration?.dispose();
    this._invalidEscapeDecoration = undefined;

    this._formatSpecifierDecoration?.dispose();
    this._formatSpecifierDecoration = undefined;

    this._obfuscationDecoration?.dispose();
    this._obfuscationDecoration = undefined;

    this._currentLineDecoration?.dispose();
    this._currentLineDecoration = undefined;

    this._currentColumnDecoration?.dispose();
    this._currentColumnDecoration = undefined;
  }
}
