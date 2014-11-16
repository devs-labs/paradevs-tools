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

var DeltaExtFunction = function (state, e, input, expressions, condition) {
// public methods
    this.condition = function () {
        return _condition;
    };

    this.e = function () {
        return _e;
    };

    this.expressions = function () {
        return _expressions;
    };

    this.input = function () {
        return _input;
    };

    this.state = function () {
        return _state;
    };

// private attributes
    var _state = new Model.StateVector(state);
    var _e = e;
    var _input = new Model.Input(input);
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
    this.add_delta_ext_function = function (state, e, input, expression, condition) {
        _delta_ext_functions.push(new DeltaExtFunction(state, e, input, expression, condition));
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

        if (state_variable.type().is_set()) {
            _type_table[name] = state_variable.type();
        }
    };

    this.add_ta_function = function (state, expression, condition) {
        _ta_functions.push(new TaFunction(state, expression, condition));
    };

    this.delta_ext_functions = function () {
        return _delta_ext_functions;
    };

    this.delta_int_functions = function () {
        return _delta_int_functions;
    };

    this.init_state_variable = function (name, init) {
        _state.init_state_variable(name, init);
    };

    this.in_ports = function () {
        return _in_ports;
    };

    this.is_state_variable = function (name) {
        return _state.search(name) !== null;
    };

    this.name = function () {
        return _name;
    };

    this.out_ports = function () {
        return _out_ports;
    };

    this.output_functions = function () {
        return _output_functions;
    };

    this.parameters = function () {
        return _parameters;
    };

    this.state = function () {
        return _state;
    };

    this.ta_functions = function () {
        return _ta_functions;
    };

    this.type_table = function () {
        return _type_table;
    };

// private methods
    var init = function (name) {
        _name = name;
        _parameters = [];
        _type_table = {};
        _in_ports = [];
        _out_ports = [];
        _state = new Model.State();
        _delta_ext_functions = [];
        _delta_int_functions = [];
        _ta_functions = [];
        _output_functions = [];
    };

// private attributes
    var _name;
    var _parameters;
    var _type_table;
    var _in_ports;
    var _out_ports;
    var _state;
    var _delta_int_functions;
    var _delta_ext_functions;
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
}