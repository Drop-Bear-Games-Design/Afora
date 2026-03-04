import * as vscode from 'vscode';
import type { Feature, ScanResult, BraceToken } from '../../types';
import type { DecorationManager } from '../../decorationManager';
import type { ConfigManager } from '../../configManager';

const OPEN_BRACES = new Set(['(', '{', '[']);
const CLOSE_BRACES = new Set([')', '}', ']']);
const BRACE_PAIRS: Record<string, string> = {
  ')': '(',
  '}': '{',
  ']': '[',
};

export class RainbowDecorator implements Feature {
  readonly id = 'rainbowBraces';

  constructor(
    private readonly decorations: DecorationManager,
    private readonly config: ConfigManager,
  ) {}

  apply(editor: vscode.TextEditor, scanResult: ScanResult): void {
    if (!this.config.rainbowBracesEnabled) {
      this.clear(editor);
      return;
    }

    const maxDepth = this.config.rainbowMaxDepth;
    const mode = this.config.rainbowMode;
    const doc = editor.document;

    // Buckets: one range array per depth, plus mismatch
    const depthRanges: vscode.Range[][] = [];
    for (let i = 0; i < maxDepth; i++) {
      depthRanges.push([]);
    }
    const mismatchRanges: vscode.Range[] = [];

    if (mode === 'unified') {
      this.applyUnified(doc, scanResult.braces, maxDepth, depthRanges, mismatchRanges);
    } else {
      this.applyPerBrace(doc, scanResult.braces, maxDepth, depthRanges, mismatchRanges);
    }

    // Set decorations
    for (let i = 0; i < maxDepth; i++) {
      editor.setDecorations(this.decorations.getRainbowDecoration(i, maxDepth), depthRanges[i]);
    }
    editor.setDecorations(this.decorations.getMismatchDecoration(), mismatchRanges);
  }

  private applyUnified(
    doc: vscode.TextDocument,
    braces: BraceToken[],
    maxDepth: number,
    depthRanges: vscode.Range[][],
    mismatchRanges: vscode.Range[],
  ): void {
    let depth = 0;
    const stack: string[] = [];

    for (const token of braces) {
      const range = new vscode.Range(
        token.line, token.character,
        token.line, token.character + 1,
      );

      if (OPEN_BRACES.has(token.char)) {
        const colorIdx = depth % maxDepth;
        depthRanges[colorIdx].push(range);
        stack.push(token.char);
        depth++;
      } else if (CLOSE_BRACES.has(token.char)) {
        const expected = BRACE_PAIRS[token.char];
        if (stack.length === 0 || stack[stack.length - 1] !== expected) {
          mismatchRanges.push(range);
        } else {
          depth--;
          stack.pop();
          const colorIdx = depth % maxDepth;
          depthRanges[colorIdx].push(range);
        }
      }
    }

    // Any unclosed openers left on stack are mismatches
    // (We can't easily go back to mark them, but they remain colored at their depth)
  }

  private applyPerBrace(
    doc: vscode.TextDocument,
    braces: BraceToken[],
    maxDepth: number,
    depthRanges: vscode.Range[][],
    mismatchRanges: vscode.Range[],
  ): void {
    const depths: Record<string, number> = { '(': 0, '{': 0, '[': 0 };
    const stacks: Record<string, string[]> = { '(': [], '{': [], '[': [] };

    for (const token of braces) {
      const range = new vscode.Range(
        token.line, token.character,
        token.line, token.character + 1,
      );

      if (OPEN_BRACES.has(token.char)) {
        const d = depths[token.char];
        const colorIdx = d % maxDepth;
        depthRanges[colorIdx].push(range);
        stacks[token.char].push(token.char);
        depths[token.char]++;
      } else if (CLOSE_BRACES.has(token.char)) {
        const open = BRACE_PAIRS[token.char];
        if (stacks[open].length === 0) {
          mismatchRanges.push(range);
        } else {
          depths[open]--;
          stacks[open].pop();
          const colorIdx = depths[open] % maxDepth;
          depthRanges[colorIdx].push(range);
        }
      }
    }
  }

  clear(editor: vscode.TextEditor): void {
    const maxDepth = this.config.rainbowMaxDepth;
    for (let i = 0; i < maxDepth; i++) {
      editor.setDecorations(this.decorations.getRainbowDecoration(i, maxDepth), []);
    }
    editor.setDecorations(this.decorations.getMismatchDecoration(), []);
  }

  dispose(): void {
    // Decoration types are owned by DecorationManager
  }
}
