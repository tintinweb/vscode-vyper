[<img height="71" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://consensys.io/diligence/) &nbsp; and &nbsp; [<img height="48" alt="get in touch with Consensys Diligence" src="https://github.com/tintinweb/vscode-vyper/assets/2865694/e627c8ef-79f5-4efc-acbc-8a70e1105af3">](https://www.chainsecurity.com)<br/>
<sup>
[[  🌐  ](https://consensys.io/diligence/)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.io/diligence/research)]
</sup><br/><br/>
[<img height="30" alt="vscode marketplace" src="https://github.com/user-attachments/assets/030dde14-1745-4f4e-852c-b415db9c2050">](https://marketplace.visualstudio.com/items?itemName=tintinweb.vscode-vyper) [<img height="30" alt="open-vsx" src="https://github.com/user-attachments/assets/975d31ca-5259-4bf0-8c40-b2e25cdd5ccb">](https://open-vsx.org/extension/tintinweb/vscode-vyper) 

# vscode-Vyper    
   
![img](./images/icon.png)

Ethereum [Vyper](https://www.vyperlang.org/) Language Support for [Visual Studio Code](https://code.visualstudio.com/) & [VSCodium](https://vscodium.com/)


`ext install tintinweb.vscode-vyper`


<sup>Vyper syntax also available on [vscode.dev](https://vscode.dev)!</sup> 

## Features

#### Passive Features

* Vyper syntax highlighting support

#### Active Features

Note: Active features can be disabled by setting `Settings` → `Vyper` → `Mode: Active` to `false`.

* Provides Security augmented decorations (`Settings` → `Vyper` → `Decoration: Enable`)
* Provides Hover information (`Settings` → `Vyper` → `Hover: Enable`)
* Provides Code snippets for common language constructs
* Integrates with the vyper compiler
  * automatically compile contracts on save (`Settings` → `Vyper` → `Compile: On Save`)
  * compilation can be triggered by executing a vscode command (`cmd + shift + p` → `Vyper: Compile`)
  * vyper location/command can be customized (default assumes `vyper` is in `PATH`) (`Settings` → `Vyper` → `Command`)

## Requirements

* It is assumed that vyper is installed and generally available on the system (`pip3 install vyper`). In case vyper is not available in path or called in a virtualenv configure the vyper command in `Settings` → `Vyper` → `Command`

## Tour

#### Syntax Highlighting

##### VSCode Light+ (default light)

<img width="550" alt="theme-light" src="https://user-images.githubusercontent.com/2865694/64434714-76afa980-d0c1-11e9-8836-520a1920435b.png">

##### Solidity Visual Auditor - Dark

<img width="550" alt="theme-light" src="https://user-images.githubusercontent.com/2865694/54860156-63c53a80-4d16-11e9-9c94-0bdead2346b6.png">

#### Compiler Errors and Details

<img width="600" alt="image" src="https://user-images.githubusercontent.com/2865694/54860166-a1c25e80-4d16-11e9-9352-89e380b3b498.png">


#### Hover information

<img width="600" alt="image" src="https://user-images.githubusercontent.com/2865694/54860173-b6065b80-4d16-11e9-8dba-84107c6ac726.png">


#### Security Augmented Decorations - Auditor Mode

<img width="600" alt="image" src="https://user-images.githubusercontent.com/2865694/54860188-ff56ab00-4d16-11e9-92a7-01e6c2ddcbf1.png">

#### Snippets

* Quickly create `constructor`, `fallback` function, `methods`, `structs`, ... as you type. Select the snippet from the suggestion box. See [snippets/](./snippets/) for a list of available snippets.
* start typing ...

<img width="600" alt="image" src="https://user-images.githubusercontent.com/2865694/54860223-6e340400-4d17-11e9-8b21-49deed0db4db.png">

* creates a template constructor after selecting it from the suggestion box.

<img width="600" alt="image" src="https://user-images.githubusercontent.com/2865694/54860229-75f3a880-4d17-11e9-93fc-e2a02ac60459.png">

## Extension Settings

<img width="600" alt="settings" src="https://user-images.githubusercontent.com/2865694/54860098-67a48d00-4d15-11e9-951e-e8422bc3fae5.png">

## FAQ

* **Q**: I get an error running vyper on my macbook with M1/M2 chipset.
* **A**: The extension executes the vyper compiler in a `/bin/sh` shell that may not have all the customizations you are using in your day-to-day shell/terminal. As a workaround, I suggest to set the setting:`vyper.command` to `arch -x86_64 vyper`. see #18

* **Q**: My project uses Vyper 0.3.x and import some interfaces from other contracts. but the extension does not recognize them and output `FileNotFoundError: Cannot locate interface 'interface/my_interface{.vy,.json}`.
* **A** The extension compiles your file with the command `vyper`. You should set the setting: `vyper.command` to `vyper -p path/to/your/project/directory` to make the compiler aware of the interfaces in your project.

* **Q** My multi-module project uses Vyper 0.4.x and while the extension does not report compilation error for any files, when compiling the project with the Vyper cli or some framework such as `ape`, `foundry` or `titanoboa`, it fails with some issue about modules usage/initialization.
* **A** In 0.4.x, A Vyper modules might be valid when being imported but not a valid standalone contracts to compile into bytecode. Hence the extension stops the compilation at the ``annotated_ast` phase, before the global constraint checker. For more info see https://github.com/vyperlang/vyper/pull/3810.

## Developer Notes

* install vyper `pip3 install vyper`
* use the script in `./scripts/fetch_vyper_language_spec.py` or run `npm run fetchGrammar` to merge the python tmlanguage spec with vyper language specifics.

## Release Notes

see [CHANGELOG](./CHANGELOG.md)

## Contact / Maintainer

- [tintinweb](https://github.com/tintinweb) @ [Consensys Diligence](https://consensys.io/diligence/)
- [trocher](https://github.com/trocher) @ [ChainSecurity](https://www.chainsecurity.com/)


-----------------------------------------------------------------------------------------------------------
