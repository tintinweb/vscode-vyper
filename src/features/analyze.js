/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * taken from the armlet example
 * */

const armlet = require('armlet')
const vscode = require('vscode')

const analyze = {
    mythX : function (ethAddress, password, bytecode){
        //returns a promise!
        const client = new armlet.Client(
            {
                password: password,
                ethAddress: ethAddress
            })
        const data = {
            "bytecode": bytecode,
        };
        return client.analyzeWithStatus(
            {
            "data": data,    // required
            "timeout": 2 * 60 * 1000,  // optional, but can improve response time
            "debug": false,            // optional: set to true if you want to see what's going on
            })
    }
}

const mythXSeverityToVSCodeSeverity = {
    "High": vscode.DiagnosticSeverity.Error,
    "Medium": vscode.DiagnosticSeverity.Warning,
    "Low": vscode.DiagnosticSeverity.Information,
}

module.exports = {
    analyze:analyze,
    mythXSeverityToVSCodeSeverity:mythXSeverityToVSCodeSeverity
}
