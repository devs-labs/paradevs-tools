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

        if (state_variable.type().is_set()) {
            _type_table.push(state_variable.type().type());
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
        _type_table = [];
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

if (typeof exports !== 'undefined') {
    exports.AtomicModel = AtomicModel;
}