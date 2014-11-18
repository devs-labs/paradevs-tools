var Expression = require('./../../../lib/expression');

var Translator = function (model) {
// public methods
    this.code = function () {
        return _code;
    };

    this.translate = function () {
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