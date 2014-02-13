#!/usr/bin/env node

var nodeunit = require('nodeunit');
var reporter = nodeunit.reporters['default'];
var glob = require('glob');

if (process.env.NODE_ENV !== 'test') {
    process.stderr.write('Will only run from test environment\n');
    process.exit(1);
}

reporter.run(glob.sync('./tests/*.js'));
