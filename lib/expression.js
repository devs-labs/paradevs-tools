var Model = require('./model');

var BinaryNode = function (left, right) {
// public methods
    this.arity = function () {
        return 2;
    };

    this.get = function (index) {
        return index === 1 ? _left : right;
    };

    this.left = function () {
        return _left;
    };

    this.right = function () {
        return _right;
    };

    this.search_variable = function (variable) {
        return _left.search_variable(variable) || _right.search_variable(variable);
    };

// private attributes
    var _left = left;
    var _right = right;
};

var UnaryNode = function (child) {
// public methods
    this.arity = function () {
        return 1;
    };

    this.child = function () {
        return _child;
    };

    this.get = function (index) {
        return _child;
    };

    this.search_variable = function (variable) {
        return _child.search_variable(variable);
    };

// private attributes
    var _child = child;
};

var Litteral = function () {
// public methods
    this.arity = function () {
        return 0;
    };
};

var Add = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return '+';
    };

    this.type = function () {
        var left_type = this.get(1).type();
        var right_type = this.get(2).type();

        if (left_type.type() === right_type.type()) {
            return left_type;
        } else {
            if (left_type instanceof Model.RealType || right_type instanceof Model.RealType) {
                return new Model.RealType('R');
            } else {
                // TODO
            }
        }
    };
};

var Sub = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return '-';
    };
};

var Mult = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return '*';
    };
};

var Div = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return '/';
    };
};

var Bracket = function (child) {
// private attributes
    var _super = new UnaryNode(child);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return 'Bracket';
    };
};

var Function = function (name, expression) {
// private attributes
    var _name = name;
    var _super = new UnaryNode(expression);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return _name;
    };
};

var Function2 = function (name, expression1, expression2) {
// private attributes
    var _name = name;
    var _super = new BinaryNode(expression1, expression2);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;
    this.search_variable = _super.search_variable;

    this.name = function () {
        return _name;
    };
};

var Integer = function (value) {
// private attributes
    var _value;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        return '' + value;
    };

    this.type = function () {
        if (_value >= 0) {
            return new Model.IntegerType('N');
        } else {
            return new Model.IntegerType('Z');
        }
    };

// private methods
    var init = function (value) {
        _value = value;
    };

    init(value);
};

var Real = function (value) {
// private attributes
    var _value;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        return '' + value;
    };

    this.type = function () {
        return new Model.RealType('R');
    };

// private methods
    var init = function (value) {
        _value = value;
    };

    init(value);
};

var Infinity = function () {
// private attributes
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        return '+inf';
    };
};

var EmptySet = function () {
// private attributes
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        return 'empty_set';
    };
};

var Set = function (values) {
// private attributes
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        var str = '{ ';

        for (var i = 0; i < _values.length; ++i) {
            str += _values[i].to_string();
            if (i !== _values.length - 1) {
                str += ', ';
            } else {
                str += ' ';
            }
        }
        str += '}';
        return str;
    };

    this.values = function () {
        return _values;
    };

// private attributes
    var _values = values;
};

var Variable = function (name, type) {
// private attributes
    var _name;
    var _type;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.name = function () {
        return _name;
    };

    this.search_variable = function (variable) {
        return _name === variable;
    };

    this.to_string = function () {
        return '' + name;
    };

    this.type = function () {
        return _type;
    };

// private methods
    var init = function (name, type) {
        _name = name;
        _type = type;
    };

    init(name, type);
};

var SetVariable = function (name, position, type) {
// private attributes
    var _name;
    var _position;
    var _type;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.name = function () {
        return _name;
    };

    this.position = function () {
        return _position;
    };

    this.search_variable = function (variable) {
        return _name === variable;
    };

    this.to_string = function () {
        if (position) {
            return _name + '.' + _position;
        } else {
            return '[' + _name + ']';
        }
    };

    this.type = function () {
        return _type;
    };

// private methods
    var init = function (name, position, type) {
        _name = name;
        _position = position;
        _type = type;
    };

    init(name, position, type);
};

var Constant = function (value) {
// private attributes
    var _value;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.search_variable = function (variable) {
        return false;
    };

    this.to_string = function () {
        return '' + value;
    };

    this.value = function () {
        return _value;
    };

// private methods
    var init = function (value) {
        _value = value;
    };

    init(value);
};

var ArithmeticExpression = function (child) {
// private attributes
    var _super = new UnaryNode(child);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return 'ArithmeticExpression';
    };

    this.search_variable = function (variable) {
        return this.get(1).search_variable(variable);
    };

    this.type = function () {
        return this.get(1).type();
    };
};

var Default = function () {
// public methods
    this.name = function () {
        return 'default';
    };
};

var And = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return 'and';
    };
};

var Or = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return 'or';
    };
};

var Not = function (child) {
// private attributes
    var _super = new UnaryNode(child);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return 'not';
    };
};

var Equal = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '=';
    };
};

var NotEqual = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '<>';
    };
};

var GreaterThan = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '>';
    };
};

var GreaterThanOrEqual = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '>=';
    };
};

var LowerThan = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '<';
    };
};

var LowerThanOrEqual = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return '<=';
    };
};

var ConditionalExpression = function (root) {
// private attributes
    var _super = new UnaryNode(root);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

    this.name = function () {
        return 'ConditionalExpression';
    };
};

if (typeof exports !== 'undefined') {
    exports.ArithmeticExpression = ArithmeticExpression;
    exports.Add = Add;
    exports.Sub = Sub;
    exports.Mult = Mult;
    exports.Div = Div;
    exports.Integer = Integer;
    exports.Real = Real;
    exports.Infinity = Infinity;
    exports.EmptySet = EmptySet;
    exports.Set = Set;
    exports.Variable = Variable;
    exports.SetVariable = SetVariable;
    exports.Constant = Constant;
    exports.Bracket = Bracket;
    exports.Function = Function;
    exports.Function2 = Function2;
    exports.ConditionalExpression = ConditionalExpression;
    exports.Default = Default;
    exports.Equal = Equal;
    exports.NotEqual = NotEqual;
    exports.Not = Not;
    exports.And = And;
    exports.Or = Or;
    exports.GreaterThan = GreaterThan;
    exports.GreaterThanOrEqual = GreaterThanOrEqual;
    exports.LowerThan = LowerThan;
    exports.LowerThanOrEqual = LowerThanOrEqual;
}
