var AtomicGenerator = require('./atomic_generator');

var CoupledGenerator = function (formalism, target, file) {
// public methods
    this.parse = function (generator) {
        var parser = require('./../formalisms/' + formalism + '/coupled').generate();
        var source = require('fs').readFileSync(require('path').normalize('./projects/' + formalism + '/' + file), "utf8");

        parser.yy.Model = require('./../formalisms/' + formalism + '/model');
        parser.yy.SuperModel = require('./model');
        parser.yy.Expression = require('./expression');

        var model = parser.parse(source);

        model.type(file.split('.')[0]);
        generator.add_model(model);
        for (var i = 0; i < model.sub_models().length; ++i) {
            var type = model.sub_models()[i].type();

            if (!generator.model(type)) {
                if (model.sub_models()[i].is_atomic()) {
                    (new AtomicGenerator.AtomicGenerator(formalism, target, type + '.atomic')).parse(generator);
                } else {
                    (new CoupledGenerator(formalism, target, type + '.coupled')).parse(generator);
                }
            }
        }
        return model;
    };
};

if (typeof exports !== 'undefined') {
    exports.CoupledGenerator = CoupledGenerator;
}
