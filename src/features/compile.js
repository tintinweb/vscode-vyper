/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
 * */

const vscode = require("vscode")
const path = require("path");
const exec = require("child_process").exec;
const async = require("async");

var vyperCommand = "vyper";
var compiler = {
    name: "vyper",
    version: null
}

var VYPER_ID = null;
const VYPER_PATTERN = " **/*.{vy,v.py,vyper.py}";

const compile = {};
var compilerDiagnosticCollection;

compile.display = function(paths, options) {
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
    exec(vyperCommand + " --version", function(err, stdout, stderr) {
        if (err)
            return callback(`Error executing vyper:\n${stderr}`);

        compiler.version = stdout.trim();

        callback(null);
    });
}

// Execute vyper for single source file
function execVyper(source_path, callback) {
    const formats = ["abi", "bytecode", "bytecode_runtime"];

    const command = `${vyperCommand} -f${formats.join(",")} "${source_path.replace(/'/g, `'\\''`)}"`;

    exec(command, function(err, stdout, stderr) {
        if (err)
            return callback(
                `${stderr}\nCompilation of ${source_path} failed. See above.`
            );
        var outputs = stdout.split(/\r?\n/);

        const compiled_contract = outputs.reduce(function(contract, output, index) {
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
        function(source_path, c) {
            execVyper(source_path, function(err, compiled_contract) {
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
        function(err, contracts) {
            if (err) return callback(err);

            const result = contracts.reduce(function(result, contract) {
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

    checkVyper(function(err) {
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
compileVyper.all = function(options, callback) {
    return compile.all(updateContractsDirectory(options), callback);
};

// wrapper for compile.necessary. only updates contracts_directory to find .vy
compileVyper.necessary = function(options, callback) {
    return compile.necessary(updateContractsDirectory(options), callback);
};

function compileActiveFileCommand(contractFile) {
    compileActiveFile(contractFile)
        .then(
            (errormsg) => {
                compilerDiagnosticCollection.clear();
                vscode.window.showErrorMessage('[Compiler Error] ' + errormsg);
                let lineNr = 1; // add default errors to line 0 if not known
                let matches = /(?:line\s+(\d+))/gm.exec(errormsg)
                if (matches && matches.length==2){
                    //only one line ref
                    lineNr = parseInt(matches[1])
                }

                let lines = errormsg.split(/\r?\n/)
                console.log(errormsg)
                let shortmsg = lines[0]

                // IndexError
                if (lines.indexOf("SyntaxError: invalid syntax") > -1) {
                    let matches = /line (\d+)/gm.exec(errormsg)
                    if (matches.length >= 2) {
                        lineNr = parseInt(matches[1])
                    }
                    shortmsg = "SyntaxError: invalid syntax";
                } else {
                    //match generic vyper exceptions
                    let matches = /vyper\.exceptions\.\w+Exception:\s+(?:line\s+(\d+)).*$/gm.exec(errormsg)
                    if (matches && matches.length > 0) {
                        shortmsg = matches[0]
                        if (matches.length >= 2) {
                            lineNr = parseInt(matches[1])
                        }
                    }


                }
                if (errormsg) {
                    compilerDiagnosticCollection.set(contractFile, [{
                        code: '',
                        message: shortmsg,
                        range: new vscode.Range(new vscode.Position(lineNr - 1, 0), new vscode.Position(lineNr - 1, 255)),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: errormsg,
                        relatedInformation: []
                    }]);
                }
            },
            (success) => {
                compilerDiagnosticCollection.clear();
                vscode.window.showInformationMessage('[Compiler success] ' + Object.keys(success).join(","))
            }
        )
        .catch(ex => {
            vscode.window.showErrorMessage('[Compiler Exception] ' + ex)
            console.error(ex)
        })
}

function compileActiveFile(contractFile) {
    return new Promise((reject, resolve) => {
        console.log("----compile init----")
        if (!contractFile && vscode.window.activeTextEditor.document.languageId !== VYPER_ID) {
            reject("Not a vyper source file")
            return;
        }
        let options = {
            contractsDirectory: "./contracts",
            working_directory: "",
            all: true,
            paths: [typeof contractFile == "undefined" ? vscode.window.activeTextEditor.document.uri.path : contractFile.path]
        }

        compileVyper(options, function(err, result, paths, compilerInfo) {
            if (err) {
                reject(err)
            } else {
                resolve(result, paths, compilerInfo)
            }
        })
    })
}

function init(context, type, vyperConfig) {
    VYPER_ID = type
    compilerDiagnosticCollection = vscode.languages.createDiagnosticCollection('Vyper Compiler');
    context.subscriptions.push(compilerDiagnosticCollection)
    vyperCommand = vyperConfig.command
}

module.exports = {
    init: init,
    compileContractCommand: compileActiveFileCommand,
    compileContract: compileActiveFile
}