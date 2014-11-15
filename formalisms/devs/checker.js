var Expression = require('./../../lib/expression');

var Checker = function (model) {
// public methods
    this.check = function () {
        check_ta();
        check_delta_int();
        check_delta_ext();
        check_output();
    };

// private methods
    var check_state = function (state) {
        if (state.size() === _model.state().size()) {
            for (var i = 0; i < state.size(); ++i) {
                var state_variable = state.state_variable(i);

                if (state_variable instanceof Expression.Variable) {
                    if (state_variable.name() !== _model.state().state_variable(i).name()) {
                        throw new Error("wrong state variable name in " + i + ": " +
                        state_variable.name() + " <> " + _model.state().state_variable(i).name());
                    }
                } else if (state_variable instanceof Expression.Constant) {
                    var name = _model.state().state_variable(i).name();
                    var state_variable_type = _model.type_table()[name];

                    if (state_variable_type) {
                        if (typeof state_variable_type.type() !== 'string') {
                            var list = state_variable_type.type();
                            var found = false;
                            var k = 0;

                            while (!found && k < list.length) {
                                if (list[k] !== state_variable.value()) {
                                    ++k;
                                } else {
                                    found = true;
                                }
                            }
                            if (!found) {
                                throw new Error("wrong state variable value in " + i + ": " + name + " = { " + state_variable_type.type() + " }");
                            }
                        } else {
                            throw new Error("wrong state variable value in " + i + ": " + name + " = { " + state_variable_type.type() + " }");
                        }
                    } else {
                        throw new Error("state variable " + name + " is not discrete type in " + i);
                    }
                } else if (state_variable instanceof Expression.Integer) {
                    if (_model.state().state_variable(i).type().is_set()) {
                        throw new Error("wrong state variable value in " + i + ": " + _model.state().state_variable(i).name() + " = { " + model.state().state_variable(i).type().type() + " }");
                    }
                } else if (state_variable instanceof Expression.Real) {
                    if (_model.state().state_variable(i).type().is_set()) {
                        throw new Error("wrong state variable value in " + i + ": " + _model.state().state_variable(i).name() + " = { " + model.state().state_variable(i).type().type() + " }");
                    }
                } else if (state_variable instanceof Expression.Infinity) {
                    if (_model.state().state_variable(i).type().is_set()) {
                        throw new Error("wrong state variable value in " + i + ": " + _model.state().state_variable(i).name() + " = { " + model.state().state_variable(i).type().type() + " }");
                    }
                }
            }
        } else {
            throw new Error("wrong state variable number");
        }
    };

    var check_delta_ext = function () {
        var i;

        for (i = 0; i < _model.delta_ext_functions().length; ++i) {
            try {
                check_state(_model.delta_ext_functions()[i].state());
            } catch (e) {
                throw new Error("[DELTA_EXT - " + i + "] " + e);
            }
        }
    };

    var check_delta_int = function () {
        var i;

            for (i = 0; i < _model.delta_int_functions().length; ++i) {
                try {
                check_state(_model.delta_int_functions()[i].state());
                } catch (e) {
                    throw new Error("[DELTA_INT - " + i + "] " + e);
                }
            }
    };

    var check_output = function () {
        var i;

            for (i = 0; i < _model.output_functions().length; ++i) {
                try {
                check_state(_model.output_functions()[i].state());
                } catch (e) {
                    throw new Error("[OUTPUT - " + i + "] " + e);
                }
            }
    };

    var check_ta = function () {
        var i;

            for (i = 0; i < _model.ta_functions().length; ++i) {
                try {
                check_state(_model.ta_functions()[i].state());
                } catch (e) {
                    throw new Error("[TA - " + i + "] " + e);
                }
            }
    };

// private attributes
    var _model = model;
};

module.exports = Checker;