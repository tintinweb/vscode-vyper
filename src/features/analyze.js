'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */
const vscode = require('vscode');

const { Client } = require('mythxjs');

const analyze = {
    mythXjs: function (ethAddress, password, bytecode, deployedBytecode) {
        return new Promise(async (resolve, reject) => {
            //returns a promise!
            const client = new Client(ethAddress, password, 'vscode-vyper-' + vscode.extensions.getExtension('tintinweb.vscode-vyper').packageJSON.version);

            await client.login();
            const result = await client.analyze({
                "bytecode": bytecode,
                "deployedBytecode": deployedBytecode
            });

            const { uuid } = result;
            const analysisResult = await client.getDetectedIssues(uuid);
            resolve(analysisResult);
        });
    }
};

const mythXSeverityToVSCodeSeverity = {
    "High": vscode.DiagnosticSeverity.Error,
    "Medium": vscode.DiagnosticSeverity.Warning,
    "Low": vscode.DiagnosticSeverity.Information,
};

module.exports = {
    analyze: analyze,
    mythXSeverityToVSCodeSeverity: mythXSeverityToVSCodeSeverity
};