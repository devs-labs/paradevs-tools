var fs = require('fs');
var AtomicGenerator = require('./lib/atomic_generator');
var CoupledGenerator = require('./lib/coupled_generator');

exports.main = function main() {
    if (process.argv.length > 2) {
        var file = process.argv[2];

        if (file) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) throw err;
                var project = JSON.parse(data);
                var generator;

                if (project.root.split('.')[1] === 'atomic') {
                    generator = new AtomicGenerator.AtomicGenerator(project.formalism, project.target, project.root);
                } else if (project.root.split('.')[1] === 'coupled') {
                    generator = new CoupledGenerator.CoupledGenerator(project.formalism, project.target, project.root);
                }
                if (generator) {
                    generator.generate();
                }
            });
        }
    }
};

if (require.main === module)
    exports.main();