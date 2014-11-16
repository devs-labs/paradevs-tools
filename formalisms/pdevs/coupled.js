var Parser = require('jison').Parser;

exports.grammar = {
    "lex": {
        "macros": {
            "id": "[a-zA-Z][_a-zA-Z0-9]*"
        },
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["\\/\\/.*", "/* ignore comment */"],
            ["name\\b", "return 'SECTION_NAME';"],
            ["in_ports\\b", "return 'SECTION_IN_PORTS';"],
            ["out_ports\\b", "return 'SECTION_OUT_PORTS';"],
            ["sub_models\\b", "return 'SECTION_SUB_MODELS';"],
            ["input_connections\\b", "return 'SECTION_INPUT_CONNECTIONS';"],
            ["output_connections\\b", "return 'SECTION_OUTPUT_CONNECTIONS';"],
            ["internal_connections\\b", "return 'SECTION_INTERNAL_CONNECTIONS';"],
            ["\\{", "return '{';"],
            ["\\}", "return '}';"],
            ["\\(", "return '(';"],
            ["\\)", "return ')';"],
            [",", "return ',';"],
            [":", "return ':';"],
            [";", "return ';';"],
            ["=", "return '=';"],
            ["<", "return '<';"],
            [">", "return '>';"],
            ["\\+", "return '+';"],
            ["\\->", "return '->';"],
            ["\\-", "return '-';"],
            ["\\*", "return '*';"],
            ["R\\b", "return 'R';"],
            ["N\\b", "return 'N';"],
            ["Z\\b", "return 'Z';"],
            ["atomic", "return 'ATOMIC';"],
            ["coupled", "return 'COUPLED';"],
            ["{id}", "return 'ID';"],
            [".", "/* ignore bad characters */"]
        ]
    },
    "tokens": "SECTION_NAME SECTION_IN_PORTS SECTION_OUT_PORTS SECTION_SUB_MODELS SECTION_INPUT_CONNECTIONS SECTION_OUTPUT_CONNECTIONS SECTION_INTERNAL_CONNECTIONS " +
    "ID { } ( ) , : ; = < > + -> - * ATOMIC COUPLED R N Z",
    "start": "model",
    "bnf": {
        "model": [["section_name section_in_ports section_out_ports section_sub_models section_input_connections section_output_connections section_internal_connections", "return yy.model"]],
        "section_name": [["SECTION_NAME : ID ;", "yy.model = new yy.Model.CoupledModel($3);"]],
        "section_in_ports": ["SECTION_IN_PORTS : { in_ports }"],
        "in_ports": ["in_ports , in_port", "in_port", ""],
        "in_port": [
            ["ID = { variable_defs }", "yy.model.add_in_port($1, $4);"],
            ["ID = { }", "yy.model.add_in_port($1, []);"]
        ],
        "section_out_ports": ["SECTION_OUT_PORTS : { out_ports }"],
        "out_ports": ["out_ports , out_port", "out_port", ""],
        "out_port": [
            ["ID = { variable_defs }", "yy.model.add_out_port($1, $4);"],
            ["ID = { }", "yy.model.add_out_port($1, []);"]
        ],
        "variable_defs": [
            ["variable_defs , variable_def", "$$ = $1; $1.push($3);"],
            ["variable_def", "$$ = [$1];"]
        ],
        "variable_def": [
            ["{ symbols }", "$$=$2"],
            ["< R >", "$$='R';"],
            ["< R + >", "$$='R+';"],
            ["< R - >", "$$='R-';"],
            ["< R * >", "$$='R*';"],
            ["< R + * >", "$$='R+*';"],
            ["< R - * >", "$$='R-*';"],
            ["< N >", "$$='N';"],
            ["< Z >", "$$='Z';"]
        ],
        "section_sub_models": ["SECTION_SUB_MODELS : { sub_models }"],
        "sub_models": ["sub_models , sub_model", "sub_model"],
        "sub_model": [
            ["ID = ID < ATOMIC >", "yy.model.add_sub_model($1, $3, true);"],
            ["ID = ID < COUPLED >", "yy.model.add_sub_model($1, $3, false);"]
        ],
        "section_input_connections": ["SECTION_INPUT_CONNECTIONS : { input_connections }"],
        "input_connections": [
            "input_connections , input_connection",
            "input_connection",
            ""],
        "input_connection": [
            ["( N , ID ) -> ( ID , ID )", "yy.model.add_input_connection($4, $8, $10);"]
        ],
        "section_output_connections": ["SECTION_OUTPUT_CONNECTIONS : { output_connections }"],
        "output_connections": [
            "output_connections , output_connection",
            "output_connection",
            ""],
        "output_connection": [
            ["( ID , ID ) -> ( N , ID )", "yy.model.add_output_connection($2, $4, $10);"]
        ],
        "section_internal_connections": ["SECTION_INTERNAL_CONNECTIONS : { internal_connections }"],
        "internal_connections": [
            "internal_connections , internal_connection",
            "internal_connection",
            ""],
        "internal_connection": [
            ["( ID , ID ) -> ( ID , ID )", "yy.model.add_internal_connection($2, $4, $8, $10);"]
        ]
    }
};

var options = {type: "lalr", moduleType: "commonjs", moduleName: "pdevs"};

exports.generate = function generate() {
    return parser = new Parser(exports.grammar, options);
};