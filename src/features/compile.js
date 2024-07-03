'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
 * */

const vscode = require("vscode");
const path = require("path");
const exec = require("child_process").exec;
const async = require("async");
const shellescape = require('shell-escape');
const settings = require("../settings");


var compiler = {
    name: settings.LANGUAGE_ID,
    version: null
};

var VYPER_ID = null;
const VYPER_PATTERN = " **/*.{vy,vyi}";

const compile = {};
var diagnosticCollections = {
    compiler: null
};

compile.display = function (paths, options) {
    if (options.quiet !== true) {
        if (!Array.isArray(paths)) {
            paths = Object.keys(paths);
        }

        paths.sort().forEach(contract => {
            if (path.isAbsolute(contract)) {
                contract =
                    "." + path.sep + path.relative(options.working_directory, contract);
            }
            options.logger.log("> Compiling " + contract);
        });
    }
};

function workspaceForFile(fpath) {
    let workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fpath));
    return workspace ? workspace.uri.fsPath : "";
}

// Check that vyper is available, save its version
function checkVyper(source_file, callback) {
    //allow anything as command - no shellescape to even allow python -m vyper --version etc...
    exec(`${settings.extensionConfig().command} --version`,
        { 'cwd': workspaceForFile(source_file) },
        function (err, stdout, stderr) {
            if (err)
                return callback(`Error executing vyper:\n${stderr}`);

            compiler.version = stdout.trim();

            callback(null);
        });
}

// Execute vyper for single source file
function execVyper(source_path, callback) {
    let formats;
    if (compiler.version.startsWith("0.4")) {
        // In 0.4.x, Vyper modules might be valid module to be imported 
        // but not valid contracts to compile into bytecode, hence we stop
        // the compilation at annotated_ast.
        formats = ["annotated_ast"];
    } else {
        formats = ["bytecode"];
    }
    let escapedTarget;
    if (process.platform.startsWith("win")){
        //nasty windows shell..
        if(source_path.includes('"')){
            return callback(
                `Compilation of ${source_path} failed. Invalid Filename (quotes).`
            );
        }
        escapedTarget = `"${source_path}"`;
    } else {
        //assume linux/macos.bash.
        escapedTarget = `${shellescape([source_path])}`; //is quoted.
    }
    const command = `${settings.extensionConfig().command} -f${formats.join(",")} ${escapedTarget}`;
    exec(command,
        { 'cwd': workspaceForFile(source_path) },
        function (err, stdout, stderr) {
            if (err)
                return callback(
                    `${stderr}\nCompilation of ${source_path} failed. See above.`
                );
            var outputs = stdout.split(/\r?\n/);

            const compiled_contract = outputs.reduce(function (contract, output, index) {
                return Object.assign(contract, {
                    [formats[index]]: output
                });
            }, {});

            callback(null, compiled_contract);
        });
}

// compile all options.paths
function compileAll(options, callback) {
    options.logger = options.logger || console;

    compile.display(options.paths, options);
    async.map(
        options.paths,
        function (source_path, c) {
            execVyper(source_path, function (err, compiled_contract) {
                if (err) return c(err);
                const extension = path.extname(source_path);
                const basename = path.basename(source_path, extension);

                const contract_name = basename;
                // Compiled_contract is unused at the moment but kept for future use 
                const contract_definition = {
                    contract_name: contract_name,
                    sourcePath: source_path,

                    compiler: compiler
                };

                c(null, contract_definition);
            });
        },
        function (err, contracts) {
            if (err) return callback(err);

            const result = contracts.reduce(function (result, contract) {
                result[contract.contract_name] = contract;

                return result;
            }, {});

            const compilerInfo = {
                name: "vyper",
                version: compiler.version
            };

            callback(null, result, options.paths, compilerInfo);
        }
    );
}

// Check that vyper is available then forward to internal compile function
function compileVyper(options, callback) {
    // filter out non-vyper paths


    // no vyper files found, no need to check vyper
    if (options.paths.length === 0) return callback(null, {}, []);

    checkVyper(options.paths[0], function (err) {  //@use first files workspaces as CWD
        if (err) return callback(err);

        return compileAll(options, callback);
    });
}

