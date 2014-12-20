"use strict";

exports['pdevs_init'] = function (test) {
    var parser = require('./../../../formalisms/pdevs/atomic').generate();
    var source = 'name : Passive; parameters : { } in_ports: { } out_ports: { } state: { } init: { } ' +
        'delta_int: { } delta_ext: { } delta_conf: { } ' +
        'ta: { () -> +inf [default] } output: { }';

    parser.yy.Model = require('./../../../formalisms/pdevs/model');
    parser.yy.SuperModel = require('./../../../lib/model');
    parser.yy.Expression = require('./../../../lib/expression');

    var model = parser.parse(source);

    test.done();
};