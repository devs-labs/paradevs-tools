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

    this.delta_ext_functions = function () {
        return _delta_ext_functions;
    };

    this.delta_int_functions = function () {
        return _delta_int_functions;
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

    this.struct_table = function () {
        return _struct_table;
    };

    this.ta_functions = function () {
        return _ta_functions;
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

if (typeof exports !== 'undefined') {
    exports.AtomicModel = AtomicModel;
    exports.DeltaConfFunction2 = DeltaConfFunction2;
    exports.DeltaConfFunction = DeltaConfFunction;
    exports.DeltaExtFunction = DeltaExtFunction;
    exports.DeltaIntFunction = DeltaIntFunction;
}