var fs = require('fs');
var AtomicGenerator = require('./lib/atomic_generator');
var CoupledGenerator = require('./lib/coupled_generator');

var Generator = function (project) {
// public methods
    this.add_model = function (model) {
        _models[model.type()] = model;
    };

    this.check = function () {
        var Checker = require('./formalisms/' + project.formalism + '/checker');

        for (var name in _models) {
            var checker = new Checker(_models[name]);

            try {
                checker.check();
            } catch (e) {
                console.log(e);
            }
        }
    };

    this.generate = function () {
        var Translator = require('./translators/' + project.target + '/' + project.formalism + '/translator');

        for (var name in _models) {
            var translator = new Translator(_models[name], this);

            translator.translate();
            translator.write_to(project.output);
        }
    };

    this.model = function (type) {
        return _models[type];
    };

    this.parse = function () {
        _generator.parse(this);
    };

// private methods
    var init = function (project) {
        if (project.root.split('.')[1] === 'atomic') {
            _generator = new AtomicGenerator.AtomicGenerator(project.formalism, project.target, project.root);
        } else if (project.root.split('.')[1] === 'coupled') {
            _generator = new CoupledGenerator.CoupledGenerator(project.formalism, project.target, project.root);
        }
        _models = {};
    };

// private attribute
    var _generator;
    var _models;

    init(project);
};

exports.main = function main() {
    if (process.argv.length > 2) {
        var file = process.argv[2];

        if (file) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) throw err;
                var project = JSON.parse(data);
                var generator = new Generator(project);

                generator.parse();
                generator.check();
                generator.generate();
            });
        }
    }
};

if (require.main === module)
    exports.main();