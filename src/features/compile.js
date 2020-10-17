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
const mod_analyze = require("./analyze.js");
const shellescape = require('shell-escape');
const settings = require("../settings");


var extensionContext;
var compiler = {
    name: settings.LANGUAGE_ID,
    version: null
};

var VYPER_ID = null;
const VYPER_PATTERN = " **/*.{vy,v.py,vyper.py}";

const compile = {};
var diagnosticCollections = {
    compiler: null,
    mythx: null
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

// Check that vyper is available, save its version
function checkVyper(callback) {
    //allow anything as command - no shellescape to even allow python -m vyper --version etc...
    exec(`${settings.extensionConfig().command} --version`, function (err, stdout, stderr) {
        if (err)
            return callback(`Error executing vyper:\n${stderr}`);

        compiler.version = stdout.trim();

        callback(null);
    });
}

// Execute vyper for single source file
function execVyper(source_path, callback) {
    const formats = ["abi", "bytecode", "bytecode_runtime"];
    const command = `${settings.extensionConfig().command} -f${formats.join(",")} '${shellescape([source_path])}'`;

    exec(command, function (err, stdout, stderr) {
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
                // remove first extension from filename
                const extension = path.extname(source_path);
                const basename = path.basename(source_path, extension);

                // if extension is .py, remove second extension from filename
                const contract_name =
                    extension !== ".py" ?
                        basename :
                        path.basename(basename, path.extname(basename));

                const contract_definition = {
                    contract_name: contract_name,
                    sourcePath: source_path,

                    abi: compiled_contract.abi,
                    bytecode: compiled_contract.bytecode,
                    deployedBytecode: compiled_contract.bytecode_runtime,

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

    checkVyper(function (err) {
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
                diagnosticCollections.mythx.delete(contractFile.uri);
                vscode.window.showInformationMessage('[Compiler success] ' + Object.keys(success).join(","));

                // precedence: (1) vyperConfig, otherwise (2) process.env 
                let password = settings.extensionConfig().analysis.mythx.password || process.env.MYTHX_PASSWORD;
                let ethAddress = settings.extensionConfig().analysis.mythx.ethAddress || process.env.MYTHX_ETH_ADDRESS;

                //set to trial?
                if (ethAddress == "trial") {
                    ethAddress = ""; // "0x0000000000000000000000000000000000000000" //@note tin: there's no trial :/
                    password = "trial";
                }

                //not set and never asked
                if (false && ethAddress == "initial") { //@note: no more trial
                    if (typeof extensionContext.globalState.get("vyper.mythx.account.trial") === "undefined") {
                        vscode.window.showInformationMessage('[MythX ] Enable MythX security analysis trial mode?', "Free Trial", "Tell me more!", "No, Thanks!")
                            .then(choice => {
                                if (choice == "Free Trial") {
                                    extensionContext.globalState.update("vyper.mythx.account.trial", "useTrial");
                                    return compileActiveFileCommand(contractFile);
                                } else if (choice == "Tell me more!") {
                                    vscode.env.openExternal(vscode.Uri.parse("https://www.mythx.io/#faq"));
                                } else {
                                    extensionContext.globalState.update("vyper.mythx.account.trial", "noAsk");
                                }
                            });
                    }
                    if (extensionContext.globalState.get("vyper.mythx.account.trial") && extensionContext.globalState.get("vyper.mythx.account.trial") == "useTrial") {
                        ethAddress = "0x0000000000000000000000000000000000000000";
                        password = "trial";
                    }
                }

                if (settings.extensionConfig().analysis.onSave && ethAddress && password) {
                    //if mythx is configured
                    // bytecode
                    for (let contractKey in success) {
                        mod_analyze.analyze.mythXjs(ethAddress, password, success[contractKey].bytecode, success[contractKey].deployedBytecode)
                            .then(result => {
                                let diagIssues = [];

                                result.forEach(function (_result) {
                                    _result.issues.forEach(function (issue) {
                                        let shortmsg = `[${issue.severity}] ${issue.swcID}: ${issue.description.head}`;
                                        let errormsg = `[${issue.severity}] ${issue.swcID}: ${issue.swcTitle}\n${issue.description.head}\n${issue.description.tail}\n\nCovered Instructions/Paths: ${_result.meta.coveredInstructions}/${_result.meta.coveredPaths}`;
                                        let lineNr = 1;  // we did not submit any source so just pin it to line 0

                                        diagIssues.push({
                                            code: '',
                                            message: shortmsg,
                                            range: new vscode.Range(new vscode.Position(lineNr - 1, 0), new vscode.Position(lineNr - 1, 255)),
                                            severity: mod_analyze.mythXSeverityToVSCodeSeverity[issue.severity],
                                            source: errormsg,
                                            relatedInformation: []
                                        });
                                    });
                                });
                                diagnosticCollections.mythx.set(contractFile.uri, diagIssues);
                                vscode.window.showInformationMessage(`[MythX success] ${contractKey}: ${diagIssues.length} issues`);
                            }).catch(err => {
                                vscode.window.showErrorMessage('[MythX error] ' + err);
                                console.log(err);
                            });
                    }
                }
            },
            (errormsg) => {
                diagnosticCollections.compiler.delete(contractFile.uri);
                diagnosticCollections.mythx.delete(contractFile.uri);
                vscode.window.showErrorMessage('[Compiler Error] ' + errormsg);
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
    diagnosticCollections.mythx = vscode.languages.createDiagnosticCollection('MythX Security Platform');
    context.subscriptions.push(diagnosticCollections.mythx);
    extensionContext = context;
}

module.exports = {
    init: init,
    compileContractCommand: compileActiveFileCommand,
    compileContract: compileActiveFile
};