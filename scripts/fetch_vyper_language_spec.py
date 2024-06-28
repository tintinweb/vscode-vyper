#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
"""
@author github.com/tintinweb

vyper language specification merger for vscode

"""
import vyper
from vyper.builtins.functions import DISPATCH_TABLE, STMT_DISPATCH_TABLE
from vyper.semantics.types import PRIMITIVE_TYPES
import json



class VyperLang:
    builtin_functions = DISPATCH_TABLE.keys()
    builtin_raw_functions = STMT_DISPATCH_TABLE.keys()
    base_types = set(
        [
            x
            for x in PRIMITIVE_TYPES.keys()
            if not x.startswith("$")
        ]
    )
    reserved_words = (
        vyper.ast.identifiers.RESERVED_KEYWORDS
    )
    fallback_name = "__default__"
    constructor_name = "__init__"
    modifiers_safe = [
        "nonreentrant",
        "internal",
        "view",
        "pure",
        "private",
        "constant",
    ]  # private,constant for backward compatibility
    modifiers_unsafe = [
        "deploy",
        "nonpayable",
        "payable",
        "external" + "modifying",
    ]  # modifying kept for backward compatibility
    var_types_ref = [
        "struct",
        "enum",
        "flag",
        "event",
        "interface",
        "HashMap",
        "DynArray",
        "Bytes",
        "String",
    ]
    # kept for backward compatibility
    constants = [
        "ZERO_ADDRESS",
        "EMPTY_BYTES32",
        "MAX_INT128",
        "MIN_INT128",
        "MAX_DECIMAL",
        "MIN_DECIMAL",
        "MIN_UINT256",
        "MAX_UINT256",
    ]  # kept for backward compatibility
    modules = ["implements", "uses", "initializes", "exports"]
    special_vars = ["log", "msg", "block", "tx", "chain", "extcall", "staticcall"]

    tmlanguage_match_wordboundary = "(?x)\n  \\b (%(match)s) \\b\n"
    tmlanguage_match_functions = "(?x)\n  (?<!\\.) \\b(\n    %(match)s   )\\b\n"
    tmlanguage_match_types = "(?x)\n  (?<!\\.) \\b(\n    %(match)s \n\n    (?# Although 'super' is not a type, it's related to types,\n        and is special enough to be highlighted differently from\n        other built-ins)\n    | super\n  )\\b\n"

    #    "name": "support.type.keywords.vyper", <--> for syntax recognition / highlighting

    @staticmethod
    def generate_tmlanguage(template_file):
        template = json.loads(template_file)

        repo = template["repository"]

        # add fallback/constructor
        repo["function-def-name"]["patterns"].insert(
            0,
            {
                "name": "entity.name.function.constructor.vyper",
                "match": VyperLang.tmlanguage_match_wordboundary
                % {"match": VyperLang.constructor_name},
            },
        )
        repo["function-def-name"]["patterns"].insert(
            0,
            {
                "name": "entity.name.function.fallback.vyper",
                "match": VyperLang.tmlanguage_match_wordboundary
                % {"match": VyperLang.fallback_name},
            },
        )
        # add builtin functions
        repo["builtin-functions"]["patterns"].append(
            {
                "name": "support.function.builtin.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.builtin_functions)},
            }
        )
        repo["builtin-functions"]["patterns"].append(
            {
                "name": "support.function.builtin.lowlevel.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.builtin_raw_functions)},
            }
        )
        # add maps, structs, events, flags
        repo["builtin-functions"]["patterns"].append(
            {
                "name": "support.type.reference.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.var_types_ref)},
            }
        )

        # modifiers
        repo["builtin-functions"]["patterns"].append(
            {
                "name": "support.function.builtin.modifiers.safe.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.modifiers_safe)},
            }
        )
        repo["builtin-functions"]["patterns"].append(
            {
                "name": "support.function.builtin.modifiers.unsafe.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.modifiers_unsafe)},
            }
        )

        # builtin types
        # fix array
        repo["builtin-types"] = {"patterns": [repo["builtin-types"]]}
        #
        repo["builtin-types"]["patterns"].append(
            {
                "name": "support.type.basetype.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.base_types)},
            }
        )
        repo["builtin-types"]["patterns"].append(
            {
                "name": "support.type.keywords.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.reserved_words)},
            }
        )

        repo["builtin-types"]["patterns"].append(
            {
                "name": "support.type.constant.vyper",
                "match": VyperLang.tmlanguage_match_types
                % {"match": " | ".join(VyperLang.constants)},
            }
        )
        repo["builtin-types"]["patterns"].append(
            {
                "name": "entity.other.inherited-class.modules.vyper",
                "match": VyperLang.tmlanguage_match_functions
                % {"match": " | ".join(VyperLang.modules)},
            }
        )
        repo["special-variables-types"] = {"patterns": []}
        for special in VyperLang.special_vars:
            repo["special-variables-types"]["patterns"].append(
                {
                    "name": f"variable.language.special.{special}.vyper",
                    "match": VyperLang.tmlanguage_match_functions % {"match": special},
                }
            )
        # link patterns
        # special-variables-vyper
        for repo_item in ("expression-bare", "member-access-base", "item-name"):
            repo[repo_item]["patterns"].append(
                {"include": "#special-variables-types"},
            )
        # add all reserved names as fallback
        repo["reserved-names-vyper"] = {
            "name": "name.reserved.vyper",
            "match": VyperLang.tmlanguage_match_wordboundary
            % {"match": " | ".join(VyperLang.reserved_words)},
        }
        template["patterns"].append(
            {"include": "#reserved-names-vyper"},
        )

        template["name"] = "Vyper"
        template["scopeName"] = "source.vyper"
        print(json.dumps(template, indent=4, sort_keys=False))


if __name__ == "__main__":
    import requests

    python_tmlanguage = requests.get(
        "https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json"
    ).text
    VyperLang.generate_tmlanguage(python_tmlanguage)
