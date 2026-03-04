import * as vscode from 'vscode';
import type { ConfigManager } from '../../configManager';

export class PresentationMode {
  private active = false;
  private savedFontSize?: number;
  private savedZoomLevel?: number;

  constructor(private readonly config: ConfigManager) {}

  async toggle(): Promise<void> {
    if (this.active) {
      await this.deactivate();
    } else {
      await this.activate();
    }
  }

  private async activate(): Promise<void> {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const windowConfig = vscode.workspace.getConfiguration('window');

    // Save current values
    this.savedFontSize = editorConfig.get<number>('fontSize');
    this.savedZoomLevel = windowConfig.get<number>('zoomLevel');

    // Apply presentation values
    await editorConfig.update('fontSize', this.config.presentationFontSize, vscode.ConfigurationTarget.Global);
    await windowConfig.update('zoomLevel', this.config.presentationZoomLevel, vscode.ConfigurationTarget.Global);

    this.active = true;
    vscode.window.showInformationMessage('Afora: Presentation Mode enabled');
  }

  private async deactivate(): Promise<void> {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const windowConfig = vscode.workspace.getConfiguration('window');

    if (this.savedFontSize !== undefined) {
      await editorConfig.update('fontSize', this.savedFontSize, vscode.ConfigurationTarget.Global);
    }
    if (this.savedZoomLevel !== undefined) {
      await windowConfig.update('zoomLevel', this.savedZoomLevel, vscode.ConfigurationTarget.Global);
    }

    this.active = false;
    vscode.window.showInformationMessage('Afora: Presentation Mode disabled');
  }

  get isActive(): boolean {
    return this.active;
  }

  dispose(): void {
    if (this.active) {
      // Best-effort restore on dispose
      this.deactivate().catch(() => {});
    }
  }
}
