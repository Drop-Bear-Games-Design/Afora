import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { DecorationManager } from './decorationManager';
import { languageRegistry } from './languages';
import { scan } from './features/rainbowBraces/braceScanner';
import { RainbowDecorator } from './features/rainbowBraces/rainbowDecorator';
import { KeywordDecorator } from './features/keywordHighlight/keywordDecorator';
import { EscapeDecorator } from './features/escapeSequences/escapeDecorator';
import { PresentationMode } from './features/presentationMode';
import { TextObfuscation } from './features/textObfuscation';
import { CurrentLineColumn } from './features/currentLineColumn';
import { debounce } from './util/debounce';
import { DisposableStore } from './util/disposable';
import type { ScanResult, Feature } from './types';

let disposables: DisposableStore;

export function activate(context: vscode.ExtensionContext): void {
  disposables = new DisposableStore();

  const config = new ConfigManager();
  disposables.add(config);

  const decorationMgr = new DecorationManager();
  disposables.add(decorationMgr);

  // Core features that depend on scan results
  const rainbowDecorator = new RainbowDecorator(decorationMgr, config);
  const keywordDecorator = new KeywordDecorator(decorationMgr, config);
  const escapeDecorator = new EscapeDecorator(decorationMgr, config);
  const textObfuscation = new TextObfuscation(decorationMgr, config);

  const coreFeatures: Feature[] = [rainbowDecorator, keywordDecorator, escapeDecorator, textObfuscation];

  // Standalone features
  const presentationMode = new PresentationMode(config);
  disposables.add(presentationMode);

  const currentLineColumn = new CurrentLineColumn(decorationMgr, config);
  disposables.add(currentLineColumn);
  currentLineColumn.start();

  // --- Decoration update logic ---

  function updateDecorations(editor: vscode.TextEditor): void {
    const doc = editor.document;

    // Max file size check
    const maxSize = config.maxFileSize;
    if (maxSize > 0 && doc.getText().length > maxSize) {
      for (const feature of coreFeatures) {
        feature.clear(editor);
      }
      return;
    }

    // Get language definition
    const langDef = languageRegistry.get(doc.languageId);
    if (!langDef) {
      for (const feature of coreFeatures) {
        feature.clear(editor);
      }
      return;
    }

    // Compute visible range with buffer
    const visibleRanges = editor.visibleRanges;
    if (visibleRanges.length === 0) return;

    const firstVisible = visibleRanges[0].start.line;
    const lastVisible = visibleRanges[visibleRanges.length - 1].end.line;
    const bufferLines = 50;
    const startLine = Math.max(0, firstVisible - bufferLines);
    const endLine = Math.min(doc.lineCount - 1, lastVisible + bufferLines);

    const startPos = new vscode.Position(startLine, 0);
    const endPos = doc.lineAt(endLine).range.end;
    const range = new vscode.Range(startPos, endPos);
    const text = doc.getText(range);

    const startOffset = doc.offsetAt(startPos);
    const scanResult = scan(text, langDef, startOffset, startLine, 0);

    // Apply all features
    for (const feature of coreFeatures) {
      feature.apply(editor, scanResult);
    }
  }

  const debouncedUpdate = debounce((editor: vscode.TextEditor) => {
    updateDecorations(editor);
  }, config.debounceMs);

  const debouncedScrollUpdate = debounce((editor: vscode.TextEditor) => {
    updateDecorations(editor);
  }, config.scrollDebounceMs);

  // --- Event handlers ---

  // Active editor change - immediate
  disposables.add(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        updateDecorations(editor);
      }
    }),
  );

  // Document change - debounced
  disposables.add(
    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        debouncedUpdate(editor);
      }
    }),
  );

  // Scroll - debounced
  disposables.add(
    vscode.window.onDidChangeTextEditorVisibleRanges(event => {
      debouncedScrollUpdate(event.textEditor);
    }),
  );

  // Config change - recreate decorations
  config.onDidChangeConfig(() => {
    // Recreate debounced functions with new timing
    debouncedUpdate.cancel();
    debouncedScrollUpdate.cancel();

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      updateDecorations(editor);
    }
  });

  // --- Commands ---

  context.subscriptions.push(
    vscode.commands.registerCommand('afora.toggleRainbowBraces', () => {
      const current = config.rainbowBracesEnabled;
      vscode.workspace.getConfiguration('afora').update('rainbowBraces.enabled', !current, vscode.ConfigurationTarget.Global);
    }),

    vscode.commands.registerCommand('afora.toggleKeywordHighlighting', () => {
      const current = config.keywordsEnabled;
      vscode.workspace.getConfiguration('afora').update('keywords.enabled', !current, vscode.ConfigurationTarget.Global);
    }),

    vscode.commands.registerCommand('afora.toggleEscapeSequences', () => {
      const current = config.escapeSequencesEnabled;
      vscode.workspace.getConfiguration('afora').update('escapeSequences.enabled', !current, vscode.ConfigurationTarget.Global);
    }),

    vscode.commands.registerCommand('afora.togglePresentationMode', () => {
      presentationMode.toggle();
    }),

    vscode.commands.registerCommand('afora.toggleTextObfuscation', () => {
      const current = config.textObfuscationEnabled;
      vscode.workspace.getConfiguration('afora').update('textObfuscation.enabled', !current, vscode.ConfigurationTarget.Global);
    }),
  );

  // Initial decoration for active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    updateDecorations(activeEditor);
  }

  // Add disposables to context
  context.subscriptions.push({ dispose: () => disposables.dispose() });
}

export function deactivate(): void {
  if (disposables) {
    disposables.dispose();
  }
}
