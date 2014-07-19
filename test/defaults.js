/* Test that the routes return expected data */
var Lab = require('lab');
var server, appSource, jsSource, cssSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var MoonbootsHapi = require('..');

var moonboots_hapi_options = {
    developmentMode: true,
    moonboots: {
        main: __dirname + '/../sample/app/app.js',
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};
var moonboots_options = {
    main: __dirname + '/../sample/app/app.js',
    cssFileName: 'app',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var moonboots = new Moonboots(moonboots_options);

Lab.experiment('default happy path tests', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.register([{
                    plugin: MoonbootsHapi,
                    options: moonboots_hapi_options
                }], next);
            },
            getSource: function (next) {
                appSource = moonboots.htmlSource();
                next();
            },
            getJs: function (next) {
                moonboots.jsSource(function _getJsSource(err, js) {
                    jsSource = js;
                    next(err);
                });
            },
            getCss: function (next) {
                moonboots.cssSource(function _getCssSource(err, css) {
                    cssSource = css;
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
    });
    Lab.test('serves app where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(appSource, 'application source');
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app.nonCached.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(jsSource, 'js source');
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/app.nonCached.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(cssSource, 'css source');
            done();
        });
    });
    Lab.test('clientConfig is exposed', function (done) {
        server.plugins.moonboots_hapi.clientConfig(0, function (config) {
            Lab.expect(config, 'client config').to.equal(moonboots_hapi_options, 'moonboots-hapi config');
            done();
        });
    });
    Lab.test('clientApp is exposed', function (done) {
        server.plugins.moonboots_hapi.clientApp(0, function (clientApp) {
            Lab.expect(clientApp, 'client app').to.be.instanceOf(Moonboots);
            done();
        });
    });
});
