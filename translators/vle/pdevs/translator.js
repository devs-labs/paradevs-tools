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

var Translator = function (name, model, generator) {
// public methods
    this.code = function () {
        return _code;
    };

    this.init = function (output_directory) {
        make_package(_name, output_directory);
        fs.unlink(require('path').normalize(output_directory + '/' + _name + '/exp/empty.vpz'), function (err) {
            if (err) throw err;
        });
        fs.unlink(require('path').normalize(output_directory + '/' + _name + '/src/Simple.cpp'), function (err) {
            if (err) throw err;
        });
    };

    this.translate = function (extras) {
        if (_model instanceof PDevsModel.AtomicModel) {
            _model.link_types();
            translate_atomic_model();
        } else {
            var xmlDoc = init_coupled_model();

            translate_root_model(extras, xmlDoc);
            _code = xmlDoc.toString();
        }
    };

    this.write_to = function (output_directory) {
        var extension = (_model instanceof PDevsModel.AtomicModel) ? '.cpp' : '.vpz';

        if (_model instanceof PDevsModel.AtomicModel) {
            fs.writeFile(require('path').normalize(output_directory + '/' + _name + '/src/' + _model.name() + extension), _code, function (err) {
                if (err) throw err;
            });
        } else {
            fs.writeFile(require('path').normalize(output_directory + '/' + _name + '/exp/' + _model.name() + extension), _code, function (err) {
                if (err) throw err;
            });
        }
    };

// private methods
    var check_variables_in_expression = function (data, expression) {
        var found = false;
        var i = 0;

        while (!found && i < data.length) {
            if (expression.search_variable(data[i])) {
                found = true;
            } else {
                ++i;
            }
        }
        return found;
    };

    var declare_variables = function (inputs, expression, spaces) {
        for (var i = 0; i < inputs.length; ++i) {
            var event = inputs[i];
            var port = _model.in_port(event.port());
            var found = check_variables_in_expression(event.values(), expression);
            if (found) {
                for (j = 0; j < event.values().length; ++j) {
                    var variable = event.values()[j];
                    var type = get_type(port.types()[j][1]);

                    _code += spaces + '  ' + type[0] + ' ' + variable + ';\n';
                }
            }
        }
        _code += '\n';
    };

    var get_type = function (type) {
        var t;

        if (type instanceof Model.RealType) {
            t = ['double', 'Double'];
        } else if (type instanceof Model.IntegerType) {
            t = ['int', 'Integer'];
        } else if (type instanceof Model.StructType) {
            t = ['map', 'Map'];
        } else {
            // TODO
        }
        return t;
    };

    var is_same_port = function (inputs) {
        var same = true;
        var i = 1;
        var name = inputs[0].port();

        while (same && i < inputs.length) {
            if (name !== inputs[i].port()) {
                same = false;
            } else {
                ++i;
            }
        }
        return same;
    };

    var make_package = function (name, output_directory) {
        var vle = require('./wrapper/build/Release/vlejs');
        var new_dir = require('path').normalize(process.cwd() + '/' + output_directory);
        var old_dir = process.cwd();

        try {
            process.chdir(new_dir);
        }
        catch (err) {
            console.log(err);
        }
        vle.create('-P', name, 'create');
        process.chdir(old_dir);
    };

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
            if (expression.name() === 'Bracket') {
                return '(' + translate_arithmetic_expression(expression.get(1)) + ')';
            } else if (expression.name() === 'BAR') {
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
            } else if (expression.name() === "uniform") {
                var min = translate_arithmetic_expression(expression.get(1));
                var max = translate_arithmetic_expression(expression.get(2))
                return '(double)rand() / RAND_MAX * (' + max + ' - ' + min + ') + ' + min;
            } else {
                return translate_arithmetic_expression(expression.get(1)) + ' ' + expression.name() + ' ' + translate_arithmetic_expression(expression.get(2));
            }
        }
    };

    var translate_atomic_model = function () {
        _code += '#include <vle/devs/Dynamics.hpp>\n';
        _code += '#include <vle/devs/DynamicsDbg.hpp>\n\n';
        _code += '/*\n';
        _code += '* @@tagdynamic@@\n';
        _code += '* @@tagdepends:@@endtagdepends\n';
        _code += '*/\n';
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
        '  {\n';
        translate_delta_ext();
        _code += '  }\n\n' +
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
        _code += '};\n\n';
        _code += 'DECLARE_DYNAMICS_DBG(' + _model.name() + ');\n';
    };

    var translate_condition = function (transition_function, spaces) {
        if (transition_function.condition() && transition_function.condition().get(1).name() !== 'default') {
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

    var translate_dynamics = function (dynamics_node, xmlDoc) {
        for (var type in _generator.models()) {
            var model = _generator.model(type);

            if (model instanceof PDevsModel.AtomicModel) {
                var dynamic_node = new libxmljs.Element(xmlDoc, 'dynamic');

                dynamic_node.attr({
                    'name': 'dyn_' + type,
                    'library': model.name(),
                    'package': _name
                });
                dynamics_node.addChild(dynamic_node);
            }
        }
    };

    var init_coupled_model = function () {
        var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<!DOCTYPE vle_project PUBLIC "-//VLE TEAM//DTD Strict//EN" "http://www.vle-project.org/vle-1.2.0.dtd">' +
            '<vle_project version="1.0.0" date="" author="xxx">' +
            '<structures>' +
            '<model name="Top model" type="coupled" />' +
            '</structures>' +
            '<dynamics></dynamics>' +
            '<experiment name="exp" seed="9928947">' +
            '<conditions />' +
            '<views> ' +
            '<outputs />' +
            '<observables />' +
            '</views>' +
            '</experiment>' +
            '</vle_project>';

        return libxmljs.parseXml(xml);
    };

    var translate_ports = function (ports, submodel_node, ports_node, xmlDoc) {
        submodel_node.addChild(ports_node);
        for (var i = 0; i < ports.length; ++i) {
            var port_node = new libxmljs.Element(xmlDoc, 'port');

            port_node.attr({'name': ports[i].name()});
            ports_node.addChild(port_node);
        }
    };

    var translate_sub_model = function (model, xmlDoc) {
        var submodel_node = new libxmljs.Element(xmlDoc, 'model');
        var generator;

        submodel_node.attr({
            'name': model.name(),
            'type': model.is_atomic() ? 'atomic' : 'coupled',
            'dynamics': 'dyn_' + model.type()
        });

        var model2 = _generator.model(model.type());

        translate_ports(model2.in_ports(), submodel_node, new libxmljs.Element(xmlDoc, 'in'), xmlDoc);
        translate_ports(model2.out_ports(), submodel_node, new libxmljs.Element(xmlDoc, 'out'), xmlDoc);
        return submodel_node;
    };

    var translate_root_model = function (extras, xmlDoc) {
        var project_node = xmlDoc.root();
        var structure_node = project_node.childNodes()[0];
        var model_node = structure_node.childNodes()[0];
        var dynamics_node = project_node.childNodes()[1];

        model_node.attr('name').value(_model.name());
        translate_coupled_model(_model, model_node, xmlDoc)
        translate_dynamics(dynamics_node, xmlDoc);
        translate_extras(extras, project_node, xmlDoc);
    };

    var translate_extras = function(extras, project_node, xmlDoc) {
        var experiment_node = project_node.childNodes()[2];
        var conditions_node = experiment_node.childNodes()[0];
        var condition_node = new libxmljs.Element(xmlDoc, 'condition');
        var duration_port_node = new libxmljs.Element(xmlDoc, 'port');
        var duration_value_node = new libxmljs.Element(xmlDoc, 'double', extras.duration);
        var begin_port_node = new libxmljs.Element(xmlDoc, 'port');
        var begin_value_node = new libxmljs.Element(xmlDoc, 'double', extras.begin);

        duration_port_node.attr({ 'name': 'duration' });
        duration_port_node.addChild(duration_value_node);
        begin_port_node.attr({ 'name': 'begin' });
        begin_port_node.addChild(begin_value_node);
        condition_node.addChild(duration_port_node);
        condition_node.addChild(begin_port_node);
        condition_node.attr({ 'name': 'simulation_engine' });
        conditions_node.addChild(condition_node);
    };

    var translate_connections = function (model, connections_node, xmlDoc) {
        var i;
        var connection_node;
        var origin_node;
        var destination_node;
        var connection;

        for(i = 0; i < model.internal_connections().length; ++i) {
            connection_node = new libxmljs.Element(xmlDoc, 'connection');
            origin_node = new libxmljs.Element(xmlDoc, 'origin');
            destination_node = new libxmljs.Element(xmlDoc, 'destination');
            connection = model.internal_connections()[i];
            origin_node.attr({
                'model': connection.source_model_name(),
                'port': connection.source_output_port()
            });
            connection_node.addChild(origin_node);
            destination_node.attr({
                'model': connection.destination_model_name(),
                'port': connection.destination_input_port()
            });
            connection_node.addChild(destination_node);
            connection_node.attr({'type': 'internal'});
            connections_node.addChild(connection_node);
        }
        for(i = 0; i < model.input_connections().length; ++i) {
            connection_node = new libxmljs.Element(xmlDoc, 'connection');
            origin_node = new libxmljs.Element(xmlDoc, 'origin');
            destination_node = new libxmljs.Element(xmlDoc, 'destination');
            connection = model.input_connections()[i];
            origin_node.attr({
                'model': model.name(),
                'port': connection.coupled_input_port()
            });
            connection_node.addChild(origin_node);
            destination_node.attr({
                'model': connection.inner_model_name(),
                'port': connection.inner_input_port()
            });
            connection_node.addChild(destination_node);
            connection_node.attr({'type': 'input'});
            connections_node.addChild(connection_node);
        }
        for(i = 0; i < model.output_connections().length; ++i) {
            connection_node = new libxmljs.Element(xmlDoc, 'connection');
            origin_node = new libxmljs.Element(xmlDoc, 'origin');
            destination_node = new libxmljs.Element(xmlDoc, 'destination');
            connection = model.output_connections()[i];
            origin_node.attr({
                'model': connection.inner_model_name(),
                'port': connection.inner_output_port()
            });
            connection_node.addChild(origin_node);
            destination_node.attr({
                'model': model.name(),
                'port': connection.coupled_output_port()
            });
            connection_node.addChild(destination_node);
            connection_node.attr({'type': 'input'});
            connections_node.addChild(connection_node);
        }
    };

    var translate_coupled_model = function (model, model_node, xmlDoc) {
        var submodels_node = new libxmljs.Element(xmlDoc, 'submodels');
        var connections_node = new libxmljs.Element(xmlDoc, 'connections');

        model_node.addChild(submodels_node);
        model_node.addChild(connections_node);
        translate_connections(model, connections_node, xmlDoc);
        for (var i = 0; i < model.sub_models().length; ++i) {
            submodels_node.addChild(translate_sub_model(model.sub_models()[i], xmlDoc));
        }
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
            var spaces = '    ';
            var condition_exist = translate_condition(list[i], spaces);

            if (condition_exist) {
                spaces += '  ';
            }
            _code += spaces + 'vle::devs::ExternalEventList::const_iterator it = events.begin();\n';
            _code += spaces + 'while (it != events.end()) {\n';
            for (var j = 0; j < expressions.length; ++j) {
                translate_new_state(_model.state().state_variable(j), list[i], list[i].state().state_variable(j), expressions[j], spaces + '  ');
            }
            _code += spaces + '  ++it;\n';
            _code += spaces + '}\n';
            if (condition_exist) {
                _code += '    }\n';
            }
        }
    };

    var translate_delta_int = function () {
        var list = _model.delta_int_functions();

        for (var i = 0; i < list.length; ++i) {
            var expressions = list[i].expressions();
            var spaces = '    ';
            var condition_exist = translate_condition(list[i], spaces);

            if (condition_exist) {
                spaces += '  ';
            }
            for (var j = 0; j < expressions.length; ++j) {
                translate_new_state(_model.state().state_variable(j), list[i], list[i].state().state_variable(j), expressions[j], spaces);
            }
            if (condition_exist) {
                if (i != list.length - 1) {
                    _code += '    } else ';
                } else {
                    _code += '    }\n';
                }
            }
        }
    };

    var translate_enum_table = function () {
        for (var name in _model.enum_table()) {
            var type = _model.enum_table()[name];

            _code += '  enum enum_' + name + ' { ';
            for (var j = 0; j < type.size(); ++j) {
                _code += type.get(j);
                if (j !== type.size() - 1) {
                    _code += ', ';
                }
            }
            _code += ' };\n';
        }
        if (Object.keys(_model.enum_table()).length > 0) {
            _code += '\n';
        }
    };

    var translate_init = function () {
        for (var i = 0; i < _model.state().size(); ++i) {
            var variable = _model.state().state_variable(i);
            var values, j;

            if (variable.type() instanceof Model.SetType) {
                if (variable.init() instanceof Expression.EmptySet) {
                    _code += '    // ' + variable.name() + ' = empty set\n';
                } else if (variable.init() instanceof Expression.Set) {
                    values = variable.init().values();
                    for (j = 0; j < values.length; ++j) {
                        _code += '    ' + variable.name() + '.push_back(' + values[j].to_string() + ');\n';
                    }
                }
            } else if (variable.type() instanceof Model.StructType) {
                if (variable.init() instanceof Expression.Struct) {
                    values = variable.init().values();
                    for (j = 0; j < values.length; ++j) {
                        _code += '    ' + variable.name() + '.' + variable.type().get(j)[0] + ' = ' + values[j].to_string() + ';\n';
                    }
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

    var translate_map_to_struct = function (port_name, get_request, spaces) {
        var struct_name = 'struct_' + _model.in_port(port_name).types()[0][2];
        var attributes = _model.in_port(port_name).types()[0][1].attributes();

        _code += spaces + '    ' + struct_name + ' value;\n';
        _code += spaces + '    const vle::value::Map& input_value = ' + get_request;
        _code += '\n';
        for (var i = 0; i < attributes.length; ++i) {
            var type = get_type(attributes[i][1]);

            _code += spaces + '    value.' + attributes[i][0] + ' = vle::value::to' + type[1] + '(input_value["' + attributes[i][0] + '"]);\n';
        }
    };

    var translate_new_set = function (transition_function, state_variable_definition, expression, spaces) {
        var type;

        for (var i = 0; i < transition_function.bag().inputs().length; ++i) {
            _code += spaces + 'if (event.onPort("' + transition_function.bag().inputs()[i].port() + '")) {\n';
            if (transition_function.bag().inputs()[i].values()[0] instanceof Array) {
                if ((expression.get(1) instanceof Expression.SetVariable && transition_function.bag().inputs()[i].values()[0][0] === expression.get(1).name()) ||
                    (expression.get(1) instanceof Expression.Set && transition_function.bag().inputs()[i].values()[0][0] === expression.get(1).values()[0].name())) {
                    type = get_type(state_variable_definition.type().type());
                    _code += spaces + '  const vle::value::Set* set = dynamic_cast < const vle::value::Set* >' +
                    '(events[' + i + ']->getAttributeValue("' + transition_function.bag().inputs()[i].values()[0][0] + '"));\n\n';
                    _code += spaces + '  ' + state_variable_definition.name() + '.clear();\n';
                    _code += spaces + '  for (unsigned int i = 0; i < set->size(); ++i) {\n';
                    _code += spaces + '    ' + type[0] + ' value = vle::value::to' + type[1] + '(set->get(i));\n';
                    _code += spaces + '    ' + state_variable_definition.name() + '.push_back(value);\n';
                    _code += spaces + '  }\n';
                }
            } else {
                for (var j = 0; j < transition_function.bag().inputs()[i].values().length; ++j) {
                    type = get_type(state_variable_definition.type().type());
                    _code += spaces + '  ' + type[0] + ' value = events[' + i + ']->get' + type[1] + 'AttributeValue(' + transition_function.bag().inputs()[i].values()[j] + ');\n';
                    _code += spaces + '  ' + state_variable_definition.name() + '.push_back(value);\n';
                }
            }
            _code += spaces + '}\n';
        }
    };

    var translate_new_state = function (state_variable_definition, transition_function, previous_state_variable, expression, spaces) {
        var i, j;

        // new state is not same to state variable name
        if (!(expression.get(1) instanceof Expression.Variable && expression.get(1).name() === state_variable_definition.name() &&
            previous_state_variable instanceof Expression.Variable && previous_state_variable.name() === state_variable_definition.name())) {
            if (state_variable_definition.type() instanceof Model.SetType) {
                if (previous_state_variable instanceof Expression.SetVariable) {
                    if (previous_state_variable.position() === 'first') {
                        _code += spaces + previous_state_variable.name() + '.erase(' + previous_state_variable.name() + '.begin());\n';
                    } else { // last
                        _code += spaces + previous_state_variable.name() + '.pop_back();\n';
                    }
                } else {
                    if ((transition_function instanceof PDevsModel.DeltaExtFunction || transition_function instanceof PDevsModel.DeltaConfFunction)) {
                        if (expression.get(1) instanceof Expression.Function2 && expression.get(1).name() === 'push') {
                            translate_push(transition_function, state_variable_definition, spaces);
                        } else {
                            translate_new_set(transition_function, state_variable_definition, expression, spaces);
                        }
                    } else {
                        if (expression.get(1) instanceof Expression.EmptySet) {
                            _code += spaces + previous_state_variable.name() + '.clear();\n';
                        } else if (expression.get(1) instanceof Expression.Set) {
                            var values = expression.get(1).values();

                            for (j = 0; j < values.length; ++j) {
                                _code += spaces + state_variable_definition.name() + '.push_back(' + values[j].to_string() + ');\n';
                            }
                        }
                    }
                }
            } else {
                if (transition_function instanceof PDevsModel.DeltaExtFunction || transition_function instanceof PDevsModel.DeltaConfFunction) {
                    var event, found;
                    var k = 0;

                    for (i = 0; i < transition_function.bag().inputs().length; ++i) {
                        event = transition_function.bag().inputs()[i];
                        found = check_variables_in_expression(event.values(), expression);
                        if (found) {
                            ++k;
                        }
                    }
                    if (k > 0) {
                        var variable, port, type;

                        if (transition_function.bag().inputs().length > 1) {
                            _code += spaces + '{\n';
                            if (is_same_port(transition_function.bag().inputs())) {
                                var unique_port = transition_function.bag().inputs()[0].port();

                                declare_variables(transition_function.bag().inputs(), expression, spaces);
                                for (i = 0; i < transition_function.bag().inputs().length; ++i) {
                                    event = transition_function.bag().inputs()[i];
                                    port = _model.in_port(event.port());
                                    found = check_variables_in_expression(event.values(), expression);
                                    if (found) {
                                        for (j = 0; j < event.values().length; ++j) {
                                            _code += spaces + '  if (events[' + i + ']->onPort("' + unique_port + '")) {\n';
                                            variable = event.values()[j];
                                            type = get_type(port.types()[j][1]);
                                            _code += spaces + '    ' + variable + ' = events[' + i + ']->get' + type[1] + 'AttributeValue("' + port.types()[j][0] + '");\n'
                                            _code += spaces + '  }\n';
                                        }
                                    }
                                }
                                _code += spaces + '  ' + state_variable_definition.name() + ' = ' + translate_arithmetic_expression(expression) + ';\n';
                            } else {
                                declare_variables(transition_function.bag().inputs(), expression, spaces);
                                for (i = 0; i < transition_function.bag().inputs().length; ++i) {
                                    event = transition_function.bag().inputs()[i];
                                    port = _model.in_port(event.port());
                                    found = check_variables_in_expression(event.values(), expression);
                                    if (found) {
                                        _code += spaces + '    if ((*it)->onPort("' + event.port() + '")) {\n';
                                        for (j = 0; j < event.values().length; ++j) {
                                            variable = event.values()[j];
                                            type = get_type(port.types()[j][1]);
                                            _code += spaces + '      ' + variable + ' = (*it)->get' + type[1] + 'AttributeValue("' + port.types()[j][0] + '");\n'
                                        }
                                        _code += spaces + '    }\n';
                                    }
                                }
                                _code += spaces + '  ' + state_variable_definition.name() + ' = ' + translate_arithmetic_expression(expression) + ';\n';
                            }
                        } else {
                            event = transition_function.bag().inputs()[0];
                            port = _model.in_port(event.port());
                            found = check_variables_in_expression(event.values(), expression);
                            if (found) {
                                _code += spaces + 'if (events[0]->onPort("' + event.port() + '")) {\n';
                                for (j = 0; j < event.values().length; ++j) {
                                    variable = event.values()[j];
                                    type = get_type(port.types()[j][1]);
                                    _code += spaces + '  ' + type[0] + ' ' + variable + ' = events[0]->get' + type[1] + 'AttributeValue("' + port.types()[j][0] + '");\n'
                                }
                                _code += '\n';
                                _code += spaces + '  ' + state_variable_definition.name() + ' = ' + translate_arithmetic_expression(expression) + ';\n';
                            }
                        }
                    } else {
                        _code += spaces + state_variable_definition.name() + ' = ' + translate_arithmetic_expression(expression) + ';\n';
                    }
                    if (k > 0) {
                        _code += spaces + '}\n';
                    }
                } else {
                    _code += spaces + state_variable_definition.name() + ' = ' + translate_arithmetic_expression(expression) + ';\n';
                }
            }
        }
    };

    var translate_output = function () {
        var output_functions = _model.output_functions();

        for (var i = 0; i < output_functions.length; ++i) {
            var output_function = output_functions[i];
            var spaces = '    ';
            var condition_exist = translate_condition(output_function, spaces);

            if (condition_exist) {
                spaces += '  ';
            }
            for (var j = 0; j < output_function.bag().outputs().length; ++j) {
                var output = output_function.bag().outputs()[j];

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
                        var attribute_type = attributes[k][1].type();

                        _code += spaces + '  ee << vle::devs::attribute(';
                        _code += '"' + attributes[k][0] + '", ';
                        if (attribute_type instanceof Model.RealType || attribute_type instanceof Model.IntegerType || attribute_type === null) {
                            _code += translate_arithmetic_expression(attributes[k][1]);
                        } else {
                            // TODO
                            _code += '???';
                        }
                        _code += ');\n'
                    }
                    _code += spaces + '  output.push_back(ee);\n';
                    _code += spaces + '}\n';
                }
            }
            if (condition_exist) {
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

            _code += '    ' + variable.name() + ' = events.exist("' + variable.name() + '") ? ';
            if (variable.type() instanceof Model.RealType) {
                _code += 'vle::value::toDouble';
            } else if (variable.type() instanceof Model.IntegerType) {
                _code += 'vle::value::toInteger';
            }
            _code += '(events.get("' + variable.name() + '")) : ' + translate_arithmetic_expression(variable.value()) + ';\n';
        }
    };

    var translate_push = function (transition_function, state_variable_definition, spaces) {
        var type;

        for (var i = 0; i < transition_function.bag().inputs().length; ++i) {
            _code += spaces + 'if (event.onPort("' + transition_function.bag().inputs()[i].port() + '")) {\n';

            if (transition_function.bag().inputs()[i].values()[0] instanceof Array) {
                type = get_type(state_variable_definition.type().type());
                _code += spaces + '  const vle::value::Set* set = dynamic_cast < const vle::value::Set* >' +
                '(events[0]->getAttributeValue("' + transition_function.bag().inputs()[i].values()[0][0] + '"));\n\n';
                _code += spaces + '  for (unsigned int i = 0; i < set->size(); ++i) {\n';
                if (type[0] === 'map') {
                    translate_map_to_struct(transition_function.bag().inputs()[i].port(), 'vle::value::toMap(set->get(i));\n', spaces);
                } else {
                    _code += spaces + '    ' + type[0] + ' value = vle::value::to' + type[1] + '(set->get(i));\n';
                }
                _code += spaces + '    ' + state_variable_definition.name() + '.push_back(value);\n';
                _code += spaces + '  }\n';
            } else {
                for (var j = 0; j < transition_function.bag().inputs()[i].values().length; ++j) {
                    type = get_type(state_variable_definition.type().type());
                    if (type[0] === 'map') {
                        _code += spaces + '  {\n';
                        translate_map_to_struct(transition_function.bag().inputs()[i].port(), 'events[' + i + ']->getMapAttributeValue(' + transition_function.bag().inputs()[i].values()[j] + ');\n', spaces);
                        _code += spaces + '    ' + state_variable_definition.name() + '.push_back(value);\n';
                        _code += spaces + '  }\n';
                    } else {
                        _code += spaces + '    ' + type[0] + ' value = events[' + i + ']->get' + type[1] + 'AttributeValue(' + transition_function.bag().inputs()[i].values()[j] + ');\n';
                        _code += spaces + '    ' + state_variable_definition.name() + '.push_back(value);\n';
                    }
                }
            }
            _code += spaces + '}\n';
        }
    };

    var translate_state = function () {
        var i;

        for (i = 0; i < _model.state().state_variables().length; ++i) {
            var variable = _model.state().state_variables()[i];

            if (variable.type() instanceof Model.ConstantType) {
                translate_type(variable.name(), variable.type());
            } else if (variable.type() instanceof Model.StructType || (variable.type() instanceof Model.SetType && variable.type().type() instanceof Model.StructType)) {
                translate_type(variable.name(), variable.type());
            } else {
                translate_type(variable.name(), variable.type());
            }
        }
        if (_model.state().state_variables().length > 0) {
            _code += '\n';
        }
    };

    var translate_struct_table = function () {
        for (var name in _model.struct_table()) {
            var type = _model.struct_table()[name];

            _code += '  struct struct_' + name + ' {\n';
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
        }
        if (Object.keys(_model.struct_table()).length > 0) {
            _code += '\n';
        }
    };

    var translate_ta = function () {
        var list = model.ta_functions();
        var i;
        var condition_exist;
        var item;
        var ok = false;

        for (i = 0; i < list.length; ++i) {
            var spaces = '    ';

            item = list[i];
            if (i > 0 && (!item.condition() || (item.condition() && !(item.condition().get(1) instanceof Expression.Default)))) {
                _code += ' else ';
                spaces = '';
            }
            condition_exist = translate_condition(item, spaces);
            if (condition_exist) {
                spaces = '      ';
                ok = true;
            } else {
                spaces = '    ';
            }
            if (!item.condition() || (item.condition() && !(item.condition().get(1) instanceof Expression.Default))) {
                _code += spaces + 'return ' + translate_arithmetic_expression(item.expression()) + ';\n';
            }
            if (condition_exist) {
                _code += '    }';
            }
        }
        for (i = 0; i < list.length; ++i) {
            item = list[i];
            if (item.condition() && item.condition().get(1) instanceof Expression.Default) {
                if (ok) {
                    _code += ' else {\n';
                    _code += '      return ' + translate_arithmetic_expression(item.expression()) + ';\n';
                    _code += '    }\n';
                } else {
                    _code += '    return ' + translate_arithmetic_expression(item.expression()) + ';\n';
                }
            }
        }
    };

    var translate_type = function (name, type) {
        if (type instanceof Model.RealType) {
            _code += '  double ' + name + ';\n';
        } else if (type instanceof Model.IntegerType) {
            _code += '  int ' + name + ';\n';
        } else if (type instanceof Model.ConstantType) {
            _code += '  enum_' + name + ' ' + name + ';\n';
        } else if (type instanceof  Model.SetType) {
            _code += '  std::vector < ';
            if (type.type() instanceof Model.RealType) {
                _code += 'double';
            } else if (type.type() instanceof Model.IntegerType) {
                _code += 'int';
            } else if (type.type() instanceof Model.StructType) {
                _code += 'struct_' + name;
            }
            _code += ' > ' + name + ';\n';
        } else if (type instanceof  Model.StructType) {
            _code += '  struct_' + name + ' ' + name + ';\n';
        }
    };

// private methods
    var init = function (name, model, generator) {
        _code = '';
        _name = name;
        _model = model;
        _generator = generator;
    };

// private attributes
    var _name;
    var _model;
    var _generator;
    var _code;

    init(name, model, generator);
};

module.exports = Translator;