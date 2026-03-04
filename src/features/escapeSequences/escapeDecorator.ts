import * as vscode from 'vscode';
import type { Feature, ScanResult, StringRegion } from '../../types';
import type { DecorationManager } from '../../decorationManager';
import type { ConfigManager } from '../../configManager';
import { languageRegistry } from '../../languages';

export class EscapeDecorator implements Feature {
  readonly id = 'escapeSequences';

  constructor(
    private readonly decorations: DecorationManager,
    private readonly config: ConfigManager,
  ) {}

  apply(editor: vscode.TextEditor, scanResult: ScanResult): void {
    if (!this.config.escapeSequencesEnabled) {
      this.clear(editor);
      return;
    }

    const langId = editor.document.languageId;
    const langDef = languageRegistry.get(langId);
    if (!langDef) {
      this.clear(editor);
      return;
    }

    const text = editor.document.getText();
    const doc = editor.document;

    const escapeRanges: vscode.Range[] = [];
    const invalidRanges: vscode.Range[] = [];
    const formatRanges: vscode.Range[] = [];

    for (const region of scanResult.strings) {
      if (!region.supportsEscapes) continue;

      const strText = text.substring(region.start, region.end);

      // Find escape sequences
      if (langDef.escapePattern) {
        const pattern = new RegExp(langDef.escapePattern.source, langDef.escapePattern.flags);
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(strText)) !== null) {
          const absOffset = region.start + match.index;
          const pos = doc.positionAt(absOffset);
          const endPos = doc.positionAt(absOffset + match[0].length);
          escapeRanges.push(new vscode.Range(pos, endPos));
        }
      }

      // Find invalid escapes
      if (this.config.highlightInvalidEscapes && langDef.invalidEscapePattern) {
        const pattern = new RegExp(langDef.invalidEscapePattern.source, langDef.invalidEscapePattern.flags);
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(strText)) !== null) {
          const absOffset = region.start + match.index;
          // Skip if this position was already matched as a valid escape
          if (this.isInRanges(absOffset, escapeRanges, doc)) continue;
          const pos = doc.positionAt(absOffset);
          const endPos = doc.positionAt(absOffset + match[0].length);
          invalidRanges.push(new vscode.Range(pos, endPos));
        }
      }

      // Find format specifiers
      if (this.config.formatSpecifiersEnabled && langDef.formatSpecifierPattern) {
        const pattern = new RegExp(langDef.formatSpecifierPattern.source, langDef.formatSpecifierPattern.flags);
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(strText)) !== null) {
          const absOffset = region.start + match.index;
          const pos = doc.positionAt(absOffset);
          const endPos = doc.positionAt(absOffset + match[0].length);
          formatRanges.push(new vscode.Range(pos, endPos));
        }
      }
    }

    editor.setDecorations(this.decorations.getEscapeDecoration(), escapeRanges);
    editor.setDecorations(this.decorations.getInvalidEscapeDecoration(), invalidRanges);
    editor.setDecorations(this.decorations.getFormatSpecifierDecoration(), formatRanges);
  }

  private isInRanges(offset: number, ranges: vscode.Range[], doc: vscode.TextDocument): boolean {
    const pos = doc.positionAt(offset);
    for (const r of ranges) {
      if (r.contains(pos)) return true;
    }
    return false;
  }

  clear(editor: vscode.TextEditor): void {
    editor.setDecorations(this.decorations.getEscapeDecoration(), []);
    editor.setDecorations(this.decorations.getInvalidEscapeDecoration(), []);
    editor.setDecorations(this.decorations.getFormatSpecifierDecoration(), []);
  }

  dispose(): void {}
}
