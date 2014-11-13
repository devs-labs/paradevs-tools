//var Condition = require('./lib/condition');
var Expression = require('./../../lib/expression');

var Type = function (type) {
// public methods
    this.is_set = function () {
        return typeof _type !== 'string';
    };

    this.type = function () {
        return _type;
    };

// private attributes
    var _type = type;
};

var Parameter = function (name, type, value) {
// public methods
    this.name = function () {
        return _name;
    };

    this.type = function () {
        return _type;
    };

    this.value = function () {
        return _value;
    };

// private attributes
    var _name = name;
    var _type = new Type(type);
    var _value = value;
};

var StateVariable = function (name, type) {
// public methods
    this.name = function () {
        return _name;
    };

    this.type = function () {
        return _type;
    };

    this.init = function (value) {
        if (value) {
            _init = value;
        }
        return _init;
    };

// private attributes
    var _name = name;
    var _type = new Type(type);
    var _init = 0;
};

var State = function () {
// public methods
    this.add_state_variable = function (name, type) {
        var variable = new StateVariable(name, type);

        _state_variables.push(variable);
        return variable;
    };

    this.init_state_variable = function (name, init) {
        var variable = search(name);

        if (variable) {
            variable.init(init);
        } else {
            throw new Error('variable ' + name + ' doesn\'t exist');
        }
    };

    this.state_variables = function () {
        return _state_variables;
    };

// private methods
    var search = function (name) {
        var i = 0;
        var found = false;

        while (!found && i < _state_variables.length) {
            if (_state_variables[i].name() === name) {
                found = true;
            } else {
                ++i;
            }
        }
        if (found) {
            return _state_variables[i];
        } else {
            return null;
        }
    };

// private attributes
    var _state_variables = [];
};

var StateVector = function (state) {
// public methods
    this.state_variables = function () {
        return _state_variables;
    };

// private methods
    var init = function (state) {
        _state_variables = [];
        for (var i = 0; i < state.length; ++i) {
            _state_variables.push(state[i]);
        }
    };

// private attributes
    var _state_variables;

    init(state);
};

var InputBag = function (bag) {
// public methods
    this.inputs = function () {
        return _inputs;
    };

// private methods
    var init = function (bag) {
        _inputs = bag;
    };

// private attributes
    var _inputs;

    init(bag);
};

var OutputBag = function (bag) {
// public methods
    this.outputs = function () {
        return _outputs;
    };

// private methods
    var init = function (bag) {
        _outputs = bag;
    };

// private attributes
    var _outputs;

    init(bag);
};

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
    var _state = new StateVector(state);
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
    var _state = new StateVector(state);
    var _bag = new InputBag(bag);
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
    var _state = new StateVector(state);
    var _e = e;
    var _bag = new InputBag(bag);
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
    var _state = new StateVector(state);
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
    var _state = new StateVector(state);
    var _bag = new OutputBag(bag);
    var _condition = condition;
};

var Model = function (name) {
// public methods
    this.add_delta_conf_function = function (state, bag, expression, condition) {
        _delta_conf_functions.push(new DeltaConfFunction(state, bag, expression, condition));
    };

    this.add_delta_ext_function = function (state, e, bag, expression, condition) {
        _delta_ext_functions.push(new DeltaExtFunction(state, e, bag, expression, condition));
    };

    this.add_delta_int_function = function (state, expression, condition) {
        _delta_int_functions.push(new DeltaIntFunction(state, expression, condition));
    };

    this.add_in_port = function (name) {
        _in_ports.push(name);
    };

    this.add_out_port = function (name) {
        _out_ports.push(name);
    };

    this.add_output_function = function (state, bag, condition) {
        _output_functions.push(new OutputFunction(state, bag, condition));
    };

    this.add_parameter = function (name, type, value) {
        _parameters.push(new Parameter(name, type, value));
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

    this.delta_conf_functions = function () {
        return _delta_conf_functions;
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
        _state = new State();
        _delta_conf_functions = [];
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
    var _delta_conf_functions;
    var _ta_functions;
    var _output_functions;

    init(name);
};

if (typeof exports !== 'undefined') {
    exports.Model = Model;
    exports.State = State;
    exports.Type = Type;
    exports.Parameter = Parameter;
}