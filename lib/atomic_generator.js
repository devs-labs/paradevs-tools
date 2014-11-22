var AtomicGenerator = function (formalism, target, file) {
// public methods
    this.generate = function () {
        var parser = require('./../formalisms/' + formalism + '/atomic').generate();
        var source = require('fs').readFileSync(require('path').normalize('./examples/' + formalism + '/' + file), "utf8");

        parser.yy.Model = require('./../formalisms/' + formalism + '/model');
        parser.yy.SuperModel = require('./model');
        parser.yy.Expression = require('./expression');

        var model = parser.parse(source);
        var Checker = require('./../formalisms/' + formalism + '/checker');
        var checker = new Checker(model);

//        try {
            checker.check();

            var Translator = require('./../translators/' + target + '/' + formalism + '/translator');
            var translator = new Translator(model);
            translator.translate();
            console.log(translator.code());
/*        } catch (e) {
            console.log(e);
        } */
    }
};

if (typeof exports !== 'undefined') {
    exports.AtomicGenerator = AtomicGenerator;
}