// append .vy pattern to contracts_directory in options and return updated options
function updateContractsDirectory(options) {
    return options.with({
        contracts_directory: path.join(options.contracts_directory, VYPER_PATTERN)
    });
}

// wrapper for compile.all. only updates contracts_directory to find .vy
compileVyper.all = function (options, callback) {
    return compile.all(updateContractsDirectory(options), callback);
};

// wrapper for compile.necessary. only updates contracts_directory to find .vy
compileVyper.necessary = function (options, callback) {
    return compile.necessary(updateContractsDirectory(options), callback);
};

function compileActiveFileCommand(contractFile) {
    if (!contractFile) {
        contractFile = vscode.window.activeTextEditor.document;
    }
    compileActiveFile(contractFile)
        .then(
            (success) => {
                diagnosticCollections.compiler.delete(contractFile.uri);
                if(settings.extensionConfig().compile.verbose){
                    vscode.window.showInformationMessage('[Compiler success] ' + Object.keys(success).join(","));
                }
                
            },
            (errormsg) => {
                if(settings.extensionConfig().compile.verbose){
                    vscode.window.showErrorMessage('[Compiler Error] ' + errormsg);
                }
                if (diagnosticCollections.compiler !== null) {
                    
                    diagnosticCollections.compiler.delete(contractFile.uri);

                    let lineNr = 1; // add default errors to line 0 if not known
                    let matches = /(?:line\s+(\d+))/gm.exec(errormsg);
                    if (matches && matches.length == 2) {
                        //only one line ref
                        lineNr = parseInt(matches[1]);
                    }

                    let lines = errormsg.split(/\r?\n/);
                    console.log(errormsg);
                    let shortmsg = lines[0];

                    // IndexError
                    if (lines.indexOf("SyntaxError: invalid syntax") > -1) {
                        let matches = /line (\d+)/gm.exec(errormsg);
                        if (matches.length >= 2) {
                            lineNr = parseInt(matches[1]);
                        }
                        shortmsg = "SyntaxError: invalid syntax";
                    } else {
                        //match generic vyper exceptions
                        let matches = /vyper\.exceptions\.\w+Exception:\s+(?:line\s+(\d+)).*$/gm.exec(errormsg);
                        if (matches && matches.length > 0) {
                            shortmsg = matches[0];
                            if (matches.length >= 2) {
                                lineNr = parseInt(matches[1]);
                            }
                        }
                    }
                    if (errormsg) {
                        diagnosticCollections.compiler.set(contractFile.uri, [{
                            code: '',
                            message: shortmsg,
                            range: new vscode.Range(new vscode.Position(lineNr - 1, 0), new vscode.Position(lineNr - 1, 255)),
                            severity: vscode.DiagnosticSeverity.Error,
                            source: errormsg,
                            relatedInformation: []
                        }]);
                    }
                }
            }
        )
        .catch(ex => {
            vscode.window.showErrorMessage('[Compiler Exception] ' + ex);
            console.error(ex);
        });
}

function compileActiveFile(contractFile) {
    return new Promise((resolve, reject) => {
        if (!contractFile || contractFile.languageId !== VYPER_ID) {
            reject("Not a vyper source file");
            return;
        }
        const fileExtension = contractFile.fileName.split('.').pop();

        if (fileExtension !== "vy") {
            reject("Skipping compilation for interface file");
            return;
        }
        let options = {
            contractsDirectory: "./contracts",
            working_directory: "",
            all: true,
            paths: [contractFile.uri.fsPath]
        };

        compileVyper(options, function (err, result, paths, compilerInfo) {
            if (err) {
                reject(err);
            } else {
                resolve(result, paths, compilerInfo);
            }
        });
    });
}

function init(context, type) {
    VYPER_ID = type;
    diagnosticCollections.compiler = vscode.languages.createDiagnosticCollection('Vyper Compiler');
    context.subscriptions.push(diagnosticCollections.compiler);
}

module.exports = {
    init: init,
    compileContractCommand: compileActiveFileCommand,
    compileContract: compileActiveFile
};