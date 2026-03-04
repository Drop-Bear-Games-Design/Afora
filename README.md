# Afora

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/dropbeargames.afora)](https://marketplace.visualstudio.com/items?itemName=dropbeargames.afora)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/dropbeargames.afora)](https://marketplace.visualstudio.com/items?itemName=dropbeargames.afora)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

Enhance code readability with rainbow braces, keyword highlighting, escape sequence coloring, and more. Inspired by [Viasfora](https://viasfora.com) ([GitHub](https://github.com/tomasr/viasfora)) for Visual Studio.

## Features

### Rainbow Braces

Colorizes matching `()`, `{}`, and `[]` by nesting depth using 9 cycling colors. Mismatched braces are highlighted in red.

- **Unified mode** (default): all brace types share the same depth counter
- **PerBrace mode**: each brace type (`()`, `{}`, `[]`) tracks depth independently

### Keyword Highlighting

Three categories of keywords, each with a distinct color:

- **Flow Control** (Tomato): `if`, `else`, `for`, `while`, `return`, `throw`, `try`, `catch`, `finally`, etc.
- **Query/LINQ** (DeepSkyBlue): `select`, `from`, `where`, `join`, `orderby`, `group`, etc.
- **Visibility** (Grey): `public`, `private`, `protected`, `static`, `abstract`, etc.

Keywords are language-aware and skip strings and comments.

### Escape Sequence Highlighting

Highlights escape sequences inside strings (`\n`, `\t`, `\\`, `\uNNNN`, etc.) with distinct colors for valid escapes, invalid escapes, and printf format specifiers.

### Presentation Mode

Toggle command that saves your current editor zoom/font size, applies presentation-friendly values, and restores on toggle off.

### Text Obfuscation

Define regex patterns in settings to obscure matching text with a solid background overlay.

### Current Line/Column Highlight

Optional line and column highlight that follows your cursor.

## Supported Languages

C#, JavaScript, TypeScript/TSX, Python, Java, C/C++, Go, Rust, PHP, Ruby, F#, Visual Basic, SQL, PowerShell, R, CSS/SCSS/Less, HTML/XML

## Commands

| Command | Description |
|---------|-------------|
| `Afora: Toggle Rainbow Braces` | Enable/disable rainbow brace colorization |
| `Afora: Toggle Keyword Highlighting` | Enable/disable keyword highlighting |
| `Afora: Toggle Escape Sequences` | Enable/disable escape sequence highlighting |
| `Afora: Toggle Presentation Mode` | Enter/exit presentation mode |
| `Afora: Toggle Text Obfuscation` | Enable/disable text obfuscation |

## Settings

All settings are under `afora.*`:

| Setting | Default | Description |
|---------|---------|-------------|
| `rainbowBraces.enabled` | `true` | Enable rainbow braces |
| `rainbowBraces.mode` | `"unified"` | `"unified"` or `"perBrace"` |
| `rainbowBraces.maxDepth` | `9` | Max nesting depth (1-16) |
| `keywords.enabled` | `true` | Enable keyword highlighting |
| `keywords.flowControl.enabled` | `true` | Highlight flow control keywords |
| `keywords.query.enabled` | `true` | Highlight query/LINQ keywords |
| `keywords.visibility.enabled` | `true` | Highlight visibility keywords |
| `keywords.flowControl.additionalKeywords` | `{}` | Extra keywords per language, e.g. `{ "python": ["pass"] }` |
| `escapeSequences.enabled` | `true` | Enable escape sequence highlighting |
| `escapeSequences.highlightInvalid` | `true` | Highlight invalid escapes |
| `escapeSequences.formatSpecifiers` | `true` | Highlight printf format specifiers |
| `presentationMode.zoomLevel` | `2` | Zoom level in presentation mode |
| `presentationMode.fontSize` | `22` | Font size in presentation mode |
| `textObfuscation.enabled` | `false` | Enable text obfuscation |
| `textObfuscation.patterns` | `[]` | Regex patterns to obfuscate |
| `currentLineHighlight.enabled` | `false` | Enable cursor line/column highlight |
| `performance.debounceMs` | `500` | Debounce delay for typing updates |
| `performance.maxFileSize` | `1000000` | Max file size to process (bytes) |

## Color Customization

All colors can be overridden in your `settings.json` under `workbench.colorCustomizations`:

```json
{
  "workbench.colorCustomizations": {
    "afora.rainbow1": "#FFA500",
    "afora.flowControlKeyword": "#FF6347",
    "afora.visibilityKeyword": "#808080"
  }
}
```

## Recommended Settings

For best results, disable VS Code's built-in bracket colorization so it doesn't conflict with Afora's rainbow braces:

```json
{
  "editor.bracketPairColorization.enabled": false
}
```

## License

[MIT](LICENSE.md)
