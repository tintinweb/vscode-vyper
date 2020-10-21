'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
/** imports */
const vscode = require('vscode');

const LANGUAGE_ID = "vyper";

function extensionConfig() {
    return vscode.workspace.getConfiguration(LANGUAGE_ID);
}

module.exports = {
    LANGUAGE_ID: LANGUAGE_ID,
    extensionConfig: extensionConfig
};