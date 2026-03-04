import type { Disposable } from 'vscode';

export class DisposableStore {
  private disposables: Disposable[] = [];

  add<T extends Disposable>(d: T): T {
    this.disposables.push(d);
    return d;
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
