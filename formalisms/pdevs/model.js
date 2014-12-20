var Expression = require('./../../lib/expression');
var Model = require('./../../lib/model');

var TaFunction = function (state, expression, condition) {
// public methods
    this.condition = function () {
        return _condition;
    };

    this.expression = function () {
        return _expression;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _expression = expression;
    var _condition = condition;
};

var DeltaConfFunction = function (state, bag, expressions, condition) {
// public methods
    this.bag = function () {
        return _bag;
    };

    this.condition = function () {
        return _condition;
    };

    this.expressions = function () {
        return _expressions;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _bag = new Model.InputBag(bag);
    var _expressions = expressions;
    var _condition = condition;
};

var DeltaConfFunction2 = function (state, bag, value, internal) {
// public methods
    this.bag = function () {
        return _bag;
    };

    this.internal = function () {
        return _internal;
    };

    this.state = function () {
        return _state;
    };

    this.value = function () {
        return _value;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _bag = new Model.InputBag(bag);
    var _internal = internal;
    var _value = value;
};

var DeltaExtFunction = function (state, e, bag, expressions, condition) {
// public methods
    this.bag = function () {
        return _bag;
    };

    this.condition = function () {
        return _condition;
    };

    this.e = function () {
        return _e;
    };

    this.expressions = function () {
        return _expressions;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _e = e;
    var _bag = new Model.InputBag(bag);
    var _expressions = expressions;
    var _condition = condition;
};

var DeltaIntFunction = function (state, expressions, condition) {
// public methods
    this.condition = function () {
        return _condition;
    };

    this.expressions = function () {
        return _expressions;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _expressions = expressions;
    var _condition = condition;
};

var OutputFunction = function (state, bag, condition) {
// public methods
    this.bag = function () {
        return _bag;
    };

    this.condition = function () {
        return _condition;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _bag = new Model.OutputBag(bag);
    var _condition = condition;
};

var AtomicModel = function (name) {
// public methods
    this.add_delta_conf_function = function (state, bag, expression, condition) {
        _delta_conf_functions.push(new DeltaConfFunction(state, bag, expression, condition));
    };

    this.add_delta_conf_function2 = function (state, bag, value, internal) {
        _delta_conf_functions.push(new DeltaConfFunction2(state, bag, value, internal));
    };

    this.add_delta_ext_function = function (state, e, bag, expression, condition) {
        _delta_ext_functions.push(new DeltaExtFunction(state, e, bag, expression, condition));
    };

    this.add_delta_int_function = function (state, expression, condition) {
        _delta_int_functions.push(new DeltaIntFunction(state, expression, condition));
    };

    this.add_in_port = function (name, types) {
        _in_ports.push(new Model.Port(name, types));
    };

    this.add_out_port = function (name, types) {
        _out_ports.push(new Model.Port(name, types));
    };

    this.add_output_function = function (state, bag, condition) {
        _output_functions.push(new OutputFunction(state, bag, condition));
    };

    this.add_parameter = function (name, type, value) {
        _parameters.push(new Model.Parameter(name, type, value));
    };

    this.add_state_variable = function (name, type) {
        var state_variable = _state.add_state_variable(name, type);

        if (state_variable.type() instanceof Model.ConstantType) {
            _enum_table[name] = state_variable.type();
        } else if (state_variable.type() instanceof Model.StructType) {
            _struct_table[name] = state_variable.type();
        } else if (state_variable.type() instanceof Model.SetType) {
            if (state_variable.type().type() instanceof Model.StructType) {
                _struct_table[name] = state_variable.type().type();
            }
        }
    };

    this.add_ta_function = function (state, expression, condition) {
        _ta_functions.push(new TaFunction(state, expression, condition));
    };

    this.delta_conf_functions = function () {
        return _delta_conf_functions;
    };

    this.delta_conf_function = function (index) {
        return _delta_conf_functions[index];
    };

    this.delta_ext_functions = function () {
        return _delta_ext_functions;
    };

    this.delta_ext_function = function (index) {
        return _delta_ext_functions[index];
    };

    this.delta_int_functions = function () {
        return _delta_int_functions;
    };

    this.delta_int_function = function (index) {
        return _delta_int_functions[index];
    };

    this.enum_table = function () {
        return _enum_table;
    };

    this.init_state_variable = function (name, init) {
        _state.init_state_variable(name, init);
    };

    this.in_ports = function () {
        return _in_ports;
    };

    this.in_port = function (name) {
        var found = false;
        var i = 0;

        while (!found && i < _in_ports.length) {
            if (_in_ports[i].name() === name) {
                found = true;
            } else {
                ++i;
            }
        }
        return found ? _in_ports[i] : null;
    };

    this.is_state_variable = function (name) {
        return _state.search(name) !== null;
    };

    this.link_types = function () {
        for (var i = 0; i < _in_ports.length; ++i) {
            var types = _in_ports[i].types();

            for (var j = 0; j < types.length; ++j) {
                var type = types[j][1];
                var found = false;
                var type_name;

                for (type_name in _struct_table) {
                    if (_struct_table[type_name].equal_to(type)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    _in_ports[i].link_to_type(j, type_name);
                }
            }
        }
    };

    this.name = function () {
        return _name;
    };

    this.out_ports = function () {
        return _out_ports;
    };

    this.out_port = function (name) {
        var found = false;
        var i = 0;

        while (!found && i < _out_ports.length) {
            if (_out_ports[i].name() === name) {
                found = true;
            } else {
                ++i;
            }
        }
        return found ? _out_ports[i] : null;
    };

    this.output_functions = function () {
        return _output_functions;
    };

    this.output_function = function (index) {
        return _output_functions[index];
    };

    this.parameters = function () {
        return _parameters;
    };

    this.state = function () {
        return _state;
    };

    this.state_variable_type = function (name) {
        var type = _state.search(name).type();

        if (type instanceof Model.SetType) {
            return type.type();
        } else {
            return type;
        }
    };

    this.struct_table = function () {
        return _struct_table;
    };

    this.ta_functions = function () {
        return _ta_functions;
    };

    this.ta_function = function (index) {
        return _ta_functions[index];
    };

    this.type = function (t) {
        if (t) {
            _type = t;
        } else {
            return _type;
        }
    };

// private methods
    var init = function (name) {
        _name = name;
        _parameters = [];
        _enum_table = {};
        _struct_table = {};
        _in_ports = [];
        _out_ports = [];
        _state = new Model.State();
        _delta_conf_functions = [];
        _delta_ext_functions = [];
        _delta_int_functions = [];
        _ta_functions = [];
        _output_functions = [];
    };

// private attributes
    var _name;
    var _type;
    var _parameters;
    var _enum_table;
    var _struct_table;
    var _in_ports;
    var _out_ports;
    var _state;
    var _delta_int_functions;
    var _delta_ext_functions;
    var _delta_conf_functions;
    var _ta_functions;
    var _output_functions;

    init(name);
};

var SubModel = function (name, type, atomic) {
// public methods
    this.is_atomic = function () {
        return _atomic;
    };

    this.is_coupled = function () {
        return !_atomic;
    };

    this.name = function () {
        return _name;
    };

    this.type = function () {
        return _type;
    };

// private attributes
    var _name = name;
    var _type = type;
    var _atomic = atomic;
};

var InputConnection = function (coupled_input_port, inner_model_name, inner_input_port) {
// public methods
    this.coupled_input_port = function () {
        return _coupled_input_port;
    };

    this.inner_model_name = function () {
        return _inner_model_name;
    };

    this.inner_input_port = function () {
        return _inner_input_port;
    };

// private attributes
    var _coupled_input_port = coupled_input_port;
    var _inner_model_name = inner_model_name;
    var _inner_input_port = inner_input_port;
};

var OutputConnection = function (inner_model_name, inner_output_port, coupled_output_port) {
// public methods
    this.coupled_output_port = function () {
        return _coupled_output_port;
    };

    this.inner_model_name = function () {
        return _inner_model_name;
    };

    this.inner_output_port = function () {
        return _inner_output_port;
    };

// private attributes
    var _inner_model_name = inner_model_name;
    var _inner_output_port = inner_output_port;
    var _coupled_output_port = coupled_output_port;
};

var InternalConnection = function (source_model_name, source_output_port, destination_model_name, destination_input_port) {
// public methods
    this.destination_model_name = function () {
        return _destination_model_name;
    };

    this.destination_input_port = function () {
        return _destination_input_port;
    };

    this.source_model_name = function () {
        return _source_model_name;
    };

    this.source_output_port = function () {
        return _source_output_port;
    };

// private attributes
    var _destination_model_name = destination_model_name;
    var _destination_input_port = destination_input_port;
    var _source_model_name = source_model_name;
    var _source_output_port = source_output_port;
};

var CoupledModel = function (name) {
// public methods
    this.add_in_port = function (name, types) {
        _in_ports.push(new Model.Port(name, types));
    };

    this.add_input_connection = function (coupled_input_port, inner_model_name, inner_input_port) {
        _input_connections.push(new InputConnection(coupled_input_port, inner_model_name, inner_input_port));
    };

    this.add_internal_connection = function (source_model_name, source_output_port, destination_model_name, destination_input_port) {
        _internal_connections.push(new InternalConnection(source_model_name, source_output_port, destination_model_name, destination_input_port));
    };

    this.add_out_port = function (name, types) {
        _out_ports.push(new Model.Port(name, types));
    };

    this.add_output_connection = function (inner_model_name, inner_output_port, coupled_output_port) {
        _output_connections.push(new OutputConnection(inner_model_name, inner_output_port, coupled_output_port));
    };

    this.add_select = function (select) {
        _select = select;
    };

    this.add_sub_model = function (name, type, atomic) {
        _sub_models.push(new SubModel(name, type, atomic));
    };

    this.in_ports = function () {
        return _in_ports;
    };

    this.input_connections = function () {
        return _input_connections;
    };

    this.internal_connections = function () {
        return _internal_connections;
    };

    this.name = function () {
        return _name;
    };

    this.out_ports = function () {
        return _out_ports;
    };

    this.output_connections = function () {
        return _output_connections;
    };

    this.select = function () {
        return _select;
    };

    this.sub_models = function () {
        return _sub_models;
    };

    this.type = function (t) {
        if (t) {
            _type = t;
        } else {
            return _type;
        }
    };

// private methods
    var init = function (name) {
        _name = name;
        _in_ports = [];
        _out_ports = [];
        _sub_models = [];
        _input_connections = [];
        _output_connections = [];
        _internal_connections = [];
        _select = null;
    };

// private attributes
    var _name;
    var _type;
    var _in_ports;
    var _out_ports;
    var _sub_models;
    var _input_connections;
    var _output_connections;
    var _internal_connections;
    var _select;

    init(name);
};

if (typeof exports !== 'undefined') {
    exports.AtomicModel = AtomicModel;
    exports.CoupledModel = CoupledModel;
    exports.DeltaConfFunction2 = DeltaConfFunction2;
    exports.DeltaConfFunction = DeltaConfFunction;
    exports.DeltaExtFunction = DeltaExtFunction;
    exports.DeltaIntFunction = DeltaIntFunction;
}