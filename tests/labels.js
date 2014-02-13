/*Test that label parameters are honored*/
var pack, server3001, server3002, appSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var moonboots_options = {
    appPath: '/app',
    jsFileName: 'moonboots-hapi-js',
    cssFileName: 'moonboots-hapi-css',
    main: __dirname + '/../sample/app/app.js',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ],
    labels: ['foo']
};
var moonboots = new Moonboots(moonboots_options);

module.exports = {
    setUp: function (done) {
        async.parallel({
            pack: function (next) {
                pack = new Hapi.Pack();
                //TODO clean up once https://github.com/spumko/hapi/pull/1425 is merged
                //server3001 = pack.server(3001, {labels: ['foo']});
                //server3002 = pack.server(3002, {labels: ['bar']});
                server3001 = new Hapi.Server('localhost', 3001, {labels: ['foo']});
                server3002 = new Hapi.Server('localhost', 3002, {labels: ['bar']});
                pack._server(server3001);
                pack._server(server3002);
                pack.require({'..': moonboots_options }, next);
            },
            getSource: function (next) {
                moonboots.getResult('html', function _getSource(err, html) {
                    appSource = html;
                    next(err);
                });
            }
        }, function (err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    },
    tearDown: function (next) {
        next();
    },
    matchingLabel: function (test) {
        test.expect(2);
        server3001.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            test.equal(res.statusCode, 200);
            test.equal(res.payload, appSource);
            test.done();
        });
    },
    nonmatchingLabel: function (test) {
        test.expect(1);
        server3002.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            test.equal(res.statusCode, 404);
            test.done();
        });
    }
};
