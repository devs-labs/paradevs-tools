exports.main = function main() {
    var parser = require('./formalisms/' + process.argv[2] + '/generator').generate();
    var source = require('fs').readFileSync(require('path').normalize('./examples/' + process.argv[2] + '/' + process.argv[4]), "utf8");

    parser.yy.Model = require('./formalisms/' + process.argv[2] + '/model');
    parser.yy.Expression = require('./lib/expression');
    parser.yy.Translator = require('./formalisms/' + process.argv[2] + '/translators/' + process.argv[3] + '_translator');
    parser.yy.model = null;
    parser.parse(source);
};

if (require.main === module)
    exports.main();