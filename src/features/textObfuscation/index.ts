import * as vscode from 'vscode';
import type { Feature, ScanResult } from '../../types';
import type { DecorationManager } from '../../decorationManager';
import type { ConfigManager } from '../../configManager';

export class TextObfuscation implements Feature {
  readonly id = 'textObfuscation';

  constructor(
    private readonly decorations: DecorationManager,
    private readonly config: ConfigManager,
  ) {}

  apply(editor: vscode.TextEditor, _scanResult: ScanResult): void {
    if (!this.config.textObfuscationEnabled) {
      this.clear(editor);
      return;
    }

    const patterns = this.config.textObfuscationPatterns;
    if (patterns.length === 0) {
      this.clear(editor);
      return;
    }

    const text = editor.document.getText();
    const doc = editor.document;
    const ranges: vscode.Range[] = [];

    for (const patternStr of patterns) {
      try {
        const regex = new RegExp(patternStr, 'g');
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          if (match[0].length === 0) break; // avoid infinite loop on zero-length matches
          const pos = doc.positionAt(match.index);
          const endPos = doc.positionAt(match.index + match[0].length);
          ranges.push(new vscode.Range(pos, endPos));
        }
      } catch {
        // Invalid regex, skip silently
      }
    }

    editor.setDecorations(this.decorations.getObfuscationDecoration(), ranges);
  }

  clear(editor: vscode.TextEditor): void {
    editor.setDecorations(this.decorations.getObfuscationDecoration(), []);
  }

  dispose(): void {}
}
