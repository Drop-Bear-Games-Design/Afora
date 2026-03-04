# Changelog

All notable changes to the Afora extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-04

### Changed

- Updated extension icon

## [1.0.0] - 2026-03-04

### Added

- **Rainbow Braces** - colorizes matching `()`, `{}`, and `[]` by nesting depth with 9 cycling colors
  - Unified mode: all brace types share the same depth counter
  - PerBrace mode: each brace type tracks depth independently
  - Mismatched brace detection with distinct error color
- **Keyword Highlighting** - three categories with distinct colors
  - Flow control keywords (if, else, for, while, return, throw, try, catch, finally, etc.)
  - Query/LINQ keywords (select, from, where, join, orderby, group, etc.)
  - Visibility/modifier keywords (public, private, protected, static, abstract, etc.)
  - Custom keyword support per language via settings
- **Escape Sequence Highlighting** - highlights escape sequences inside strings
  - Valid escape sequences (\n, \t, \\, \uNNNN, etc.)
  - Invalid escape sequence detection
  - Printf format specifier highlighting for C/C++
- **Presentation Mode** - toggle command to switch between normal and presentation-friendly zoom/font settings
- **Text Obfuscation** - define regex patterns to obscure matching text with a solid background overlay
- **Current Line/Column Highlight** - optional cursor-following line and column highlight
- **Language support** for C#, JavaScript, TypeScript/TSX, Python, Java, C/C++, Go, Rust, PHP, Ruby, F#, Visual Basic, SQL, PowerShell, R, CSS/SCSS/Less, HTML/XML
- **Performance optimizations** - configurable debounce, scroll debounce, and max file size limits
- All colors fully customizable via `workbench.colorCustomizations`

[1.0.1]: https://github.com/Drop-Bear-Games-Design/Afora/releases/tag/v1.0.1
[1.0.0]: https://github.com/Drop-Bear-Games-Design/Afora/releases/tag/v1.0.0
