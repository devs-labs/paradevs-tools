var Model = require('./../model');

var Translator = function (model) {
// public methods
    this.code = function () {
        return _code;
    };

    this.model = function () {
        return _model;
    };

    this.push = function (code) {
        _code += code;
    };

    this.translate_arithmetic_expression = function (expression) {
        if (expression.arity() === 0) {
            if (expression.to_string() === '+inf') {
                _code += '+' + String.fromCharCode(0x221e);
            } else {
                _code += expression.to_string();
            }
        } else if (expression.arity() === 1) {
            if (expression.name() === 'BAR') {
                _code += '|';
                this.translate_arithmetic_expression(expression.get(1));
                _code += '|';
            } else if (expression.name() === 'ArithmeticExpression') {
                this.translate_arithmetic_expression(expression.get(1));
            } else {
                _code += expression.name() + '(';
                this.translate_arithmetic_expression(expression.get(1));
                _code += ')';
            }
        } else if (expression.arity() === 2) {
            if (expression.name() === "log" || expression.name() === "max" || expression.name() === "min") {
                _code += expression.name() + '(';
                this.translate_arithmetic_expression(expression.get(1));
                _code += ', ';
                this.translate_arithmetic_expression(expression.get(2));
                _code += ')';
            } else if (expression.name() === "POW") {
                this.translate_arithmetic_expression(expression.get(1));
                _code += ' ^ ';
                this.translate_arithmetic_expression(expression.get(2));
            } else {
                this.translate_arithmetic_expression(expression.get(1));
                _code += ' ' + expression.name() + ' ';
                this.translate_arithmetic_expression(expression.get(2));
            }
        }
    };

    this.translate_logical_expression = function (expression) {
        if (expression.arity() === 0) {
            _code += expression.to_string();
        } else if (expression.arity() === 1) {
            if (expression.name() === 'not') {
                _code += String.fromCharCode(0x00ac) + '(';
                this.translate_logical_expression(expression.get(1));
                _code += ')';
            } else if (expression.name() === 'ConditionalExpression') {
                this.translate_logical_expression(expression.get(1));
            } else if (expression.name() === 'ArithmeticExpression') {
                this.translate_arithmetic_expression(expression.get(1));
            } else { // bracket
                _code += '(';
                this.translate_logical_expression(expression.get(1));
                _code += ')';
            }
        } else if (expression.arity() === 2) {
            this.translate_logical_expression(expression.get(1));
            _code += ' ';
            if (expression.name() === 'or') {
                _code += String.fromCharCode(0x22c1);
            } else if (expression.name() === 'and') {
                _code += String.fromCharCode(0x22c0);
            } else if (expression.name() === '<>') {
                _code += String.fromCharCode(0x2260);
            } else {
                _code += expression.name();
            }
            _code += ' ';
            this.translate_logical_expression(expression.get(2));
        }
    };

    this.translate_type = function (type) {
        var i;

        if (type instanceof Model.RealType) {
            var t = type.type();

            if (t.charAt(0) === 'R') {
                _code += String.fromCharCode(0x211d);
                if (t.length === 2) {
                    if (t.charAt(1) === '+') {
                        _code += String.fromCharCode(0x207a);
                    } else if (t.charAt(1) === '-') {
                        _code += String.fromCharCode(0x207b);
                    } else if (t.charAt(1) === '*') {
                        _code += String.fromCharCode(0x22c6);
                    }
                } else {
                    if (t.charAt(1) === '+') {
                        _code += String.fromCharCode(0x208a) + String.fromCharCode(0x22c6);
                    } else if (t.charAt(1) === '-') {
                        _code += String.fromCharCode(0x208b) + String.fromCharCode(0x22c6);
                    }
                }
            }
        } else if (type instanceof Model.IntegerType) {
            if (type.type() === 'N') {
                _code += String.fromCharCode(0x2115);
            } else {
                _code += String.fromCharCode(0x2124);
            }
        } else if (type instanceof Model.ConstantType) {
            _code += '{ ';
            for (i = 0; i < type.size(); ++i) {
                _code += type.get(i);
                if (i !== type.size() - 1) {
                    _code += ', ';
                }
            }
            _code += ' }';
        } else if (type instanceof  Model.SetType) {
            this.translate_type(type.type());
            _code += '^p';
        } else if (type instanceof  Model.StructType) {
            _code += '( ';
            for (i = 0; i < type.size(); ++i) {
                _code += type.get(i)[0] + ' ' + String.fromCharCode(0x2208) + ' ';
                this.translate_type(type.get(i)[1]);
                if (i !== type.size() - 1) {
                    _code += ', ';
                }
            }
            _code += ' )';
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