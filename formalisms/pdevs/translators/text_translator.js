var Expression = require('./../lib/expression');

var Translator = function (model) {
// public methods
    this.translate = function () {
        var i;
        var n;

        _code += 'parameters = { ';
        for (i = 0; i < _model.parameters().length; ++i) {
            translate_parameters(_model.parameters()[i]);
            if (i !== _model.parameters().length - 1) {
                _code += ', ';
            }
        }
        _code += ' }\n';
        _code += 'X = { ';
        for (i = 0; i < _model.in_ports().length; ++i) {
            _code += _model.in_ports()[i] + ' ';
        }
        _code += '}\n';
        _code += 'Y = { ';
        for (i = 0; i < _model.out_ports().length; ++i) {
            _code += _model.out_ports()[i] + ' ';
        }
        _code += '}\n';
        translate_state(_model.state());
        for (i = 0; i < _model.ta_functions().length; ++i) {
            translate_ta(_model.ta_functions()[i]);
            _code += '\n';
        }
        for (i = 0; i < _model.delta_ext_functions().length; ++i) {
            translate_delta_ext(_model.delta_ext_functions()[i]);
            _code += '\n';
        }
        for (i = 0; i < _model.delta_int_functions().length; ++i) {
            translate_delta_int(_model.delta_int_functions()[i]);
            _code += '\n';
        }
        for (i = 0; i < _model.delta_conf_functions().length; ++i) {
            translate_delta_conf(_model.delta_conf_functions()[i]);
            _code += '\n';
        }
        for (i = 0; i < _model.output_functions().length; ++i) {
            translate_output(_model.output_functions()[i]);
            _code += '\n';
        }
        return _code;
    };

    this.code = function () {
        return _code;
    };

// private methods
    var translate_arithmetic_expression = function (expression) {
        if (expression.arity() === 0) {
            _code += expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'BAR') {
                _code += '|';
                translate_arithmetic_expression(expression.get(1));
                _code += '|';
            } else if (expression.name() === 'ArithmeticExpression') {
                translate_arithmetic_expression(expression.get(1));
            } else {
                _code += expression.name() + '(';
                translate_arithmetic_expression(expression.get(1));
                _code += ')';
            }
        } else if (expression.arity() === 2) {
            if (expression.name() === "log" || expression.name() === "max" || expression.name() === "min") {
                _code += expression.name() + '(';
                translate_arithmetic_expression(expression.get(1));
                _code += ', ';
                translate_arithmetic_expression(expression.get(2));
                _code += ')';
            } else if (expression.name() === "POW") {
                translate_arithmetic_expression(expression.get(1));
                _code += ' ^ ';
                translate_arithmetic_expression(expression.get(2));
            } else {
                translate_arithmetic_expression(expression.get(1));
                _code += ' ' + expression.name() + ' ';
                translate_arithmetic_expression(expression.get(2));
            }
        }
    };

    var translate_delta_conf = function (delta_conf_function) {
        var i;

        _code += String.fromCharCode(0x03b4) + 'conf( ';
        translate_state_vector(delta_conf_function.state());
        _code += ', ';
        translate_input_bag(delta_conf_function.bag());
        _code += ' ) = ( ';
        for (i = 0; i < delta_conf_function.expressions().length; ++i) {
            translate_arithmetic_expression(delta_conf_function.expressions()[i])
            if (i !== delta_conf_function.expressions().length - 1) {
                _code += ', ';
            }
        }
        _code += ' )';
        if (delta_conf_function.condition()) {
            _code += ' if ';
            translate_logical_expression(delta_conf_function.condition());
        }
    };

    var translate_delta_ext = function (delta_ext_function) {
        var i;

        _code += String.fromCharCode(0x03b4) + 'ext( ( ';
        translate_state_vector(delta_ext_function.state());
        _code += ', ' + delta_ext_function.e();
        _code += ' ), ';
        translate_input_bag(delta_ext_function.bag());
        _code += ' ) = ( ';
        for (i = 0; i < delta_ext_function.expressions().length; ++i) {
            translate_arithmetic_expression(delta_ext_function.expressions()[i])
            if (i !== delta_ext_function.expressions().length - 1) {
                _code += ', ';
            }
        }
        _code += ' )';
        if (delta_ext_function.condition()) {
            _code += ' if ';
            translate_logical_expression(delta_ext_function.condition());
        }
    };

    var translate_delta_int = function (delta_int_function) {
        var i;

        _code += String.fromCharCode(0x03b4) + 'int( ';
        translate_state_vector(delta_int_function.state());
        _code += ' ) = ( ';
        for (i = 0; i < delta_int_function.expressions().length; ++i) {
            translate_arithmetic_expression(delta_int_function.expressions()[i]);
            if (i !== delta_int_function.expressions().length - 1) {
                _code += ', ';
            }
        }
        _code += ' )';
        if (delta_int_function.condition()) {
            _code += ' if ';
            translate_logical_expression(delta_int_function.condition());
        }
        return _code;
    };

    var translate_input_bag = function (input_bag) {
        _code += '{ ';
        for (var i = 0; i < input_bag.inputs().length; ++i) {
            var input = input_bag.inputs()[i];

            if (typeof input === 'string') {
                _code += input;
            } else {
                var port = input[0];
                var attributes = input[1];

                _code += '( ' + port + ', { ';
                for (var j = 0; j < attributes.length; ++j) {
                    _code += attributes[j];
                    if (j !== attributes.length - 1) {
                        _code += ', ';
                    }
                }
                _code += ' } )';
            }
            if (i !== input_bag.inputs().length - 1) {
                _code += ', ';
            }
        }
        _code += ' }';
    };

    var translate_logical_expression = function (expression) {
        if (expression.arity() === 0) {
            _code += expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'not') {
                _code += String.fromCharCode(0x00ac) + '(';
                translate_logical_expression(expression.get(1));
                _code += ')';
            } else if (expression.name() === 'ConditionalExpression') {
                translate_logical_expression(expression.get(1));
            } else if (expression.name() === 'ArithmeticExpression') {
                translate_arithmetic_expression(expression.get(1));
            } else { // bracket
                _code += '(';
                translate_logical_expression(expression.get(1));
                _code += ')';
            }
        } else if (expression.arity() === 2) {
            translate_logical_expression(expression.get(1));
            _code += ' ';
            if (expression.name() === 'or') {
                _code += String.fromCharCode(0x22c1);
            } else if (expression.name() === 'and') {
                _code += String.fromCharCode(0x22c0);
            } else if (expression.name() === '<>') {
                _code += String.fromCharCode(0x2260);
            } else {
                _code += expression.name();
            }
            _code += ' ';
            translate_logical_expression(expression.get(2));
        }
    };

    var translate_output = function (output_function) {
        _code += String.fromCharCode(0x03bb) + '( ';
        translate_state_vector(output_function.state());
        _code += ' ) = { ';
        translate_output_bag(output_function.bag());
        _code += ' }';
        if (output_function.condition()) {
            _code += ' if ';
            translate_logical_expression(output_function.condition());
        }
    };

    var translate_output_bag = function (output_bag) {
        _code += '{ ';
        for (var i = 0; i < output_bag.outputs().length; ++i) {
            var output = output_bag.outputs()[i];

            if (typeof output === 'string') {
                _code += output;
            } else {
                var port = output[0];
                var attributes = output[1];

                _code += '( ' + port + ', { ';
                for (var j = 0; j < attributes.length; ++j) {
                    _code += '( ' + attributes[j][0] + ', ' + attributes[j][1] + ' )';
                    if (j !== attributes.length - 1) {
                        _code += ', ';
                    }
                }
                _code += ' } )';
            }
            if (i !== output_bag.outputs().length - 1) {
                _code += ', ';
            }
        }
        _code += ' }';
    };

    var translate_parameters = function (parameter) {
        _code += parameter.name() + '(';
        translate_type(parameter.type().type());
        _code += ')=' + parameter.value();
    };

    var translate_state = function (state) {
        var i;
        var variable;
        var n = state.state_variables().length;

        _code += 'S = { ( ';
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _code += variable.name();
            if (i !== n - 1) {
                _code += ', ';
            }
        }
        _code += ' ) / ';
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _code += variable.name() + ' ' + String.fromCharCode(0x2208) + ' ';
            translate_type(variable.type().type());
            if (i !== n - 1) {
                _code += ', ';
            }
        }
        _code += ' }\n';
        _code += 'S0 = ( ';
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _code += variable.init();
            if (i !== n - 1) {
                _code += ', ';
            }
        }
        _code += ' )\n';
        return _code;
    };

    var translate_state_vector = function (state) {
        _code += '( ';
        for (var i = 0; i < state.state_variables().length; ++i) {
            _code += state.state_variables()[i];
            if (i !== state.state_variables().length - 1) {
                _code += ', ';
            }
        }
        _code += ' )';
    };

    var translate_ta = function (ta_function) {
        _code += 'ta( ';
        translate_state_vector(ta_function.state());
        _code += ' ) = ';
        translate_arithmetic_expression(ta_function.expression());
        if (ta_function.condition()) {
            _code += ' if ';
            translate_logical_expression(ta_function.condition());
        }
    };

    var translate_type = function (type) {
        if (typeof type === 'string') {
            if (type.charAt(0) === 'R') {
                _code += String.fromCharCode(0x211d);
                if (type.length === 2) {
                    if (type.charAt(1) === '+') {
                        _code += String.fromCharCode(0x207a);
                    } else if (type.charAt(1) === '-') {
                        _code += String.fromCharCode(0x207b);
                    } else if (type.charAt(1) === '*') {
                        _code += String.fromCharCode(0x22c6);
                    }
                } else {
                    if (type.charAt(1) === '+') {
                        _code += String.fromCharCode(0x208a) + String.fromCharCode(0x22c6);
                    } else if (_type.charAt(1) === '-') {
                        _code += String.fromCharCode(0x208b) + String.fromCharCode(0x22c6);
                    }
                }
                return _code;
            } else if (type.charAt(0) === 'N') {
                _code += String.fromCharCode(0x2115);
            } else if (type.charAt(0) === 'Z') {
                _code += String.fromCharCode(0x2124);
            }
        } else {
            _code += '{ ';
            for (var i = 0; i < type.length; ++i) {
                _code += type[i];
                if (i !== type.length - 1) {
                    _code += ', ';
                }
            }
            _code += ' }';
        }
    };

    var init = function (model) {
        _code = '';
        _model = model;
    };

// private attributes
    var _model;
    var _code;

    init(model);
};

module.exports = Translator;