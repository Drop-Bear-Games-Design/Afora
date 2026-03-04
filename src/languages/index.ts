import type { LanguageDefinition } from '../types';

import { definition as csharpDef } from './csharp';
import { definition as javascriptDef } from './javascript';
import { definitions as typescriptDefs } from './typescript';
import { definition as pythonDef } from './python';
import { definition as javaDef } from './java';
import { definitions as cppDefs } from './cpp';
import { definition as goDef } from './go';
import { definition as rustDef } from './rust';
import { definition as phpDef } from './php';
import { definition as rubyDef } from './ruby';
import { definition as fsharpDef } from './fsharp';
import { definition as vbDef } from './vb';
import { definition as sqlDef } from './sql';
import { definition as powershellDef } from './powershell';
import { definition as rDef } from './r';
import { definitions as cssDefs } from './css';
import { definitions as htmlDefs } from './html';

/** Registry mapping VS Code language IDs to their definitions */
export const languageRegistry: Map<string, LanguageDefinition> = new Map();

/** All single-definition languages */
const singleDefinitions: LanguageDefinition[] = [
  csharpDef,
  javascriptDef,
  pythonDef,
  javaDef,
  goDef,
  rustDef,
  phpDef,
  rubyDef,
  fsharpDef,
  vbDef,
  sqlDef,
  powershellDef,
  rDef,
];

/** All multi-definition languages (one definition per VS Code language ID) */
const multiDefinitions: LanguageDefinition[][] = [
  typescriptDefs,
  cppDefs,
  cssDefs,
  htmlDefs,
];

// Register all single-ID languages
for (const def of singleDefinitions) {
  languageRegistry.set(def.id, def);
}

// Register all multi-ID languages
for (const defs of multiDefinitions) {
  for (const def of defs) {
    languageRegistry.set(def.id, def);
  }
}

/**
 * Look up a language definition by VS Code language ID.
 * Returns undefined if the language is not registered.
 */
export function getLanguageDefinition(langId: string): LanguageDefinition | undefined {
  return languageRegistry.get(langId);
}
