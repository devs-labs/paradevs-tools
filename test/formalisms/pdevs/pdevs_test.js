"use strict";

var testCase = require('nodeunit').testCase;

module.exports = testCase({
    "pdevs_passive_model": testCase({
        "model test": function (test) {
            var parser = require('./../../../formalisms/pdevs/atomic').generate();
            var source = 'name : Passive; parameters : { } in_ports: { } out_ports: { } state: { } init: { } ' +
                'delta_int: { } delta_ext: { } delta_conf: { } ' +
                'ta: { () -> +inf [default] } output: { }';

            parser.yy.Model = require('./../../../formalisms/pdevs/model');
            parser.yy.SuperModel = require('./../../../lib/model');
            parser.yy.Expression = require('./../../../lib/expression');

            var model = parser.parse(source);

            test.equal(model.name(), 'Passive');
            test.equal(model.in_ports().length, 0);
            test.equal(model.out_ports().length, 0);
            test.equal(model.state().size(), 0);
            test.equal(model.delta_conf_functions().length, 0);
            test.equal(model.delta_ext_functions().length, 0);
            test.equal(model.delta_int_functions().length, 0);
            test.equal(model.ta_functions().length, 1);
            test.equal(model.ta_function(0).state().size(), 0);
            test.ok(model.ta_function(0).condition().get(1) instanceof parser.yy.Expression.Default);
            test.ok(model.ta_function(0).expression().get(1) instanceof parser.yy.Expression.Infinity);
            test.equal(model.output_functions().length, 0);
            test.done();
        }
    })
});