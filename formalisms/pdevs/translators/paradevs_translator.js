var Expression = require('./../../../lib/expression');

var functions = {
    'sin': 'sin',
    'cos': 'cos',
    'tan': 'tan',
    'asin': 'asin',
    'acos': 'acos',
    'atan': 'atan',
    'sh': 'sinh',
    'ch': 'cosh',
    'th': 'tanh',
    'asinh': 'asinh',
    'acosh': 'acosh',
    'atanh': 'atanh',
    'e': 'exp',
    'ln': 'log',
    'sqrt': 'sqrt'
};

var Translator = function (model) {
// public methods
    this.translate = function () {
        _code += '#include <paradevs/common/time/DoubleTime.hpp>\n' +
        '#include <paradevs/common/utils/Trace.hpp>\n' +
        '#include <paradevs/kernel/pdevs/Dynamics.hpp>\n\n';
        translate_type_table();
        _code += 'class ' + _model.name() + ' : public paradevs::pdevs::Dynamics < common::DoubleTime >\n' +
        '{\n' +
        'public:\n' +
        '  ' + _model.name() + '(const std::string& name, const common::NoParameters& parameters)\n' +
        '  : paradevs::pdevs::Dynamics < common::DoubleTime >(name, parameters)\n' +
        '  { \n';
        translate_parameters_init();
        _code += '  }\n\n' +
        '  virtual ~' + _model.name() + '()\n' +
        '  { }\n\n';

        _code += '  void dint(typename common::DoubleTime::type t)\n' +
        '  {\n';
        translate_delta_int();
        _code += '  }\n\n' +
        '  void dext(typename common::DoubleTime::type t, typename common::DoubleTime::type e, const common::Bag < common::DoubleTime >& msgs)\n' +
        '  {\n';
        translate_delta_ext();
        _code += '  }\n\n' +
        '  void dconf(typename common::DoubleTime::type t, typename common::DoubleTime::type e, const common::Bag < common::DoubleTime >& msgs)\n' +
        '  {\n';
        translate_delta_conf();
        _code += '  }\n\n' +
        '  typename common::DoubleTime::type start(typename common::DoubleTime::type t)\n' +
        '  {\n';
        translate_init();
        _code += '    return 0;\n' +
        '  }\n\n' +
        '  typename common::DoubleTime::type ta(typename common::DoubleTime::type t) const\n' +
        '  {\n';
        translate_ta();
        _code += '  }\n\n' +
        '  common::Bag < common::DoubleTime > lambda(typename common::DoubleTime::type t) const\n' +
        '  {\n' +
        '    common::Bag < common::DoubleTime > msgs;\n';
        translate_output();
        _code += '    return msgs;\n' +
        '  }\n';
        translate_state();
        translate_parameters();
        _code += '};\n';
    };

    this.code = function () {
        return _code;
    };

// private methods
    var translate_delta_conf = function () {
        var list = _model.delta_conf_functions();

        for (var i = 0; i < list.length; ++i) {
            var expressions = list[i].expressions();
            var spaces = '    ';

            if (list[i].condition()) {
                _code += '    if (' + translate_logical_expression(list[i].condition()) + ') {\n';
                spaces += '  ';
            }
            for (var j = 0; j < expressions.length; ++j) {
                var state_variable = list[i].state().state_variables()[j];
                var code = translate_arithmetic_expression(expressions[j]);

                if (state_variable !== code) {
                    _code += spaces + state_variable + ' = ' + code +';\n';
                }
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_delta_ext = function () {
        var list = _model.delta_ext_functions();

        for (var i = 0; i < list.length; ++i) {
            var expressions = list[i].expressions();
            var spaces = '    ';

            if (list[i].condition()) {
                _code += '    if (' + translate_logical_expression(list[i].condition()) + ') {\n';
                spaces += '  ';
            }
            for (var j = 0; j < expressions.length; ++j) {
                var state_variable = list[i].state().state_variables()[j];
                var code = translate_arithmetic_expression(expressions[j]);

                if (state_variable !== code) {
                    _code += spaces + state_variable + ' = ' + code +';\n';
                }
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_delta_int = function () {
        var list = _model.delta_int_functions();

        for (var i = 0; i < list.length; ++i) {
            var expressions = list[i].expressions();
            var spaces = '    ';

            if (list[i].condition()) {
                _code += '    if (' + translate_logical_expression(list[i].condition()) + ') {\n';
                spaces += '  ';
            }
            for (var j = 0; j < expressions.length; ++j) {
                var state_variable = list[i].state().state_variables()[j];
                var code = translate_arithmetic_expression(expressions[j]);

                if (state_variable !== code) {
                    _code += spaces + state_variable + ' = ' + code +';\n';
                }
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_arithmetic_expression = function (expression) {
        if (expression.arity() === 0) {
            return expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'BAR') {
                return 'std::fabs(' + translate_arithmetic_expression(expression.get(1)) + ')';
            } else if (expression.name() === 'ArithmeticExpression') {
                return translate_arithmetic_expression(expression.get(1));
            } else if (expression.name() === 'cotan') {
                return 'std::sin(' + translate_arithmetic_expression(expression.get(1)) + ') / std::cos(' + translate_arithmetic_expression(expression.get(1)) + ')';
            } else if (expression.name() === 'coth') {
                return 'std::sinh(' + translate_arithmetic_expression(expression.get(1)) + ') / std::cosh(' + translate_arithmetic_expression(expression.get(1)) + ')';
            } else {
                return 'std::' + functions[expression.name()] + '(' + translate_arithmetic_expression(expression.get(1)) + ')';
            }
        } else if (expression.arity() === 2) {
            if (expression.name() === "log" || expression.name() === "max" || expression.name() === "min") {
                return 'std::' + expression.name() + '(' + translate_arithmetic_expression(expression.get(1)) + ', ' + translate_arithmetic_expression(expression.get(2)) + ')';
            } else if (expression.name() === "POW") {
                return 'std::pow(' + translate_arithmetic_expression(expression.get(1)) + ', ' + translate_arithmetic_expression(expression.get(2)) + ')';
            } else {
                return translate_arithmetic_expression(expression.get(1)) + ' ' + expression.name() + ' ' + translate_arithmetic_expression(expression.get(2));
            }
        }
    };

    var translate_logical_expression = function (expression) {
        if (expression.arity() === 0) {
            return expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'not') {
                return '!(' + translate_logical_expression(expression.get(1)) +')';
            } else if (expression.name() === 'ConditionalExpression') {
                return translate_logical_expression(expression.get(1));
            } else if (expression.name() === 'ArithmeticExpression') {
                return translate_arithmetic_expression(expression.get(1));
            } else { // bracket
                return '(' + translate_logical_expression(expression.get(1)) + ')';
            }
        } else if (expression.arity() === 2) {
            if (expression.name() === '=') {
                return translate_logical_expression(expression.get(1)) + ' == ' + translate_logical_expression(expression.get(2));
            } else if (expression.name() === '<>') {
                return translate_logical_expression(expression.get(1)) + ' != ' + translate_logical_expression(expression.get(2));
            } else {
                return translate_logical_expression(expression.get(1)) + ' ' + expression.name() + ' ' + translate_logical_expression(expression.get(2));
            }
        }
    };

    var translate_init = function () {
        for (var i = 0; i < _model.state().state_variables().length; ++i) {
            var variable = _model.state().state_variables()[i];

            _code += '    ' + variable.name() + ' = ' + translate_arithmetic_expression(variable.init()) + ';\n';
        }
    };

    var translate_output = function () {
        var list = _model.output_functions();

        _code += '\n';
        for (var i = 0; i < list.length; ++i) {
            var spaces = '    ';

            if (list[i].condition()) {
                _code += '    if (' + translate_logical_expression(list[i].condition()) + ') {\n';
                spaces += '  ';
            }
            for (var j = 0; j < list[i].bag().outputs().length; ++j) {
                var output = list[i].bag().outputs()[j];

                if (typeof output === 'string') {
                    _code += spaces + 'msgs.push_back(common::ExternalEvent < common::DoubleTime >(';
                    _code += '"' + output + '", 0';
                    _code += '));\n'
                } else {
                    var port = output[0];
                    var attributes = output[1];

                    for (var k = 0; k < attributes.length; ++k) {
                        _code += spaces + 'msgs.push_back(common::ExternalEvent < common::DoubleTime >(';
                        _code += '"' + port + '", (void*)(&' + attributes[k][1] + ')';
                        _code += '));\n'
                    }
                }
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_parameters = function () {
        _code += '\nprivate:\n';
        for (var i = 0; i < _model.parameters().length; ++i) {
            var variable = _model.parameters()[i];

            if (variable.type().type() === 'R' || variable.type().type() === 'R+' || variable.type().type() === 'R-' ||
                variable.type().type() === 'R+*' || variable.type().type() === 'R-*') {
                _code += '  double ' + variable.name() + ';\n';
            } else if (variable.type().type() === 'N' || variable.type().type() === 'Z') {
                _code += '  int ' + variable.name() + ';\n';
            } else {

            }
        }
    };

    var translate_parameters_init = function () {
        for (var i = 0; i < _model.parameters().length; ++i) {
            var variable = _model.parameters()[i];

            _code += '    ' + variable.name() + ' = ' + variable.value() + ';\n';
        }
    };

    var translate_state = function () {
        var k = 0;
        var i;

        _code += '\nprivate:\n';
        for (i = 0; i < _model.state().state_variables().length; ++i) {
            var variable = _model.state().state_variables()[i];

            if (variable.type().type() === 'R' || variable.type().type() === 'R+' || variable.type().type() === 'R-' ||
                variable.type().type() === 'R+*' || variable.type().type() === 'R-*') {
                _code += '  double ' + variable.name() + ';\n';
            } else if (variable.type().type() === 'N' || variable.type().type() === 'Z') {
                _code += '  int ' + variable.name() + ';\n';
            } else {
                _code += '  type_' + k + ' ' + variable.name() + ';\n';
                ++k;
            }
        }
    };

    var translate_ta = function () {
        var list = model.ta_functions();
        var i;
        var item;

        for (i = 0; i < list.length; ++i) {
            item = list[i];
            if (item.condition() && typeof item.condition() !== Expression.Default) {
                _code += '    if (' + translate_logical_expression(item.condition()) + ') {\n';
                _code += '      return ' + translate_arithmetic_expression(item.expression()) + ';\n';
                _code += '    }\n';
            } else {
                _code += '    return ' + translate_arithmetic_expression(item.expression()) + ';\n';
            }
        }
        for (i = 0; i < list.length; ++i) {
            item = list[i];
            if (item.condition() && typeof item.condition() === Expression.Default) {
                _code += '    else {\n';
                _code += '      return ' + translate_arithmetic_expression(item.expression()) + ';\n';
                _code += '    }\n';
            }
        }
    };

    var translate_type_table = function () {
        for (var i = 0; i < _model.type_table().length; ++i) {
            var type = _model.type_table()[i];

            _code += 'enum type_' + i + ' { ';
            for (var j = 0; j < type.length; ++j) {
                _code += type[j];
                if (j !== type.length - 1) {
                    _code += ', ';
                }
            }
            _code += ' };\n';
        }
        _code += '\n';
    };

    var init = function (model) {
        _code = '';
        _model = model;
    };

// private attributes
    var _model;
    var _code;

    init(model);
};

module.exports = Translator;