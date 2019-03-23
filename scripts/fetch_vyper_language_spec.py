#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
@author github.com/tintinweb

vyper language specification merger for vscode

python3 viper_extract.py > vyper.tmlanguage.json
"""
import vyper
import json

class VyperLang:
    # https://github.com/ethereum/vyper/blob/master/vyper/functions/functions.py
    builtin_functions = vyper.functions.functions.dispatch_table.keys()
    builtin_raw_functions = vyper.functions.functions.stmt_dispatch_table.keys()
    # https://github.com/ethereum/vyper/blob/master/vyper/utils.py
    base_types = set(["wei_value","bytearray","timestamp","timedelta","bytes","string"] + list(vyper.utils.base_types))
    call_keywords = vyper.utils.valid_call_keywords
    units = vyper.utils.valid_units
    global_keywords = vyper.utils.valid_global_keywords
    reserved_words = vyper.utils.reserved_words
    fallback_name = "__default__"
    constructor_name = "__init__"
    modifiers_safe = ["private","nonrentant","constant","event"]
    modifiers_unsafe = ["public","payable","modifying"]
    var_types_ref = ["map","struct"]
    constants = ["ZERO_ADDRESS","EMPTY_BYTES32","MAX_INT128","MAX_DECIMAL","MIN_DECIMAL","MAX_UINT256"]
    interface_decl = ["implements"]
    special_vars = ["log","msg","block"]


    tmlanguage_match_wordboundary = "(?x)\n  \\b (%(match)s) \\b\n"
    tmlanguage_match_functions = "(?x)\n  (?<!\\.) \\b(\n    %(match)s   )\\b\n"
    tmlanguage_match_types = "(?x)\n  (?<!\\.) \\b(\n    %(match)s \n\n    (?# Although 'super' is not a type, it's related to types,\n        and is special enough to be highlighted differently from\n        other built-ins)\n    | super\n  )\\b\n"


    @staticmethod
    def generate_tmlanguage(template_file):

        template = json.loads(template_file)

        repo = template["repository"]

        # add fallback/constructor
        repo["function-def-name"]["patterns"].insert(0,{
            "name":"entity.name.function.constructor.vyper",
            "match": VyperLang.tmlanguage_match_wordboundary % {"match":VyperLang.constructor_name}
        })
        repo["function-def-name"]["patterns"].insert(0,{
            "name": "entity.name.function.fallback.vyper",
            "match": VyperLang.tmlanguage_match_wordboundary % {"match": VyperLang.fallback_name}
        })
        # add builtin functions
        repo["builtin-functions"]["patterns"].append({
            "name":"support.function.builtin.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.builtin_functions)}
        })
        repo["builtin-functions"]["patterns"].append({
            "name": "support.function.builtin.lowlevel.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.builtin_raw_functions)}
        })
        repo["builtin-functions"]["patterns"].append({
            "name": "support.type.event.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": "event"}
        })
        # add maps and structs
        repo["builtin-functions"]["patterns"].append({
            "name": "support.type.reference.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.var_types_ref)}
        })

        # modifiers
        repo["builtin-functions"]["patterns"].append({
            "name": "support.function.builtin.modifiers.safe.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.modifiers_safe)}
        })
        repo["builtin-functions"]["patterns"].append({
            "name": "support.function.builtin.modifiers.unsafe.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.modifiers_unsafe)}
        })
        #builtin types
        #fix array
        repo["builtin-types"] = {"patterns":[repo["builtin-types"]]}
        #
        repo["builtin-types"]["patterns"].append({
            "name": "support.type.basetype.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.base_types)}
        })
        repo["builtin-types"]["patterns"].append({
            "name": "support.type.keywords.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.call_keywords)}
        })
        repo["builtin-types"]["patterns"].append({
            "name": "support.type.unit.vyper",
            "match": VyperLang.tmlanguage_match_types % {"match": " | ".join(VyperLang.units)}
        })
        repo["builtin-types"]["patterns"].append({
            "name": "support.type.constant.vyper",
            "match": VyperLang.tmlanguage_match_types % {"match": " | ".join(VyperLang.constants)}
        })
        repo["builtin-types"]["patterns"].append({
            "name": "entity.other.inherited-class.interface.vyper",
            "match": VyperLang.tmlanguage_match_functions % {"match": " | ".join(VyperLang.interface_decl)}
        })
        repo["special-variables-types"] = {"patterns":[]}
        for special in VyperLang.special_vars:
            repo["special-variables-types"]["patterns"].append({
                "name": "variable.language.special.%s.vyper"%special,
                "match": VyperLang.tmlanguage_match_functions % {"match": special}
            })
        # link patterns
        #special-variables-vyper
        for repo_item in ("expression-bare","member-access-base","item-name"):
            repo[repo_item]["patterns"].append({
                    "include": "#special-variables-types"
                },)
        # add all reserved names as fallback
        repo["reserved-names-vyper"] = {
            "name":"name.reserved.vyper",
            "match": VyperLang.tmlanguage_match_wordboundary % {"match": " | ".join(VyperLang.reserved_words)}
            }
        template["patterns"].append({
            "include": "#reserved-names-vyper"
        }, )

        template["name"] = "Vyper"
        template["scopeName"] = "source.vyper"
        print(json.dumps(template, indent=4, sort_keys=False))

if __name__=="__main__":
    import requests
    python_tmlanguage = requests.get("https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json").text
    VyperLang.generate_tmlanguage(python_tmlanguage)
