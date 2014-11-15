exports.main = function main() {
    var parser = require('./formalisms/' + process.argv[2] + '/generator').generate();
    var source = require('fs').readFileSync(require('path').normalize('./examples/' + process.argv[2] + '/' + process.argv[4]), "utf8");

    parser.yy.Model = require('./formalisms/' + process.argv[2] + '/model');
    parser.yy.Expression = require('./lib/expression');

    var model = parser.parse(source);
    var Checker = require('./formalisms/' + process.argv[2] + '/checker');
    var checker = new Checker(model);

    try {
        checker.check();

        var Translator = require('./formalisms/' + process.argv[2] + '/translators/' + process.argv[3] + '_translator');
        var translator = new Translator(model);
        translator.translate();
        console.log(translator.code());
    } catch (e) {
        console.log(e);
    }
};

if (require.main === module)
    exports.main();