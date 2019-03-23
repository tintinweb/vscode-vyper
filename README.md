![image](./images/icon.png)
s
# vscode-Vyper

Ethereum Vyper language support for Visual Studio Code


## Features

#### Passive Features

* Vyper syntax highlighting support

#### Active Features

Note: Active features can be disabled bye setting `Settings` → `Vyper` → `Mode: Active` to `false`.

* Compile contracts (based on `truffle-compile-vyper`)
  * automatically on save (`Settings` → `Vyper` → `Compile: On Save`)
  * execute command (`cmd + shift + p` → `Vyper: Compile`)
  * define vyper location/command (default assumes `vyper` is in `PATH`) (`Settings` → `Vyper` → `Command`)
* Security augmented decorations (`Settings` → `Vyper` → `Decoration: Enable`)
* Hover information (`Settings` → `Vyper` → `Hover: Enable`)
* Code snippets for common language constructs 

## Requirements

* It is assumed that vyper is installed on the system (`pip install vyper`)

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

* creates a template constructer after selecting it from the suggestion box.

![image](https://user-images.githubusercontent.com/2865694/54860229-75f3a880-4d17-11e9-93fc-e2a02ac60459.png)

## Developer Notes

* use the script in `./scripts/fetch_vyper_language_spec.py` to merge the python tmlanguage spec with vyper language specifics

## Release Notes

### 0.0.1

Initial release of vscode-vyper


-----------------------------------------------------------------------------------------------------------