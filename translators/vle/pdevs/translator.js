var Expression = require('./../../../lib/expression');
var Model = require('./../../../lib/model');
var PDevsModel = require('./../../../formalisms/pdevs/model');
var libxmljs = require("libxmljs");
var fs = require('fs');

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
    this.code = function () {
        return _code;
    };

    this.translate = function () {
        if (_model instanceof PDevsModel.AtomicModel) {
            translate_atomic_model();
        } else {
            translate_coupled_model();
        }
    };

// private methods
    var translate_arithmetic_expression = function (expression) {
        if (expression.arity() === 0) {
            if (expression instanceof Expression.Infinity) {
                return 'vle::devs::infinity'
            } else if (expression instanceof Expression.SetVariable) {
                if (expression.position() === 'first') {
                    return expression.name() + '[0]';
                } else {
                    return expression.name() + '[' + expression.name() + '.size() - 1]';
                }
            } else {
                return expression.to_string();
            }
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

    var translate_atomic_model = function () {
        _code += '#include <vle/devs/Dynamics.hpp>\n\n';
        _code += 'class ' + _model.name() + ' : public vle::devs::Dynamics\n' +
        '{\n' +
        'public:\n' +
        '  ' + _model.name() + '(const vle::devs::DynamicsInit& init, const vle::devs::InitEventList& events)\n' +
        '  : vle::devs::Dynamics(init, events)\n' +
        '  { \n';
        translate_parameters_init();
        _code += '  }\n\n' +
        '  virtual ~' + _model.name() + '()\n' +
        '  { }\n\n';

        _code += '  virtual void internalTransition(const vle::devs::Time& /* t */)\n' +
        '  {\n';
        translate_delta_int();
        _code += '  }\n\n' +
        '  virtual void externalTransition(const vle::devs::ExternalEventList& events, const vle::devs::Time& t)\n' +
        '  {\n' +
        '    vle::devs::ExternalEventList::const_iterator it = events.begin();\n\n' +
        '    while (it != events.end()) {\n' +
        '      const vle::devs::ExternalEvent& event = **it;\n\n';
        translate_delta_ext();
        _code += '      ++it;\n';
        _code += '    }\n  }\n\n' +
        '  virtual void confluentTransitions(const vle::devs::Time& t, const vle::devs::ExternalEventList& events)\n' +
        '  {\n';
        translate_delta_conf();
        _code += '  }\n\n' +
        '  virtual vle::devs::Time init(const vle::devs::Time& t)\n' +
        '  {\n';
        translate_init();
        _code += '    return 0;\n' +
        '  }\n\n' +
        '  virtual vle::devs::Time timeAdvance() const\n' +
        '  {\n';
        translate_ta();
        _code += '  }\n\n' +
        '  virtual void output(const vle::devs::Time& time, vle::devs::ExternalEventList& output) const\n' +
        '  {\n';
        translate_output();
        _code += '  }\n';
        _code += '\nprivate:\n';
        translate_enum_table();
        translate_struct_table();
        translate_state();
        translate_parameters();
        _code += '};\n';
    };

    var translate_condition = function (transition_function, spaces) {
        if (transition_function.condition()) {
            _code += spaces + 'if (' + translate_logical_expression(transition_function.condition()) + ') {\n';
            return true;
        } else {
            for (var i = 0; i < _model.state().size(); ++i) {
                if (!(transition_function.state().state_variable(i) instanceof Expression.Variable)) {
                    _code += spaces + 'if (' + _model.state().state_variable(i).name() + ' == ' +
                    translate_arithmetic_expression(transition_function.state().state_variable(i)) + ') {\n';
                    return true;
                }
            }
        }
        return false;
    };

    var translate_coupled_model = function () {
        var vpz;

        var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<!DOCTYPE vle_project PUBLIC "-//VLE TEAM//DTD Strict//EN" "http://www.vle-project.org/vle-1.2.0.dtd">' +
            '<vle_project version="1.0.0" date="" author="">' +
            '<structures>' +
            '<model name="Top model" type="coupled" />' +
            '</structures>' +
            '<dynamics></dynamics>' +
            '<experiment name="xxx" combination="linear">' +
            '<conditions />' +
            '<views> ' +
            '<outputs />' +
            '<observables />' +
            '</views>' +
            '</experiment>' +
            '</vle_project>';

        var xmlDoc = libxmljs.parseXml(xml);

        console.log(xmlDoc.toString());
    };

    var translate_delta_conf = function () {
        var list = _model.delta_conf_functions();

        if (list.length == 1 && list[0] instanceof PDevsModel.DeltaConfFunction2) {
            if (list[0].internal()) {
                _code += '    internalTransition(t);\n';
                _code += '    externalTransition(events, t);\n';
            } else {
                _code += '    externalTransition(events, t);\n';
                _code += '    internalTransition(t);\n';
            }
        } else {
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
                        _code += spaces + translate_arithmetic_expression(state_variable) + ' = ' + code + ';\n';
                    }
                }
                if (list[i].condition()) {
                    _code += '    }\n';
                }
            }
        }
    };

    var translate_delta_ext = function () {
        var list = _model.delta_ext_functions();

        for (var i = 0; i < list.length; ++i) {
            var expressions = list[i].expressions();
            var spaces = '      ';
            var condition_exist = translate_condition(list[i], spaces);

            if (condition_exist) {
                spaces += '  ';
            }
            for (var j = 0; j < expressions.length; ++j) {
                translate_expression(list[i], j, expressions[j], spaces);
            }
            if (condition_exist) {
                _code += '      }\n';
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
                translate_expression(list[i], j, expressions[j], spaces);
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_enum_table = function () {
        var k = 0;

        for (var name in _model.enum_table()) {
            var type = _model.enum_table()[name];

            _code += '  enum enum_' + k + ' { ';
            for (var j = 0; j < type.size(); ++j) {
                _code += type.get(j);
                if (j !== type.size() - 1) {
                    _code += ', ';
                }
            }
            _code += ' };\n';
            ++k;
        }
        if (k > 0) {
            _code += '\n';
        }
    };

    var translate_expression = function (transition_function, index, expression, spaces) {
        var state_variable = transition_function.state().state_variable(index);
        var s = _model.state().state_variable(index);

        if (s.type() instanceof Model.SetType && state_variable instanceof Expression.SetVariable) {
            if (state_variable.position() === 'first') {
                _code += spaces + state_variable.name() + '.erase(' + state_variable.name() + '.begin());\n';
            } else {
                _code += spaces + state_variable.name() + '.pop_back();\n';
            }
        } else {
            if ((transition_function instanceof PDevsModel.DeltaExtFunction  || transition_function instanceof PDevsModel.DeltaConfFunction) && s.type() instanceof Model.SetType) {
                if (expression.get(1) instanceof Expression.Function2 && expression.get(1).name() === 'push') {
                    for (var i = 0; i < transition_function.bag().inputs().length; ++i) {
                        _code += spaces + 'if (event.onPort("' + transition_function.bag().inputs()[i].port() + '")) {\n';

                        if (transition_function.bag().inputs()[i].values()[0] instanceof Array) {
                            _code += spaces + '  const vle::value::Set* set = dynamic_cast < const vle::value::Set* >' +
                            '(ee->getAttributeValue("' + transition_function.bag().inputs()[i].values()[0][0] + '"));\n\n';
                            _code += spaces + '  for (unsigned int i = 0; i < set->size(); ++i) {\n';
                            // TODO: convert set->get(i)
                            _code += spaces + '    ' + s.name() + '.push_back(set->get(i));\n';
                            _code += spaces + '  }\n';
                        } else {
                            for (var j = 0; j < transition_function.bag().inputs()[i].values().length; ++j) {
                                // TODO: convert value
                                _code += spaces + '  ' + s.name() + '.push_back(ee->getAttributeValue(' + transition_function.bag().inputs()[i].values()[j] + '));\n';
                            }
                        }
                        _code += spaces + '}\n';
                    }
                } else {
                    // TODO
                }
            } else {
                var variable = translate_arithmetic_expression(state_variable);
                var code = translate_arithmetic_expression(expression);

                if (variable !== code) {
                    if (transition_function instanceof PDevsModel.DeltaExtFunction || transition_function instanceof PDevsModel.DeltaConfFunction) {
                        for (var i = 0; i < transition_function.bag().inputs().length; ++i) {
                            _code += spaces + 'if (event.onPort("' + transition_function.bag().inputs()[i].port() + '") {\n';
                            // TODO: convert value and fix type
                            _code += spaces + '  double ' + transition_function.bag().inputs()[i].values()[0] + ' = ee->getAttributeValue("' +
                                transition_function.bag().inputs()[i].values()[0] + '");\n\n'
                            _code += spaces + '  ' + s.name() + ' = ' + code + ';\n';
                            _code += spaces + '}\n';
                        }
                    } else {
                        _code += spaces + s.name() + ' = ' + code + ';\n';
                    }
                }
            }
        }
    };

    var translate_init = function () {
        for (var i = 0; i < _model.state().size(); ++i) {
            var variable = _model.state().state_variable(i);

            if (variable.type() instanceof Model.SetType) {
                if (variable.init() instanceof Expression.EmptySet) {
                    _code += '    // ' + variable.name() + ' = empty set\n';
                } else {
                    // TODO
                }
            } else {
                _code += '    ' + variable.name() + ' = ' + translate_arithmetic_expression(variable.init()) + ';\n';
            }
        }
    };

    var translate_logical_expression = function (expression) {
        if (expression.arity() === 0) {
            return expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'not') {
                return 'not(' + translate_logical_expression(expression.get(1)) + ')';
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

    var translate_output = function () {
        var list = _model.output_functions();

        for (var i = 0; i < list.length; ++i) {
            var spaces = '    ';

            if (list[i].condition()) {
                _code += '    if (' + translate_logical_expression(list[i].condition()) + ') {\n';
                spaces += '  ';
            }
            for (var j = 0; j < list[i].bag().outputs().length; ++j) {
                var output = list[i].bag().outputs()[j];

                if (typeof output === 'string') {
                    _code += spaces + 'output.push_back(new vle::devs::ExternalEvent(';
                    _code += '"' + output + '"';
                    _code += '));\n'
                } else {
                    var port = output[0];
                    var attributes = output[1];

                    _code += spaces + '{\n';
                    _code += spaces + '  vle::devs::ExternalEvent* ee = new vle::devs::ExternalEvent("' + port + '");\n\n';
                    for (var k = 0; k < attributes.length; ++k) {
                        _code += spaces + '  ee << vle::devs::attribute(';
                        //TODO: verify type
                        _code += '"' + attributes[k][0] + '", ' + translate_arithmetic_expression(attributes[k][1]);
                        _code += ');\n'
                    }
                    _code += spaces + '  output.push_back(ee);\n';
                    _code += spaces + '}\n';
                }
            }
            if (list[i].condition()) {
                _code += '    }\n';
            }
        }
    };

    var translate_parameters = function () {
        if (_model.state().state_variables().length === 0) {
            _code += '\nprivate:\n';
        }
        for (var i = 0; i < _model.parameters().length; ++i) {
            var variable = _model.parameters()[i];

            translate_type(variable.name(), variable.type());
        }
    };

    var translate_parameters_init = function () {
        for (var i = 0; i < _model.parameters().length; ++i) {
            var variable = _model.parameters()[i];

            _code += '    ' + variable.name() + ' = events.exist("' + variable.name() + '") ? events.get("' + variable.name() + '") : ' + translate_arithmetic_expression(variable.value()) + ';\n';
        }
    };

    var translate_state = function () {
        var k_enum = 0;
        var k_struct = 0;
        var i;

        for (i = 0; i < _model.state().state_variables().length; ++i) {
            var variable = _model.state().state_variables()[i];

            if (variable.type() instanceof Model.ConstantType) {
                translate_type(variable.name(), variable.type(), k_enum);
                ++k_enum;
            } else if (variable.type() instanceof Model.StructType || (variable.type() instanceof Model.SetType && variable.type().type() instanceof Model.StructType)) {
                translate_type(variable.name(), variable.type(), k_struct);
                ++k_struct;
            } else {
                translate_type(variable.name(), variable.type());
            }
        }
        if (_model.state().state_variables().length > 0) {
            _code += '\n';
        }
    };

    var translate_struct_table = function () {
        var k = 0;

        for (var name in _model.struct_table()) {
            var type = _model.struct_table()[name];

            _code += '  struct struct_' + k + ' {\n';
            for (var j = 0; j < type.size(); ++j) {
                _code += '    ';
                if (type.get(j)[1] instanceof Model.RealType) {
                    _code += 'double';
                } else if (type.get(j)[1] instanceof Model.IntegerType) {
                    _code += 'int';
                }
                _code += ' ' + type.get(j)[0];
                _code += ';\n';
            }
            _code += '  };\n';
            ++k;
        }
        if (k > 0) {
            _code += '\n';
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

    var translate_type = function (name, type, k) {
        if (type instanceof Model.RealType) {
            _code += '  double ' + name + ';\n';
        } else if (type instanceof Model.IntegerType) {
            _code += '  int ' + name + ';\n';
        } else if (type instanceof Model.ConstantType) {
            _code += '  enum_' + k + ' ' + name + ';\n';
        } else if (type instanceof  Model.SetType) {
            _code += '  std::vector < ';
            if (type.type() instanceof Model.RealType) {
                _code += 'double';
            } else if (type.type() instanceof Model.IntegerType) {
                _code += 'int';
            } else if (type.type() instanceof Model.StructType) {
                _code += 'struct_' + k;
            }
            _code += ' > ' + name + '\n';
        } else if (type instanceof  Model.StructType) {
            // TODO
        }
    };

// private methods
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