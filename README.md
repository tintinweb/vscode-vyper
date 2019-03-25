![image](./images/icon.png)
# vscode-Vyper

Ethereum Vyper language support for Visual Studio Code


## Features

#### Passive Features

* Vyper syntax highlighting support

#### Active Features

Note: Active features can be disabled by setting `Settings` → `Vyper` → `Mode: Active` to `false`.

* Provides Security augmented decorations (`Settings` → `Vyper` → `Decoration: Enable`)
* Provides Hover information (`Settings` → `Vyper` → `Hover: Enable`)
* Provides Code snippets for common language constructs
* Integrates with the vyper compiler (based on `truffle-compile-vyper`)
  * automatically compile contracts on save (`Settings` → `Vyper` → `Compile: On Save`)
  * compilation can be triggered by executing a vscode command (`cmd + shift + p` → `Vyper: Compile`)
  * vyper location/command can be customized (default assumes `vyper` is in `PATH`) (`Settings` → `Vyper` → `Command`)
* Integrates with [MythX](https://www.mythx.io/#faq)
  * [sign-up](https://www.mythx.io/#faq) with your ethereum address (username)
  * set your username and password (`Settings` → `Vyper` → `MythX: Ethaddress` / `Settings` → `Vyper` → `MythX: Password` or `env.MYTHX_ETH_ADDRESS` / `env.MYTHX_PASSWORD`; configuration takes precedence)
  * automatically analyze for security issues when saving the file (`Settings` → `Vyper` → `Analysis: On Save`)
  
## Requirements

* It is assumed that vyper is installed and generally available on the system (`pip install vyper`). In case vyper is not available in path or called in a virtualenv configure the vyper command in `Settings` → `Vyper` → `Command`

## Extension Settings

![image](https://user-images.githubusercontent.com/2865694/54860098-67a48d00-4d15-11e9-951e-e8422bc3fae5.png)

## Tour

#### Syntax Highlighting

![image](https://user-images.githubusercontent.com/2865694/54860156-63c53a80-4d16-11e9-9c94-0bdead2346b6.png)

#### Compiler Errors and Details

![image](https://user-images.githubusercontent.com/2865694/54860166-a1c25e80-4d16-11e9-9352-89e380b3b498.png)


#### Hover information

![image](https://user-images.githubusercontent.com/2865694/54860173-b6065b80-4d16-11e9-8dba-84107c6ac726.png)


#### Security Augmented Decorations - Auditor Mode

![image](https://user-images.githubusercontent.com/2865694/54860188-ff56ab00-4d16-11e9-92a7-01e6c2ddcbf1.png)

#### Snippets

* Quickly create `constructor`, `fallback` function, `methods`, `structs`, ... as you type. Select the snippet from the suggestion box. See [snippets/vyper.json](./snippets/vyper.json) for a list of available snippets.
* start typing ...

![image](https://user-images.githubusercontent.com/2865694/54860223-6e340400-4d17-11e9-8b21-49deed0db4db.png)

* creates a template constructor after selecting it from the suggestion box.

![image](https://user-images.githubusercontent.com/2865694/54860229-75f3a880-4d17-11e9-93fc-e2a02ac60459.png)

## Developer Notes

* install vyper `pip3 install vyper`
* use the script in `./scripts/fetch_vyper_language_spec.py` or run `npm run fetchGrammar` to merge the python tmlanguage spec with vyper language specifics.

## Release Notes

see [CHANGELOG](./CHANGELOG.md)

### 0.0.3

- mythx support (auto analyze onSave)
- shellescape file paths
- fixed some typos


-----------------------------------------------------------------------------------------------------------
