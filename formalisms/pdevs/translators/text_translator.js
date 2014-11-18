var Expression = require('./../../../lib/expression');
var Model = require('./../../../lib/model');
var PDevsModel = require('./../model');
var TextTranslator = require('./../../../lib/translator/text_translator');

var Translator = function (model) {
// private attributes
    var _super = new TextTranslator(model);

// public methods
    this.code = _super.code;

    this.translate = function () {
        var i;
        var n;

        _super.push('parameters = { ');
        for (i = 0; i < _super.model().parameters().length; ++i) {
            translate_parameters(_super.model().parameters()[i]);
            if (i !== _super.model().parameters().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
        translate_ports('X', _super.model().in_ports());
        translate_ports('Y', _super.model().out_ports());
        translate_state(_super.model().state());
        for (i = 0; i < _super.model().ta_functions().length; ++i) {
            translate_ta(_super.model().ta_functions()[i]);
            _super.push('\n');
        }
        for (i = 0; i < _super.model().delta_ext_functions().length; ++i) {
            translate_delta_ext(_super.model().delta_ext_functions()[i]);
            _super.push('\n');
        }
        for (i = 0; i < _super.model().delta_int_functions().length; ++i) {
            translate_delta_int(_super.model().delta_int_functions()[i]);
            _super.push('\n');
        }
        for (i = 0; i < _super.model().delta_conf_functions().length; ++i) {
            translate_delta_conf(_super.model().delta_conf_functions()[i]);
            _super.push('\n');
        }
        for (i = 0; i < _super.model().output_functions().length; ++i) {
            translate_output(_super.model().output_functions()[i]);
            _super.push('\n');
        }
    };

// private methods
    var translate_delta_conf = function (delta_conf_function) {
        var i;

        _super.push(String.fromCharCode(0x03b4) + 'conf( ');
        translate_state_vector(delta_conf_function.state());
        _super.push(', ');
        translate_input_bag(delta_conf_function.bag());
        _super.push(' ) = ');
        if (delta_conf_function instanceof PDevsModel.DeltaConfFunction) {
            _super.push(')');
            for (i = 0; i < delta_conf_function.expressions().length; ++i) {
                _super.translate_arithmetic_expression(delta_conf_function.expressions()[i]);
                if (i !== delta_conf_function.expressions().length - 1) {
                    _super.push(', ');
                }
            }
            _super.push(' )');
            if (delta_conf_function.condition()) {
                _super.push(' if ');
                _super.translate_logical_expression(delta_conf_function.condition());
            }
        } else {
            if (delta_conf_function.internal()) {
                _super.push('delta_ext ( delta_int ( ');
                translate_state_vector(delta_conf_function.state());
                _super.push(' ), 0, ');
                translate_input_bag(delta_conf_function.bag());
                _super.push(' ) )');
            } else {
                _super.push('delta_int ( delta_ext ( ');
                translate_state_vector(delta_conf_function.state());
                _super.push(', 0, ');
                translate_input_bag(delta_conf_function.bag());
                _super.push(' ) )');
            }
        }
    };

    var translate_delta_ext = function (delta_ext_function) {
        var i;

        _super.push(String.fromCharCode(0x03b4) + 'ext( ( ');
        translate_state_vector(delta_ext_function.state());
        _super.push(', ' + delta_ext_function.e());
        _super.push(' ), ');
        translate_input_bag(delta_ext_function.bag());
        _super.push(' ) = ( ');
        for (i = 0; i < delta_ext_function.expressions().length; ++i) {
            _super.translate_arithmetic_expression(delta_ext_function.expressions()[i]);
            if (i !== delta_ext_function.expressions().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' )');
        if (delta_ext_function.condition()) {
            _super.push(' if ');
            _super.translate_logical_expression(delta_ext_function.condition());
        }
    };

    var translate_delta_int = function (delta_int_function) {
        var i;

        _super.push(String.fromCharCode(0x03b4) + 'int( ');
        translate_state_vector(delta_int_function.state());
        _super.push(' ) = ( ');
        for (i = 0; i < delta_int_function.expressions().length; ++i) {
            _super.translate_arithmetic_expression(delta_int_function.expressions()[i]);
            if (i !== delta_int_function.expressions().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' )');
        if (delta_int_function.condition()) {
            _super.push(' if ');
            _super.translate_logical_expression(delta_int_function.condition());
        }
    };

    var translate_input_bag = function (input_bag) {
        _super.push('{ ');
        for (var i = 0; i < input_bag.inputs().length; ++i) {
            var input = input_bag.inputs()[i];

            if (input.values().length === 0) {
                _super.push(input.port());
            } else {
                var port = input.port();
                var values = input.values();

                _super.push('( ' + port + ', { ');
                for (var j = 0; j < values.length; ++j) {
                    _super.push(values[j]);
                    if (j !== values.length - 1) {
                        _super.push(', ');
                    }
                }
                _super.push(' } )');
            }
            if (i !== input_bag.inputs().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }');
    };

    var translate_output = function (output_function) {
        _super.push(String.fromCharCode(0x03bb) + '( ');
        translate_state_vector(output_function.state());
        _super.push(' ) = { ');
        translate_output_bag(output_function.bag());
        _super.push(' }');
        if (output_function.condition()) {
            _super.push(' if ');
            _super.translate_logical_expression(output_function.condition());
        }
    };

    var translate_output_bag = function (output_bag) {
        _super.push('{ ');
        for (var i = 0; i < output_bag.outputs().length; ++i) {
            var output = output_bag.outputs()[i];

            if (typeof output === 'string') {
                _super.push(output);
            } else {
                var port = output[0];
                var attributes = output[1];

                _super.push('( ' + port + ', { ');
                for (var j = 0; j < attributes.length; ++j) {
                    _super.push('( ' + attributes[j][0] + ', ');
                    _super.translate_arithmetic_expression(attributes[j][1]);
                    _super.push(' )');
                    if (j !== attributes.length - 1) {
                        _super.push(', ');
                    }
                }
                _super.push(' } )');
            }
            if (i !== output_bag.outputs().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }');
    };

    var translate_parameters = function (parameter) {
        _super.push(parameter.name() + '(');
        _super.translate_type(parameter.type());
        _super.push(')=');
        _super.translate_arithmetic_expression(parameter.value());
    };

    var translate_ports = function (type, ports) {
        var port;
        var n = ports.length;

        _super.push(type + ' = { ');
        for (var i = 0; i < n; ++i) {
            port = ports[i];
            _super.push('( ');
            _super.push(port.name());
            if (port.types().length > 0) {
                _super.push(', ');
                for (var j = 0; j < port.types().length; ++j) {
                    _super.translate_type(port.types()[j]);
                    if (j !== port.types().length - 1) {
                        _super.push('x');
                    }
                }
            }
            _super.push(' )');
            if (i !== n - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
    };

    var translate_state = function (state) {
        var i;
        var variable;
        var n = state.state_variables().length;

        _super.push('S = { ( ');
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _super.push(variable.name());
            if (i !== n - 1) {
                _super.push(', ');
            }
        }
        _super.push(' ) / ');
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _super.push(variable.name() + ' ' + String.fromCharCode(0x2208) + ' ');
            _super.translate_type(variable.type());
            if (i !== n - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
        _super.push('S0 = ( ');
        for (i = 0; i < n; ++i) {
            variable = state.state_variables()[i];
            _super.translate_arithmetic_expression(variable.init());
            if (i !== n - 1) {
                _super.push(', ');
            }
        }
        _super.push(' )\n');
    };

    var translate_state_vector = function (state) {
        _super.push('( ');
        for (var i = 0; i < state.state_variables().length; ++i) {
            _super.translate_arithmetic_expression(state.state_variables()[i]);
            if (i !== state.state_variables().length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' )');
    };

    var translate_ta = function (ta_function) {
        _super.push('ta( ');
        translate_state_vector(ta_function.state());
        _super.push(' ) = ');
        _super.translate_arithmetic_expression(ta_function.expression());
        if (ta_function.condition()) {
            _super.push(' if ');
            _super.translate_logical_expression(ta_function.condition());
        }
    };
};

module.exports = Translator;