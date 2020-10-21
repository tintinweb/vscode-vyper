# Change Log

## 0.0.10
- fix: an issue where the compilation would fail on windows systems #4
- update: disabled mythx.io trial code
- update: disabled signature helper (not yet implemented)
- update: quick code cleanup
- fix: allow workspace relative `vyper.command` #3

## 0.0.9
- updated mythx library: switched from `armlet` to `mythxjs`.
- fix: make settings take effect immediately.

## 0.0.8
- fix misused promises

## 0.0.7
- updated grammar
- fixed mythX issue due to API change
- fixed diagnostics handling: compiler warnings and mythx are now updated on a per file basis. 
- fixed run compile / when file is opened the first time, not only on change.

## 0.0.5 - 0.0-6
- repackage broken archive
- fix diagProvider only showing one mythx scan result

## 0.0.4
- updated Readme
- ask to start free mythx security platform trial 

## 0.0.2 - 0.0.3
- mythx support (auto analyze onSave)
- shellescape file paths
- fixed some typos

## 0.0.1
- Initial release
- Language support for syntax highlighting based on `vscode/extensions/python`
- Vyper compilation support based on `truffle-compile-vyper`
- Vyper compilation diagnostics
- Hover provider
- Security Augmented Decorations - Auditor Mode
- Snippets
- Initial SignatureHelper
