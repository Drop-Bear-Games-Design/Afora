import * as vscode from 'vscode';
import type { KeywordCategory } from './types';

/** Rainbow brace depth mode */
export type RainbowMode = 'unified' | 'perBrace';

/** Snapshot of all Afora configuration values */
export interface AforaConfig {
  readonly rainbowBraces: {
    readonly enabled: boolean;
    readonly mode: RainbowMode;
    readonly maxDepth: number;
  };
  readonly keywords: {
    readonly enabled: boolean;
    readonly flowControl: {
      readonly enabled: boolean;
      readonly additionalKeywords: Record<string, string[]>;
    };
    readonly query: {
      readonly enabled: boolean;
      readonly additionalKeywords: Record<string, string[]>;
    };
    readonly visibility: {
      readonly enabled: boolean;
      readonly additionalKeywords: Record<string, string[]>;
    };
  };
  readonly escapeSequences: {
    readonly enabled: boolean;
    readonly highlightInvalid: boolean;
    readonly formatSpecifiers: boolean;
  };
  readonly presentationMode: {
    readonly zoomLevel: number;
    readonly fontSize: number;
  };
  readonly textObfuscation: {
    readonly enabled: boolean;
    readonly patterns: readonly string[];
  };
  readonly currentLineHighlight: {
    readonly enabled: boolean;
  };
  readonly performance: {
    readonly debounceMs: number;
    readonly scrollDebounceMs: number;
    readonly maxFileSize: number;
  };
}

const SECTION = 'afora';

/**
 * Typed wrapper around VS Code workspace configuration for the Afora extension.
 *
 * Reads from `vscode.workspace.getConfiguration('afora')` and provides
 * strongly-typed access to every setting. Fires `onDidChangeConfig` whenever
 * a relevant setting changes.
 */
export class ConfigManager implements vscode.Disposable {
  private readonly _onDidChangeConfig = new vscode.EventEmitter<AforaConfig>();
  /** Fires whenever any `afora.*` setting changes. */
  public readonly onDidChangeConfig: vscode.Event<AforaConfig> = this._onDidChangeConfig.event;

  private _config: AforaConfig;
  private readonly _disposables: vscode.Disposable[] = [];

  constructor() {
    this._config = ConfigManager._read();

    this._disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(SECTION)) {
          this._config = ConfigManager._read();
          this._onDidChangeConfig.fire(this._config);
        }
      }),
    );

    this._disposables.push(this._onDidChangeConfig);
  }

  // ---------------------------------------------------------------------------
  // Public accessors
  // ---------------------------------------------------------------------------

  /** Full immutable config snapshot. */
  get config(): AforaConfig {
    return this._config;
  }

  // -- Rainbow braces ---------------------------------------------------------

  get rainbowBracesEnabled(): boolean {
    return this._config.rainbowBraces.enabled;
  }

  get rainbowMode(): RainbowMode {
    return this._config.rainbowBraces.mode;
  }

  get rainbowMaxDepth(): number {
    return this._config.rainbowBraces.maxDepth;
  }

  // -- Keywords ---------------------------------------------------------------

  get keywordsEnabled(): boolean {
    return this._config.keywords.enabled;
  }

  get keywordCategoryEnabled(): Readonly<Record<KeywordCategory, boolean>> {
    return {
      flowControl: this._config.keywords.flowControl.enabled,
      query: this._config.keywords.query.enabled,
      visibility: this._config.keywords.visibility.enabled,
    };
  }

  /**
   * Returns the user-defined additional keywords for a given category and
   * language id.  Returns an empty array when nothing is configured.
   */
  getAdditionalKeywords(category: KeywordCategory, languageId: string): readonly string[] {
    const map = this._config.keywords[category].additionalKeywords;
    return map[languageId] ?? [];
  }

  // -- Escape sequences -------------------------------------------------------

  get escapeSequencesEnabled(): boolean {
    return this._config.escapeSequences.enabled;
  }

  get highlightInvalidEscapes(): boolean {
    return this._config.escapeSequences.highlightInvalid;
  }

  get formatSpecifiersEnabled(): boolean {
    return this._config.escapeSequences.formatSpecifiers;
  }

  // -- Presentation mode ------------------------------------------------------

  get presentationZoomLevel(): number {
    return this._config.presentationMode.zoomLevel;
  }

  get presentationFontSize(): number {
    return this._config.presentationMode.fontSize;
  }

  // -- Text obfuscation -------------------------------------------------------

  get textObfuscationEnabled(): boolean {
    return this._config.textObfuscation.enabled;
  }

  get textObfuscationPatterns(): readonly string[] {
    return this._config.textObfuscation.patterns;
  }

  // -- Current line highlight -------------------------------------------------

  get currentLineHighlightEnabled(): boolean {
    return this._config.currentLineHighlight.enabled;
  }

  // -- Performance ------------------------------------------------------------

  get debounceMs(): number {
    return this._config.performance.debounceMs;
  }

  get scrollDebounceMs(): number {
    return this._config.performance.scrollDebounceMs;
  }

  get maxFileSize(): number {
    return this._config.performance.maxFileSize;
  }

  // ---------------------------------------------------------------------------
  // Disposal
  // ---------------------------------------------------------------------------

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables.length = 0;
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Reads the current workspace configuration and builds an immutable snapshot.
   */
  private static _read(): AforaConfig {
    const cfg = vscode.workspace.getConfiguration(SECTION);

    return {
      rainbowBraces: {
        enabled: cfg.get<boolean>('rainbowBraces.enabled', true),
        mode: cfg.get<RainbowMode>('rainbowBraces.mode', 'unified'),
        maxDepth: cfg.get<number>('rainbowBraces.maxDepth', 9),
      },
      keywords: {
        enabled: cfg.get<boolean>('keywords.enabled', true),
        flowControl: {
          enabled: cfg.get<boolean>('keywords.flowControl.enabled', true),
          additionalKeywords: cfg.get<Record<string, string[]>>('keywords.flowControl.additionalKeywords', {}),
        },
        query: {
          enabled: cfg.get<boolean>('keywords.query.enabled', true),
          additionalKeywords: cfg.get<Record<string, string[]>>('keywords.query.additionalKeywords', {}),
        },
        visibility: {
          enabled: cfg.get<boolean>('keywords.visibility.enabled', true),
          additionalKeywords: cfg.get<Record<string, string[]>>('keywords.visibility.additionalKeywords', {}),
        },
      },
      escapeSequences: {
        enabled: cfg.get<boolean>('escapeSequences.enabled', true),
        highlightInvalid: cfg.get<boolean>('escapeSequences.highlightInvalid', true),
        formatSpecifiers: cfg.get<boolean>('escapeSequences.formatSpecifiers', true),
      },
      presentationMode: {
        zoomLevel: cfg.get<number>('presentationMode.zoomLevel', 2),
        fontSize: cfg.get<number>('presentationMode.fontSize', 22),
      },
      textObfuscation: {
        enabled: cfg.get<boolean>('textObfuscation.enabled', false),
        patterns: cfg.get<string[]>('textObfuscation.patterns', []),
      },
      currentLineHighlight: {
        enabled: cfg.get<boolean>('currentLineHighlight.enabled', false),
      },
      performance: {
        debounceMs: cfg.get<number>('performance.debounceMs', 500),
        scrollDebounceMs: cfg.get<number>('performance.scrollDebounceMs', 100),
        maxFileSize: cfg.get<number>('performance.maxFileSize', 1_000_000),
      },
    };
  }
}
