var Expression = require('./../../../lib/expression');
var DevsModel = require('./../../../formalisms/devs/model');
var Model = require('./../../../lib/model');
var TextTranslator = require('./../../../lib/translator/text_translator');

var Translator = function (model) {
// private attributes
    var _super = new TextTranslator(model);

// public methods
    this.code = _super.code;

    this.translate = function () {
        if (_super.model() instanceof DevsModel.AtomicModel) {
            translate_atomic_model();
        } else {
            translate_coupled_model();
        }
    };

// private methods
    var translate_atomic_model = function () {
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
        for (i = 0; i < _super.model().output_functions().length; ++i) {
            translate_output(_super.model().output_functions()[i]);
            _super.push('\n');
        }
    };

    var translate_coupled_model = function () {
        translate_ports('X', _super.model().in_ports());
        translate_ports('Y', _super.model().out_ports());
        translate_sub_models(_super.model().sub_models());
        translate_input_connections(_super.model().input_connections());
        translate_output_connections(_super.model().output_connections());
        translate_internal_connections(_super.model().internal_connections());
        _super.push('select =');
    };

    var translate_delta_ext = function (delta_ext_function) {
        var i;

        _super.push(String.fromCharCode(0x03b4) + 'ext( ( ');
        translate_state_vector(delta_ext_function.state());
        _super.push(', ' + delta_ext_function.e());
        _super.push(' ), ');
        translate_input(delta_ext_function.input());
        _super.push(' ) = ( ');
        for (i = 0; i < delta_ext_function.expressions().length; ++i) {
            _super.translate_arithmetic_expression(delta_ext_function.expressions()[i])
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

    var translate_input = function (input) {
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
    };

    var translate_input_connections = function (input_connections) {
        var i;

        _super.push('EIC = { ');
        for (i = 0; i < input_connections.length; ++i) {
            _super.push('( ( N, ');
            _super.push(input_connections[i].coupled_input_port());
            _super.push(' ), ( ');
            _super.push(input_connections[i].inner_model_name());
            _super.push(', ');
            _super.push(input_connections[i].inner_input_port());
            _super.push(' ) )');
            if (i !== input_connections.length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
    };

    var translate_internal_connections = function (internal_connections) {
        var i;

        _super.push('IC = { ');
        for (i = 0; i < internal_connections.length; ++i) {
            _super.push('( ( ');
            _super.push(internal_connections[i].source_model_name());
            _super.push(', ');
            _super.push(internal_connections[i].source_output_port());
            _super.push(' ), ( ');
            _super.push(internal_connections[i].destination_model_name());
            _super.push(', ');
            _super.push(internal_connections[i].destination_input_port());
            _super.push(' ) )');
            if (i !== internal_connections.length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
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

    var translate_output_connections = function (output_connections) {
        var i;

        _super.push('EOC = { ');
        for (i = 0; i < output_connections.length; ++i) {
            _super.push('( ( ');
            _super.push(output_connections[i].inner_model_name());
            _super.push(', ');
            _super.push(output_connections[i].inner_output_port());
            _super.push(' ), ( N, ');
            _super.push(output_connections[i].coupled_output_port());
            _super.push(' ) )');
            if (i !== output_connections.length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
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

    var translate_sub_models = function (sub_models) {
        var i;

        _super.push('D = { ');
        for (i = 0; i < sub_models.length; ++i) {
            _super.push(sub_models[i].name());
            if (i !== sub_models.length - 1) {
                _super.push(', ');
            }
        }
        _super.push(' }\n');
        for (i = 0; i < sub_models.length; ++i) {
            _super.push('M(' + sub_models[i].name() + ') = ' + sub_models[i].type() + '\n');
        }
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