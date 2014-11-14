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

if (typeof exports !== 'undefined') {
    exports.Type = Type;
    exports.Parameter = Parameter;
    exports.StateVariable = StateVariable;
    exports.State = State;
    exports.StateVector = StateVector;
    exports.Port = Port;
    exports.InputBag = InputBag;
    exports.OutputBag = OutputBag;
}