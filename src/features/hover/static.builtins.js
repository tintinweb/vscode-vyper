'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */

const BUILTINS = {
    "blockhash": {
        "prefix": "blockhash",
        "description": "blockhash(blockNumber: uint256) -> bytes32: hash of the given block - only works for 256 most recent, excluding current, blocks",
        "security":["Do not rely on block.timestamp and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain.","The block hashes are not available for all blocks for scalability reasons. You can only access the hashes of the most recent 256 blocks, all other values will be zero."]
    },
    "coinbase": {
        "prefix": "block.coinbase",
        "description": "block.coinbase (address): current block miner's address",
        "security":""
    },
    "difficulty": {
        "prefix": "block.difficulty",
        "description": "block.difficulty (uint256): current block difficulty",
        "security":""
    },
    "prevrandao": {
        "prefix": "block.prevrandao",
        "description": "block.prevrandao (bytes32): current randomness beacon provided by the beacon chain",
        "security":""
    },
    "gaslimit": {
        "prefix": "block.gaslimit",
        "description": "block.gaslimit (uint256): current block gaslimit",
        "security":""
    },
    "number": {
        "prefix": "block.number",
        "description": "block.number (uint256): current block number",
        "security":"Can be manipulated by miner"
    },
    "timestamp": {
        "prefix": "block.timestamp",
        "description": "block.timestamp (uint256): current block timestamp as seconds since unix epoch",
        "security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain."]
    },
    "gas": {
        "prefix": "msg.gas",
        "description": "msg.gas (uint256): remaining gas",
    },
    "msg": {
        "prefix": "msg",
        "description": "msg",
        "security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call."
    },
    "data": {
        "prefix": "msg.data",
        "description": "msg.data -> Bytes[]: complete calldata, must be used inside len() or slice()",
        "security":""
    },
    "sender": {
        "prefix": "msg.sender",
        "description": "msg.sender (address): sender of the message (current call)",
        "security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call."
    },
    "value": {
        "prefix": "msg.value",
        "description": "msg.value (uint256): number of wei sent with the message",
        "security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call."
    },
    "gasprice": {
        "prefix": "tx.gasprice",
        "description": "tx.gasprice (uint256): gas price of the transaction",
        "security":""
    },
    "origin": {
        "prefix": "tx.origin",
        "description": "tx.origin (address payable): sender of the transaction (full call chain)",
        "security":"Do not use for authentication"
    },
    "abi_decode": {
        "prefix": "abi_decode",
        "description": "abi.decode(encoded_data: Bytes[N]) -> (...): ABI-decodes the given data, while the types are given in parentheses as second argument.",
        "security":""
    },
    "abi_encode": {
        "prefix": "abi_encode",
        "description": "abi.encode(...) -> (Bytes[N]): ABI-encodes the given arguments",
        "security":""
    },
    "assert": {
        "prefix": "assert",
        "description": ["assert test, [msg]: abort execution and revert state changes if the condition is not met","assert test, UNREACHABLE: abort execution with an invalid opcode if the condition is met, all gas is consumed"],
        "security":""
    },
    "raise": {
        "prefix": "raise",
        "description": ["raise: abort execution and revert state changes","raise msg: abort execution and revert state changes, providing an explanatory string","raise UNREACHABLE: abort execution with an invalid opcode, all gas is consumed"],
        "security":""
    },
    "addmod": {
        "prefix": "addmod",
        "description": "addmod(x: uint256, y: uint256, k: uint256) -> uint256:\n\tcompute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256.",
        "security":""
    },
    "mulmod": {
        "prefix": "mulmod",
        "description": "mulmod(x: uint256, y: uint256, k: uint256) -> uint256:\n\tcompute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256.",
        "security":""
    },
    "keccak256": {
        "prefix": "keccak256",
        "description": "keccak256(Bytes[N]) -> bytes32:\n\tcompute the Keccak-256 hash of the input",
        "security":""
    },
    "sha256": {
        "prefix": "sha256",
        "description": "sha256(Bytes[N]) -> bytes32:\n\tcompute the SHA-256 hash of the input",
    },
    "ecrecover": {
        "prefix": "ecrecover",
        "description": "ecrecover(hash, v, r, s) -> address:\n\trecover the address associated with the public key from elliptic curve signature or return empty(address) on error",
        "security":"Prior to Vyper 0.3.10, the ecrecover function could return an undefined (possibly nonzero) value for invalid inputs to ecrecover. For more information, please see Vyper GHSA-f5x6-7qgp-jhf3."
    },
    "_balance": {
        "prefix": ".balance",
        "description": "<address>.balance (uint256):\n\tbalance of the Address in Wei",
    },
    "send": {
        "prefix": "send",
        "description": "send(recipient: address, amount: uint256) -> bool:\n\tsend given amount of Wei to Address, reverts on failure, by default forwards 2300 gas stipend only if the value is non-zero",
        "security":"Always try using a pattern where the recipient withdraws the money"
    },
    "raw_call": {
        "prefix": "raw_call",
        "description": "raw_call(target, data, max_outsize=N) -> (bool, Bytes[N]):\n\tissue low-level CALL with the given payload, returns success condition and return data, forwards all available gas, adjustable",
    },
    "selfdestruct": {
        "prefix": "selfdestruct",
        "description": "selfdestruct(recipient: address):\n\tdestroy the current contract, sending its funds to the given Address"
    },
    "self": {
        "prefix": "self",
        "description": "self (current contract's type):\n\tthe current contract, implicitly convertible to Address",
        "security":""
    },
    "for": {
        "prefix": "for",
        "description": "",
        "security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"
    },
    "pragma": {
        "prefix": "pragma",
        "description": "",
        "security":"avoid using experimental features! avoid specifying version ^"
    },
    ">>": {
        "prefix": ">>",
        "description": "",
        "security":"Shifting is only available for 256-bit wide types. That is, x must be int256 or uint256, and y can be any unsigned integer. The right shift for int256 compiles to a signed right shift (EVM SAR instruction)."
    },
    "external":{
        "prefix":"external",
        "description":"External functions are part of the contract interface, which means they can be called from other contracts and via transactions. An external function f cannot be called internally.",
        "security": "make sure to authenticate calls to this method as anyone can access it"
    },
    "internal":{
        "prefix":"internal",
        "description":"Those functions and state variables can only be accessed internally (i.e. from within the current contract or contracts initializing/using it)."
    },
    "pure":{
        "prefix":"pure",
        "description":"Functions can be declared pure in which case they promise not to read from or modify the state.",
        "security": ["It is not possible to prevent functions from reading the state at the level of the EVM, it is only possible to prevent them from writing to the state (i.e. only view can be enforced at the EVM level, pure can not)."]
    },
    "view":{
        "prefix":"view",
        "description":"function call cannot write state. It is however allowed to read state.",
    },
    "codehash": {
        "prefix": "codehash",
        "description": "",
        "security":"Note that the result of address.codehash will be zero during constructor calls. Therefore it is not fit to use it to check if an address is a contract or not as this can be subverted by calling your contract in a constructor."
    }
}

module.exports = {
    BUILTINS
}