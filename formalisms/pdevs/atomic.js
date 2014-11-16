var Parser = require('jison').Parser;

exports.grammar = {
    "lex": {
        "macros": {
            "id": "[a-zA-Z][_a-zA-Z0-9]*",
            "int": "-?(?:[0-9]|[1-9][0-9]+)",
            "exp": "(?:[eE][-+]?[0-9]+)",
            "frac": "(?:\\.[0-9]+)"
        },
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["\\/\\/.*", "/* ignore comment */"],
            ["name\\b", "return 'SECTION_NAME';"],
            ["in_ports\\b", "return 'SECTION_IN_PORTS';"],
            ["out_ports\\b", "return 'SECTION_OUT_PORTS';"],
            ["parameters\\b", "return 'SECTION_PARAMETERS';"],
            ["state\\b", "return 'SECTION_STATE';"],
            ["delta_int\\b", "return 'SECTION_DELTA_INT';"],
            ["delta_ext\\b", "return 'SECTION_DELTA_EXT';"],
            ["delta_conf\\b", "return 'SECTION_DELTA_CONF';"],
            ["ta\\b", "return 'SECTION_TA';"],
            ["output\\b", "return 'SECTION_OUTPUT';"],
            ["init\\b", "return 'SECTION_INIT';"],
            ["default\\b", "return 'DEFAULT';"],
            ["sin\\b", "return 'SIN';"],
            ["cos\\b", "return 'COS';"],
            ["tan\\b", "return 'TAN';"],
            ["cotan\\b", "return 'COTAN';"],
            ["asin\\b", "return 'ASIN';"],
            ["acos\\b", "return 'ACOS';"],
            ["atan\\b", "return 'ATAN';"],
            ["sh\\b", "return 'SINH';"],
            ["ch\\b", "return 'COSH';"],
            ["th\\b", "return 'TANH';"],
            ["coth\\b", "return 'COTANH';"],
            ["asinh\\b", "return 'ASINH';"],
            ["acosh\\b", "return 'ACOSH';"],
            ["atanh\\b", "return 'ATANH';"],
            ["exp\\b", "return 'EXP';"],
            ["log\\b", "return 'LOG';"],
            ["ln\\b", "return 'LN';"],
            ["sqrt\\b", "return 'SQRT';"],
            ["max\\b", "return 'MAX';"],
            ["min\\b", "return 'MIN';"],
            ["or\\b", "return 'OR';"],
            ["and\\b", "return 'AND';"],
            ["not\\b", "return 'NOT';"],
            ["\\|", "return 'BAR';"],
            [":", "return ':';"],
            [";", "return ';';"],
            ["\\{", "return '{';"],
            ["\\}", "return '}';"],
            ["\\[", "return '[';"],
            ["\\]", "return ']';"],
            ["\\+inf", "return 'INFINITY';"],
            ["\\+", "return '+';"],
            ["\\->", "return '->';"],
            ["\\-", "return '-';"],
            ["\\*", "return '*';"],
            ["\\^", "return 'POW';"],
            ["\\/", "return '/';"],
            ["<>", "return '<>';"],
            ["\\(", "return '(';"],
            ["\\)", "return ')';"],
            [",", "return ',';"],
            ["<=", "return '<=';"],
            [">=", "return '>=';"],
            ["<", "return '<';"],
            [">", "return '>';"],
            ["=", "return '=';"],
            ["_\\b", "return '_';"],
            ["R\\b", "return 'R';"],
            ["N\\b", "return 'N';"],
            ["Z\\b", "return 'Z';"],
            ["{id}", "return 'ID';"],
            ["{int}{frac}?{exp}?\\b", "return 'REAL';"],
            ["{int}\\b", "return 'INTEGER';"],
            [".", "/* ignore bad characters */"]
        ]
    },
    "tokens": "SECTION_NAME SECTION_IN_PORTS SECTION_OUT_PORTS SECTION_PARAMETERS SECTION_STATE SECTION_INIT SECTION_DELTA_INT SECTION_DELTA_EXT SECTION_DELTA_CONF SECTION_TA SECTION_OUTPUT " +
    "; : { } [ ] -> ( ) + - * / , = _ ID INTEGER REAL INFINITY DEFAULT " +
    "SIN COS TAN COTAN ASIN ACOS ATAN SINH COSH TANH COTANH ASINH ACOSH ATANH " +
    "EXP LN LOG POW, SQRT ABS BAR MAX MIN " +
    "OR AND NOT <> < > <= >=",
    "start": "model",
    "bnf": {
        "model": [["section_name section_parameters section_in_ports section_out_ports section_state section_init section_delta_int section_delta_ext section_delta_conf section_ta section_output", "return yy.model"]],
        "section_name": [["SECTION_NAME : ID ;", "yy.model = new yy.Model.AtomicModel($3);"]],
        "section_parameters": ["SECTION_PARAMETERS : { parameter_assignments }"],
        "parameter_assignments": ["parameter_assignments , parameter_assignment", "parameter_assignment", ""],
        "parameter_assignment": [["variable_name : variable_def = value", "yy.model.add_parameter($1, $3, $5);"]],
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
        "section_state": ["SECTION_STATE : { variables }"],
        "variables": ["variables , variable", "variable"],
        "variable": [["variable_name = variable_def", "yy.model.add_state_variable($1, $3);"]],
        "variable_defs": [
            ["variable_defs , variable_def", "$$ = $1; $1.push($3);"],
            ["variable_def", "$$ = [$1];"]
        ],
        "variable_def": [
            ["{ symbols }", "$$=new yy.SuperModel.ConstantType($2);"],
            ["< R >", "$$=new yy.SuperModel.RealType('R');"],
            ["< R + >", "$$=new yy.SuperModel.RealType('R+');"],
            ["< R - >", "$$=new yy.SuperModel.RealType('R-');"],
            ["< R * >", "$$=new yy.SuperModel.RealType('R*');"],
            ["< R + * >", "$$=new yy.SuperModel.RealType('R+*');"],
            ["< R - * >", "$$=new yy.SuperModel.RealType('R-*');"],
            ["< N >", "$$=new yy.SuperModel.IntegerType('N');"],
            ["< Z >", "$$=new yy.SuperModel.IntegerType('Z');"],
            ["( attribute_defs )", "$$=new yy.SuperModel.StructType($2);"],
            ["[ variable_def ]", "$$=new yy.SuperModel.SetType($2);"],
        ],
        "attribute_defs": [
            ["attribute_defs , attribute_def", "$$ = $1; $1.push($3);"],
            ["attribute_def", "$$ = [$1];"]
        ],
        "attribute_def": [
            ["ID = variable_def", "$$=[$1, $3];"]
        ],
        "variable_name": [["ID", "$$=yytext;"]],
        "symbols": [
            ["symbols , symbol", "$$ = $1; $1.push($3);"],
            ["symbol", "$$ = [$1];"]
        ],
        "symbol": ["ID"],
        "section_init": ["SECTION_INIT : { initial_assignments }"],
        "initial_assignments": ["initial_assignments , initial_assignment", "initial_assignment", ""],
        "initial_assignment": [["variable_name = value", "yy.model.init_state_variable($1, $3);"]],
        "value": [
            ["INTEGER", "$$=new yy.Expression.Integer(Number(yytext));"],
            ["REAL", "$$=new yy.Expression.Real(Number(yytext));"],
            ["INFINITY", "$$=new yy.Expression.Infinity();"],
            ["ID", "$$=new yy.Expression.Constant(yytext);"]
        ],
        "section_delta_int": ["SECTION_DELTA_INT : { delta_int_functions }"],
        "delta_int_functions": ["delta_int_functions , delta_int_function", "delta_int_function", ""],
        "delta_int_function": [
            ["( state_variables ) -> ( arithmetic_expressions ) condition", "yy.model.add_delta_int_function($2, $6, $8);"],
            ["( state_variables ) -> ( arithmetic_expressions )", "yy.model.add_delta_int_function($2, $6, null);"]
        ],
        "section_delta_ext": ["SECTION_DELTA_EXT : { delta_ext_functions }"],
        "delta_ext_functions": ["delta_ext_functions , delta_ext_function", "delta_ext_function", ""],
        "delta_ext_function": [
            ["( ( ( state_variables ) , e_variable ) , bag ) -> ( arithmetic_expressions ) condition", "yy.model.add_delta_ext_function($4, $7, $10, $14, $16);"],
            ["( ( ( state_variables ) , e_variable ) , bag ) -> ( arithmetic_expressions )", "yy.model.add_delta_ext_function($4, $7, $10, $14, null);"]
        ],
        "e_variable": ["ID"],
        "bag": [
            ["{ inputs }", "$$=$2;"]
        ],
        "inputs": [
            ["inputs , input", "$$=$1; $1.push($3);"],
            ["input", "$$=[$1];"]
        ],
        "input": [
            ["ID", "$$=$1;"],
            ["( ID , { attributes } )", "$$=[$2,$5];"]
        ],
        "attributes": [
            ["attributes , attribute", "$$=$1; $1.push($3);"],
            ["attribute", "$$=[$1];"]
        ],
        "attribute": ["ID"],
        "section_delta_conf": ["SECTION_DELTA_CONF : { delta_conf_functions }"],
        "delta_conf_functions": ["delta_conf_functions , delta_conf_function", "delta_conf_function", ""],
        "delta_conf_function": [
            ["( ( state_variables ) , bag ) -> ( arithmetic_expressions ) condition", "yy.model.add_delta_conf_function($3, $6, $10, $12);"],
            ["( ( state_variables ) , bag ) -> ( arithmetic_expressions )", "yy.model.add_delta_conf_function($3, $6, $10, null);"]
        ],
        "section_ta": ["SECTION_TA : { ta_list }"],
        "ta_list": ["ta_list , ta", "ta"],
        "ta": [
            ["( state_variables ) -> arithmetic_expression condition", "yy.model.add_ta_function($2, $5, $6);"],
            ["( state_variables ) -> arithmetic_expression", "yy.model.add_ta_function($2, $5, null);"]
        ],
        "state_variables": [
            ["state_variables , state_variable", "$$=$1; $1.push($3);"],
            ["state_variable", "$$=[$1];"],
            ["", "$$=[];"]
        ],
        "state_variable": [
            ["INTEGER", "$$=new yy.Expression.Integer(Number(yytext));"],
            ["REAL", "$$=new yy.Expression.Real(Number(yytext));"],
            ["INFINITY", "$$=new yy.Expression.Infinity();"],
            ["ID", "$$=yy.model.is_state_variable(yytext) ? new yy.Expression.Variable(yytext) : new yy.Expression.Constant(yytext);"]
        ],
        "arithmetic_expressions": [
            ["arithmetic_expressions , arithmetic_expression", "$$=$1; $1.push($3);"],
            ["arithmetic_expression", "$$=[$1];"]
        ],
        "arithmetic_expression": [
            ["additive_expression", "$$=new yy.Expression.ArithmeticExpression($1)"]
        ],
        "additive_expression": [
            ["multiplicative_expression", "$$=$1;"],
            ["additive_expression + multiplicative_expression", "$$=new yy.Expression.Add($1, $3);"],
            ["additive_expression - multiplicative_expression", "$$=new yy.Expression.Sub($1, $3);"]
        ],
        "multiplicative_expression": [
            ["unary_expression", "$$=$1;"],
            ["multiplicative_expression * unary_expression", "$$=new yy.Expression.Mult($1, $3);"],
            ["multiplicative_expression / unary_expression", "$$=new yy.Expression.Div($1, $3);"],
            ["multiplicative_expression POW unary_expression", "$$=new yy.Expression.Function2('POW', $1, $3);"],
        ],
        "unary_expression": [
            ["function_expression", "$$=$1;"],
            ["litteral", "$$=$1;"],
            ["( additive_expression )", "$$=new yy.Expression.Bracket($2);"]
        ],
        "function_expression": [
            ["BAR additive_expression BAR", "$$=new yy.Expression.Function('BAR', $2);"],
            ["unary_function ( additive_expression )", "$$=new yy.Expression.Function($1, $3);"],
            ["binary_function ( additive_expression , additive_expression )", "$$=new yy.Expression.Function2($1, $3, $5);"]
        ],
        "unary_function": [
            "SIN", "COS", "TAN", "COTAN",
            "ASIN", "ACOS", "ATAN",
            "SINH", "COSH", "TANH", "COTANH",
            "ASINH", "ACOSH", "ATANH",
            "EXP", "LN",
            "SQRT"
        ],
        "binary_function": [
            "LOG", "POW", "MAX", "MIN"
        ],
        "litteral": [
            ["INTEGER", "$$=new yy.Expression.Integer(Number(yytext));"],
            ["REAL", "$$=new yy.Expression.Real(Number(yytext));"],
            ["INFINITY", "$$=new yy.Expression.Infinity();"],
            ["ID", "$$=new yy.Expression.Variable(yytext);"]
        ],
        "condition": [["[ conditional_expression ]", "$$=$2"]],
        "conditional_expression": [
            ["DEFAULT", "$$=new yy.Expression.ConditionalExpression(new yy.Expression.Default());"],
            ["disjunction_expression", "$$=new yy.Expression.ConditionalExpression($1);"]
        ],
        "disjunction_expression": [
            ["conjunction_expression", "$$=$1;"],
            ["disjunction_expression OR conjunction_expression", "$$=new yy.Expression.Or($1, $3);"]
        ],
        "conjunction_expression": [
            ["relational_expression", "$$=$1;"],
            ["conjunction_expression AND relational_expression", "$$=new yy.Expression.And($1, $3);"]
        ],
        "relational_expression": [
            ["arithmetic_expression < arithmetic_expression", "$$=new yy.Expression.LowerThan($1, $3);"],
            ["arithmetic_expression > arithmetic_expression", "$$=new yy.Expression.GreaterThan($1, $3);"],
            ["arithmetic_expression <= arithmetic_expression", "$$=new yy.Expression.LowerThanOrEqual($1, $3);"],
            ["arithmetic_expression >= arithmetic_expression", "$$=new yy.Expression.GreaterThanOrEqual($1, $3);"],
            ["arithmetic_expression = arithmetic_expression", "$$=new yy.Expression.Equal($1, $3);"],
            ["arithmetic_expression <> arithmetic_expression", "$$=new yy.Expression.NotEqual($1, $3);"],
            ["( disjunction_expression )", "$$=new yy.Expression.Bracket($2);"],
            ["NOT ( disjunction_expression )", "$$=new yy.Expression.Not($3);"]
        ],
        "section_output": ["SECTION_OUTPUT : { output_functions }"],
        "output_functions": ["output_functions , output_function", "output_function", ""],
        "output_function": [
            ["( state_variables ) -> bag2 condition", "yy.model.add_output_function($2, $5, $6);"],
            ["( state_variables ) -> bag2", "yy.model.add_output_function($2, $5, null);"]
        ],
        "bag2": [
            ["{ outputs }", "$$=$2;"]
        ],
        "outputs": [
            ["outputs , output", "$$=$1; $1.push($3);"],
            ["output", "$$=[$1];"]
        ],
        "output": [
            ["ID", "$$=$1;"],
            ["( ID , { attributes2 } )", "$$=[$2,$5];"]
        ],
        "attributes2": [
            ["attributes2 , attribute2", "$$=$1; $1.push($3);"],
            ["attribute2", "$$=[$1];"]
        ],
        "attribute2": [
            ["( ID , arithmetic_expression )", "$$=[$2,$4];"]
        ]
    }
};

var options = {type: "lalr", moduleType: "commonjs", moduleName: "pdevs"};

exports.generate = function generate() {
    return parser = new Parser(exports.grammar, options);
};