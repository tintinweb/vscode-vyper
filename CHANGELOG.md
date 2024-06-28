# Change Log

## 0.0.16
- new: logo for Vyper files in the explorer view
- fix: compilation for Vyper 0.4.x
- fix: don't compile interface files
- fix: correct static built-in hover information to match Vyper
- updated snippets to Vyper 0.3.x and 0.4.x
- updated language spec fetcher to Vyper 0.4.x
- updated syntax highlighting to Vyper 0.4.x
- updated the Vyper logo
- updated the banner theme on the marketplace to match Vyper colors
- removed MythX

## 0.0.15
- fix: typo in snippet `funcnonreentrant` #25

## 0.0.14
- new: suppress compiler error/success popup boxes by default. can be re-enabled by setting `vyper.compile.verbose = true`
- update: snippets to fit vyper 0.3.x #19 - thanks @msugarm
- update: dependencies

## 0.0.13 - 0.0.12
- new: vscode.dev support (vscode web extension) #12
  - Note: compiling vyper is not yet supported!
- update: updated snippets for vyper v0.3.x #11 - thanks @DataBeast-IT 🙌

## 0.0.11
- new: updated syntax to vyper v0.3.x #9 - thanks @DataBeast-IT 🙌

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
