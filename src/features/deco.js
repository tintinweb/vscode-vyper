'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */
const vscode = require('vscode');

const styles = {
    foreGroundOk: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#84f56293",
        },
        light: {
            color: "#2a9b0e",
        },
        fontWeight: "bold"
    }),
    foreGroundWarning: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#f56262"
        },
        light: {
            color: "#d65353"
        },
        fontWeight: "bold",
    }),
    foreGroundWarningUnderline: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#f56262"
        },
        light: {
            color: "#d65353"
        },
        textDecoration: "underline"
    }),
    foreGroundInfoUnderline: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#ffc570"
        },
        light: {
            color: "#e4a13c"
        },
        textDecoration: "underline"
    }),
    foreGroundNewEmit: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#fffffff5",
        },
        light: {
            color: ""
        },
        fontWeight: "#c200b2ad"
    }),
    boldUnderline: vscode.window.createTextEditorDecorationType({
        fontWeight: "bold",
        textDecoration: "underline"
    }),
};

async function decorateWords(editor, decorules, decoStyle) {
    return new Promise(resolve => {
        if (!editor) {
            return;
        }
        var decos = [];
        const text = editor.document.getText();

        decorules.forEach(function (rule) {
            //var regEx = new RegExp("\\b" +word+"\\b" ,"g");
            var regEx = new RegExp(rule.regex, "g");
            let match;
            while (match = regEx.exec(text)) {
                var startPos = editor.document.positionAt(match.index);
                var endPos = editor.document.positionAt(match.index + match[rule.captureGroup].trim().length);
                //endPos.line = startPos.line; //hacky force
                var decoration = {
                    range: new vscode.Range(startPos, endPos),
                    hoverMessage: rule.hoverMessage
                };
                decos.push(decoration);
            }
        });
        editor.setDecorations(decoStyle, decos);
        resolve();
    });
}

module.exports = {
    decorateWords: decorateWords,
    styles: styles
};