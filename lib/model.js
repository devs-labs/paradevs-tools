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
    var _init = null;
};

var State = function () {
// public methods
    this.add_state_variable = function (name, type) {
        var variable = new StateVariable(name, type);

        _state_variables.push(variable);
        return variable;
    };

    this.init_state_variable = function (name, init) {
        var variable = this.search(name);

        if (variable) {
            variable.init(init);
        } else {
            throw new Error('variable ' + name + ' doesn\'t exist');
        }
    };

    this.search = function (name) {
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

    this.size = function () {
        return _state_variables.length;
    };

    this.state_variable = function (index) {
        return _state_variables[index];
    };

    this.state_variables = function () {
        return _state_variables;
    };

// private attributes
    var _state_variables = [];
};

var StateVector = function (state) {
// public methods
    this.size = function () {
        return _state_variables.length;
    };

    this.state_variable = function (index) {
        return _state_variables[index];
    };

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

var Port = function (name, types) {
// public methods
    this.name = function () {
        return _name;
    };

    this.types = function () {
        return _types;
    };

// private methods
    var init = function (name, types) {
        _name = name;
        _types = [];
        for (var i = 0; i < types.length; ++i) {
            _types.push(new Type(types[i]));
        }
    };

// private attributes
    var _name;
    var _types;

    init(name, types);
};

var Input = function (input) {
// public methods
    this.port = function () {
        return _port;
    };

    this.values = function () {
        return _values;
    };

// private methods
    var init = function (input) {
        if (typeof input === 'string') {
            _port = input;
            _values = [];
        } else {
            _port = input[0];
            _values = input[1];
        }
    };

// private attributes
    var _port;
    var _values;

    init(input);
};

var InputBag = function (bag) {
// public methods
    this.inputs = function () {
        return _inputs;
    };

// private methods
    var init = function (bag) {
        _inputs = [];
        for(var i = 0; i < bag.length; ++i) {
            _inputs.push(new Input(bag[i]));
        }
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

if (typeof exports !== 'undefined') {
    exports.Type = Type;
    exports.Parameter = Parameter;
    exports.StateVariable = StateVariable;
    exports.State = State;
    exports.StateVector = StateVector;
    exports.Port = Port;
    exports.Input = Input;
    exports.InputBag = InputBag;
    exports.OutputBag = OutputBag;
}