/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
 * */

/** imports */
const vscode = require("vscode");

const mod_deco = require("./features/deco.js")
const mod_signatures = require("./features/signatures.js")
const mod_hover = require("./features/hover/hover.js")
const mod_compile = require("./features/compile.js")
/** global vars */
const VYPER_ID = "vyper";
const vyperConfig = vscode.workspace.getConfiguration(VYPER_ID);
var activeEditor;

/** classdecs */

/** event funcs */
async function onDidSave(document){
    return new Promise((reject,resolve) =>{

        if(document.languageId!=VYPER_ID){
            resolve("langid_mismatch")
            return;
        }
        
        if(vyperConfig.compile.onSave){
            resolve(mod_compile.compileContractCommand(document.uri))
        }
    })
}

async function onDidChange(event) {
    return new Promise((reject,resolve) => {
        if(vscode.window.activeTextEditor.document.languageId!=VYPER_ID){
            resolve("langid_mismatch")
            return;
        }
        console.log("onDidChange ...")
        if(vyperConfig.decoration.enable){
            console.log("deco enable")
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"@\\b(public|payable|modifying)\\b",
                    captureGroup: 0,
                },
                {
                    regex:"\\b(send|raw_call|selfdestruct|raw_log|create_forwarder_to|blockhash)\\b",
                    captureGroup: 0,
                    hoverMessage: "❗**potentially unsafe** lowlevel call"
                },
            ], mod_deco.styles.foreGroundWarning);
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"\\b(public|payable|modifying)\\b\\(",
                    captureGroup: 1,
                },
            ], mod_deco.styles.foreGroundWarningUnderline);
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"\\b(\\.balance|msg\\.[\\w]+|block\\.[\\w]+)\\b",
                    captureGroup: 0,
                }
            ], mod_deco.styles.foreGroundInfoUnderline);
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"@?\\b(private|nonrentant|constant)\\b",
                    captureGroup: 0,
                },
            ], mod_deco.styles.foreGroundOk);
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"\\b(log)\\.",
                    captureGroup: 1,
                },
                {
                    regex:"\\b(clear)\\b\\(",
                    captureGroup: 1,
                },
            ], mod_deco.styles.foreGroundNewEmit);
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"\\b(__init__|__default__)\\b",
                    captureGroup: 0,
                },
            ], mod_deco.styles.boldUnderline);
        }
        

        console.log("✓ onDidChange")
        resolve()
    });
}
function onInitModules(context, type) {

    mod_hover.init(context, type, vyperConfig)
    mod_compile.init(context, type, vyperConfig)

}

function onActivate(context) {

    const active = vscode.window.activeTextEditor;
    if (!active || !active.document) return;
    activeEditor = active;

    console.log(" activate extension: vyper ...")

    registerDocType(VYPER_ID);
    
    function registerDocType(type) {
        context.subscriptions.push(
            vscode.languages.reg
        )

        // taken from: https://github.com/Microsoft/vscode/blob/master/extensions/python/src/pythonMain.ts ; slightly modified
        // autoindent while typing
        vscode.languages.setLanguageConfiguration(type, {
            onEnterRules: [
                {
                    beforeText: /^\s*(?:struct|def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                    action: { indentAction: vscode.IndentAction.Indent }
                }
            ]
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('vyper.compileContract', mod_compile.compileContractCommand)
        )
        
        if(!vyperConfig.mode.active){
            console.log("ⓘ activate extension: entering passive mode. not registering any active code augmentation support.")
            return;
        }
        /** module init */
        onInitModules(context, type);
        onDidChange()
        onDidSave(active.document)

        /** event setup */
        /***** OnChange */
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                onDidChange();
            }
        }, null, context.subscriptions);
        /***** OnChange */
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                onDidChange(event);
            }
        }, null, context.subscriptions);
        /***** OnSave */

        vscode.workspace.onDidSaveTextDocument(document => {
            onDidSave(document);  
        }, null, context.subscriptions);
        

        /***** SignatureHelper */
        context.subscriptions.push(
            vscode.languages.registerSignatureHelpProvider(
                {language: type}, 
                new mod_signatures.VyperSignatureHelpProvider(), 
                '(', ','
                )
            );


    }
    console.log("✓ activate extension: vyper")
}

/* exports */
exports.activate = onActivate;