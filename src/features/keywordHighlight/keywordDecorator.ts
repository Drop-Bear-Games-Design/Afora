import * as vscode from 'vscode';
import type { Feature, ScanResult, KeywordCategory, CommentRegion, StringRegion } from '../../types';
import type { DecorationManager } from '../../decorationManager';
import type { ConfigManager } from '../../configManager';
import { languageRegistry } from '../../languages';

interface ExclusionZone {
  start: number;
  end: number;
}

export class KeywordDecorator implements Feature {
  readonly id = 'keywordHighlight';

  constructor(
    private readonly decorations: DecorationManager,
    private readonly config: ConfigManager,
  ) {}

  apply(editor: vscode.TextEditor, scanResult: ScanResult): void {
    if (!this.config.keywordsEnabled) {
      this.clear(editor);
      return;
    }

    const langId = editor.document.languageId;
    const langDef = languageRegistry.get(langId);
    if (!langDef) {
      this.clear(editor);
      return;
    }

    // Build exclusion zones from strings and comments
    const exclusions = this.buildExclusionZones(scanResult);

    const text = editor.document.getText();
    const categories: KeywordCategory[] = ['flowControl', 'query', 'visibility'];

    for (const category of categories) {
      const enabled = this.isCategoryEnabled(category);
      const decType = this.decorations.getKeywordDecoration(category);

      if (!enabled || !decType) {
        editor.setDecorations(decType, []);
        continue;
      }

      const keywords = this.getKeywords(langDef, langId, category);
      if (keywords.length === 0) {
        editor.setDecorations(decType, []);
        continue;
      }

      const ranges = this.findKeywordRanges(editor.document, text, keywords, exclusions, langDef.caseInsensitive);
      editor.setDecorations(decType, ranges);
    }
  }

  private getKeywords(
    langDef: import('../../types').LanguageDefinition,
    langId: string,
    category: KeywordCategory,
  ): string[] {
    const base = langDef.keywords[category] || [];
    const additional = this.config.getAdditionalKeywords(category, langId);
    if (additional.length === 0) return base;
    return [...base, ...additional];
  }

  private isCategoryEnabled(category: KeywordCategory): boolean {
    switch (category) {
      case 'flowControl': return this.config.keywordCategoryEnabled.flowControl;
      case 'query': return this.config.keywordCategoryEnabled.query;
      case 'visibility': return this.config.keywordCategoryEnabled.visibility;
    }
  }

  private buildExclusionZones(scanResult: ScanResult): ExclusionZone[] {
    const zones: ExclusionZone[] = [];
    for (const s of scanResult.strings) {
      zones.push({ start: s.start, end: s.end });
    }
    for (const c of scanResult.comments) {
      zones.push({ start: c.start, end: c.end });
    }
    zones.sort((a, b) => a.start - b.start);
    return zones;
  }

  private isInExclusionZone(offset: number, zones: ExclusionZone[]): boolean {
    // Binary search
    let lo = 0;
    let hi = zones.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const zone = zones[mid];
      if (offset < zone.start) {
        hi = mid - 1;
      } else if (offset >= zone.end) {
        lo = mid + 1;
      } else {
        return true;
      }
    }
    return false;
  }

  private findKeywordRanges(
    doc: vscode.TextDocument,
    text: string,
    keywords: string[],
    exclusions: ExclusionZone[],
    caseInsensitive?: boolean,
  ): vscode.Range[] {
    if (keywords.length === 0) return [];

    const flags = caseInsensitive ? 'gi' : 'g';
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, flags);

    const ranges: vscode.Range[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const offset = match.index;
      if (this.isInExclusionZone(offset, exclusions)) continue;

      const pos = doc.positionAt(offset);
      const endPos = doc.positionAt(offset + match[0].length);
      ranges.push(new vscode.Range(pos, endPos));
    }

    return ranges;
  }

  clear(editor: vscode.TextEditor): void {
    const categories: KeywordCategory[] = ['flowControl', 'query', 'visibility'];
    for (const category of categories) {
      editor.setDecorations(this.decorations.getKeywordDecoration(category), []);
    }
  }

  dispose(): void {}
}
