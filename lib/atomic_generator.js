var AtomicGenerator = function (formalism, target, file) {
// public methods
    this.parse = function (generator) {
        var parser = require('./../formalisms/' + formalism + '/atomic').generate();
        var source = require('fs').readFileSync(require('path').normalize('./projects/' + formalism + '/' + file), "utf8");

        parser.yy.Model = require('./../formalisms/' + formalism + '/model');
        parser.yy.SuperModel = require('./model');
        parser.yy.Expression = require('./expression');

        var model = parser.parse(source);

        model.type(file.split('.')[0]);
        generator.add_model(model);
        return model;
    };
};

if (typeof exports !== 'undefined') {
    exports.AtomicGenerator = AtomicGenerator;
}
