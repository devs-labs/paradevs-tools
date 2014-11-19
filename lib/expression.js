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

    this.name = function () {
        return '+';
    };
};

var Sub = function (left, right) {
// private attributes
    var _super = new BinaryNode(left, right);

// public methods
    this.arity = _super.arity;
    this.get = _super.get;

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

    this.to_string = function () {
        return '' + value;
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

    this.to_string = function () {
        return '' + value;
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

    this.to_string = function () {
        return '+inf';
    };
};

var EmptySet = function () {
// private attributes
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.to_string = function () {
        return 'empty_set';
    };
};

var Variable = function (name) {
// private attributes
    var _name;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.to_string = function () {
        return '' + name;
    };

    this.name = function () {
        return _name;
    };

// private methods
    var init = function (name) {
        _name = name;
    };

    init(name);
};

var SetVariable = function (name, position) {
// private attributes
    var _name;
    var _position;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

    this.to_string = function () {
        if (position) {
            return _name + '.' + _position;
        } else {
            return '[' + _name + ']';
        }
    };

    this.name = function () {
        return _name;
    };

    this.position = function () {
        return _position;
    };

// private methods
    var init = function (name, position) {
        _name = name;
        _position = position;
    };

    init(name, position);
};

var Constant = function (value) {
// private attributes
    var _value;
    var _super = new Litteral();

// public methods
    this.arity = _super.arity;

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
