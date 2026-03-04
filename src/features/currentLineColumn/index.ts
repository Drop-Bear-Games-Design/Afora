import * as vscode from 'vscode';
import type { DecorationManager } from '../../decorationManager';
import type { ConfigManager } from '../../configManager';

export class CurrentLineColumn {
  private disposables: vscode.Disposable[] = [];

  constructor(
    private readonly decorations: DecorationManager,
    private readonly config: ConfigManager,
  ) {}

  start(): void {
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(e => {
        this.update(e.textEditor);
      }),
    );

    // Apply to current editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.update(editor);
    }
  }

  update(editor: vscode.TextEditor): void {
    if (!this.config.currentLineHighlightEnabled) {
      this.clear(editor);
      return;
    }

    const selection = editor.selection;
    const line = selection.active.line;
    const char = selection.active.character;

    // Line highlight
    const lineRange = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);
    editor.setDecorations(this.decorations.getCurrentLineDecoration(), [lineRange]);

    // Column highlight - highlight the character at cursor position
    if (char < editor.document.lineAt(line).text.length) {
      const colRange = new vscode.Range(line, char, line, char + 1);
      editor.setDecorations(this.decorations.getCurrentColumnDecoration(), [colRange]);
    } else {
      editor.setDecorations(this.decorations.getCurrentColumnDecoration(), []);
    }
  }

  clear(editor: vscode.TextEditor): void {
    editor.setDecorations(this.decorations.getCurrentLineDecoration(), []);
    editor.setDecorations(this.decorations.getCurrentColumnDecoration(), []);
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
